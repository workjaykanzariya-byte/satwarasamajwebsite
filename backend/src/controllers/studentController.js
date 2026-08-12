const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/auditLogger');

const getStudents = async (req, res, next) => {
  try {
    const { search, hostelId, status = 'ACTIVE' } = req.query;

    const whereClause = { status };
    if (hostelId) {
      whereClause.hostelId = parseInt(hostelId, 10);
    }

    if (search) {
      whereClause.OR = [
        { studentCode: { contains: search } },
        { application: { applicationNumber: { contains: search } } },
        { application: { applicantDetails: { firstName: { contains: search } } } },
        { application: { applicantDetails: { lastName: { contains: search } } } },
        { application: { applicantDetails: { mobile: { contains: search } } } },
      ];
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        hostel: { select: { id: true, name: true, type: true } },
        bed: { include: { room: { include: { floor: true } } } },
        application: {
          include: { applicantDetails: true, academicDetails: true, familyDetails: true },
        },
        allotments: {
          orderBy: { allottedAt: 'desc' },
          include: { hostel: true, bed: { include: { room: true } } },
        },
        feePayments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, students });
  } catch (error) {
    next(error);
  }
};

const getStudentUnallocated = async (req, res, next) => {
  try {
    const unallocated = await prisma.student.findMany({
      where: { bedId: null, status: 'ACTIVE' },
      include: {
        application: {
          include: { applicantDetails: true, academicDetails: true },
        },
      },
    });

    return res.json({ success: true, unallocated });
  } catch (error) {
    next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { result, joiningDate, expiringDate, status } = req.body;
    const studentIdNum = parseInt(id, 10);

    const updated = await prisma.student.update({
      where: { id: studentIdNum },
      data: {
        ...(result !== undefined && { result }),
        ...(joiningDate && { joiningDate: new Date(joiningDate) }),
        ...(expiringDate !== undefined && { expiringDate: expiringDate ? new Date(expiringDate) : null }),
        ...(status && { status }),
      },
    });

    await logAudit({
      adminId: req.admin.id,
      adminName: req.admin.name,
      action: 'UPDATE_STUDENT_PROFILE',
      entity: 'Student',
      entityId: id,
      details: `Updated student details (result: ${result}, expiringDate: ${expiringDate})`,
      req,
    });

    return res.json({ success: true, student: updated });
  } catch (error) {
    next(error);
  }
};

// Automatic Cron / On-Demand Check to vacate beds when expiringDate has passed
const checkAndDeallocateExpiredStays = async (req, res, next) => {
  try {
    const now = new Date();
    const expiredStudents = await prisma.student.findMany({
      where: {
        status: 'ACTIVE',
        expiringDate: { lte: now },
        bedId: { not: null },
      },
      include: {
        bed: true,
      },
    });

    const deallocatedList = [];

    for (const student of expiredStudents) {
      if (student.bedId) {
        // Mark Bed as VACANT
        await prisma.bed.update({
          where: { id: student.bedId },
          data: { status: 'VACANT' },
        });

        // Close allotment history
        await prisma.bedAllotment.updateMany({
          where: { studentId: student.id, vacatedAt: null },
          data: { vacatedAt: now, remarks: 'Auto-deallocated due to stay expiry date' },
        });
      }

      // Update student record
      await prisma.student.update({
        where: { id: student.id },
        data: {
          status: 'EXITED',
          checkoutDate: now,
          bedId: null,
          roomId: null,
        },
      });

      deallocatedList.push({
        studentId: student.id,
        studentCode: student.studentCode,
        expiringDate: student.expiringDate,
        bedLabel: student.bed ? student.bed.bedLabel : null,
      });

      await logAudit({
        adminId: req.admin ? req.admin.id : null,
        adminName: req.admin ? req.admin.name : 'SYSTEM_CRON',
        action: 'AUTO_DEALLOCATE_EXPIRED_STAY',
        entity: 'Student',
        entityId: student.id,
        details: `Auto-vacated bed stay expired on ${student.expiringDate}`,
      });
    }

    if (res) {
      return res.json({
        success: true,
        message: `Processed expired stay check. ${deallocatedList.length} beds auto-vacated.`,
        deallocatedCount: deallocatedList.length,
        deallocatedStudents: deallocatedList,
      });
    }

    return deallocatedList;
  } catch (error) {
    if (next) next(error);
    else console.error('Auto deallocate error:', error);
  }
};

module.exports = {
  getStudents,
  getStudentUnallocated,
  updateStudent,
  checkAndDeallocateExpiredStays,
};
