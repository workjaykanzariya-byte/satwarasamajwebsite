const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/auditLogger');

// 1. Generate Merit List automatically based on percentages
const generateMeritList = async (req, res, next) => {
  try {
    const { title, hostelType, academicYear, cutoffCount = 20 } = req.body;

    const applications = await prisma.application.findMany({
      where: {
        hostelType: hostelType || 'BOYS',
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED'] },
      },
      include: {
        academicDetails: true,
        applicantDetails: true,
      },
    });

    if (applications.length === 0) {
      return res.status(400).json({ success: false, message: 'No eligible applications found for merit list generation.' });
    }

    const sortedApps = applications.sort((a, b) => {
      const pctA = a.academicDetails?.lastExamPercentage || a.academicDetails?.hscPercentage || 0;
      const pctB = b.academicDetails?.lastExamPercentage || b.academicDetails?.hscPercentage || 0;
      return pctB - pctA;
    });

    const meritList = await prisma.meritList.create({
      data: {
        title: title || `${hostelType} Hostel Official Merit List ${academicYear || '2026-2027'}`,
        hostelType: hostelType || 'BOYS',
        academicYear: academicYear || '2026-2027',
        isPublished: false,
      },
    });

    const entries = sortedApps.map((app, index) => {
      const rank = index + 1;
      const pct = app.academicDetails?.lastExamPercentage || app.academicDetails?.hscPercentage || 0;
      const status = rank <= cutoffCount ? 'SELECTED' : 'WAITLISTED';

      return {
        meritListId: meritList.id,
        applicationId: app.id,
        rank,
        category: 'General',
        totalMarksPct: pct,
        status,
      };
    });

    await prisma.meritListEntry.createMany({ data: entries });

    await logAudit({
      adminId: req.admin.id,
      adminName: req.admin.name,
      action: 'GENERATE_MERIT_LIST',
      entity: 'MeritList',
      entityId: meritList.id,
      details: `Generated merit list ${meritList.title} with ${entries.length} applicants`,
      req,
    });

    return res.status(201).json({ success: true, meritListId: meritList.id });
  } catch (error) {
    next(error);
  }
};

// 2. Create Custom Merit List (Admin Upload)
const createCustomMeritList = async (req, res, next) => {
  try {
    const { title, hostelType, academicYear, isPublished } = req.body;

    const pdfFile = req.file ? `/uploads/${req.file.filename}` : null;

    const meritList = await prisma.meritList.create({
      data: {
        title,
        hostelType: hostelType || 'BOYS',
        academicYear: academicYear || '2026-2027',
        isPublished: isPublished === 'true' || isPublished === true,
        publishedAt: (isPublished === 'true' || isPublished === true) ? new Date() : null,
      },
    });

    // Also optionally save PDF download to downloads table if file uploaded
    if (pdfFile) {
      await prisma.download.create({
        data: {
          titleGu: title,
          titleEn: title,
          category: 'MERIT_LIST',
          filePath: pdfFile,
        },
      });
    }

    await logAudit({
      adminId: req.admin.id,
      adminName: req.admin.name,
      action: 'CREATE_CUSTOM_MERIT_LIST',
      entity: 'MeritList',
      entityId: meritList.id,
      details: `Created custom merit list ${title}`,
      req,
    });

    return res.status(201).json({ success: true, meritList });
  } catch (error) {
    next(error);
  }
};

// 3. Publish / Unpublish Merit List
const publishMeritList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mId = parseInt(id, 10);

    const existing = await prisma.meritList.findUnique({ where: { id: mId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Merit list not found.' });
    }

    const newPublishState = !existing.isPublished;

    const meritList = await prisma.meritList.update({
      where: { id: mId },
      data: {
        isPublished: newPublishState,
        publishedAt: newPublishState ? new Date() : null,
      },
      include: { entries: true },
    });

    // Update status of SELECTED applicants in application table & auto-create student records
    if (newPublishState) {
      for (const entry of meritList.entries) {
        if (entry.status === 'SELECTED') {
          await prisma.application.update({
            where: { id: entry.applicationId },
            data: { status: 'SELECTED' },
          });

          const existingStudent = await prisma.student.findUnique({ where: { applicationId: entry.applicationId } });
          if (!existingStudent) {
            const studentCode = `STU-${new Date().getFullYear()}-${String(entry.applicationId).padStart(3, '0')}`;
            await prisma.student.create({
              data: {
                applicationId: entry.applicationId,
                studentCode,
                status: 'ACTIVE',
              },
            });
          }
        }
      }
    }

    await logAudit({
      adminId: req.admin.id,
      adminName: req.admin.name,
      action: newPublishState ? 'PUBLISH_MERIT_LIST' : 'UNPUBLISH_MERIT_LIST',
      entity: 'MeritList',
      entityId: mId,
      details: `${newPublishState ? 'Published' : 'Unpublished'} merit list #${mId}`,
      req,
    });

    return res.json({ success: true, message: `Merit list ${newPublishState ? 'published' : 'unpublished'} successfully.`, meritList });
  } catch (error) {
    next(error);
  }
};

// 4. Delete Merit List
const deleteMeritList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mId = parseInt(id, 10);

    await prisma.meritList.delete({ where: { id: mId } });

    await logAudit({
      adminId: req.admin.id,
      adminName: req.admin.name,
      action: 'DELETE_MERIT_LIST',
      entity: 'MeritList',
      entityId: mId,
      details: `Deleted merit list #${mId}`,
      req,
    });

    return res.json({ success: true, message: 'Merit list deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// 5. Get Public Published Merit Lists
const getPublicMeritLists = async (req, res, next) => {
  try {
    const meritLists = await prisma.meritList.findMany({
      where: { isPublished: true },
      include: {
        entries: {
          orderBy: { rank: 'asc' },
          include: {
            application: {
              select: {
                applicationNumber: true,
                applicantDetails: { select: { firstName: true, lastName: true, city: true } },
                academicDetails: { select: { courseName: true } },
              },
            },
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });

    return res.json({ success: true, meritLists });
  } catch (error) {
    next(error);
  }
};

// 6. Get Admin Merit Lists
const getAdminMeritLists = async (req, res, next) => {
  try {
    const meritLists = await prisma.meritList.findMany({
      include: {
        entries: {
          orderBy: { rank: 'asc' },
          include: {
            application: {
              include: { applicantDetails: true, academicDetails: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, meritLists });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateMeritList,
  createCustomMeritList,
  publishMeritList,
  deleteMeritList,
  getPublicMeritLists,
  getAdminMeritLists,
};
