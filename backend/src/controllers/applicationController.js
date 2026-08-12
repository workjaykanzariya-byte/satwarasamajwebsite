const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/auditLogger');

// Generate unique application number (SAT-2026-XXXX)
const generateApplicationNumber = async () => {
  const count = await prisma.application.count();
  const year = new Date().getFullYear();
  const num = String(count + 1001).padStart(4, '0');
  return `SAT-${year}-${num}`;
};

// 1. Send OTP (Simulated/Ready for SMS Integration)
const sendMobileOtp = async (req, res, next) => {
  try {
    const { mobile } = req.body;
    if (!mobile || mobile.length < 10) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number is required.' });
    }

    // Generate 6-digit OTP (for dev/demo default to 123456 or random)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    await prisma.otpVerification.create({
      data: {
        mobile,
        otpCodeHash: otpHash,
        expiresAt,
        purpose: 'APPLICATION_VERIFY',
      },
    });

    console.log(`📱 OTP generated for ${mobile}: ${otp}`);

    return res.json({
      success: true,
      message: 'OTP sent successfully to registered mobile number.',
      // Included for local testing/demo convenience
      devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Verify OTP
const verifyMobileOtp = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile number and OTP are required.' });
    }

    const record = await prisma.otpVerification.findFirst({
      where: {
        mobile,
        verifiedAt: null,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please request a new OTP.' });
    }

    const isMatch = await bcrypt.compare(otp, record.otpCodeHash);
    if (!isMatch) {
      // Increment attempt count
      await prisma.otpVerification.update({
        where: { id: record.id },
        data: { attemptCount: { increment: 1 } },
      });
      return res.status(400).json({ success: false, message: 'Incorrect OTP. Please try again.' });
    }

    // Mark OTP verified
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { verifiedAt: new Date() },
    });

    return res.json({ success: true, message: 'Mobile number verified successfully.' });
  } catch (error) {
    next(error);
  }
};

// 3. Submit Multi-step Application
const submitApplication = async (req, res, next) => {
  try {
    const body = req.body;

    // Parse JSON sub-objects if passed as form-data
    const applicant = typeof body.applicantDetails === 'string' ? JSON.parse(body.applicantDetails) : body.applicantDetails;
    const family = typeof body.familyDetails === 'string' ? JSON.parse(body.familyDetails) : body.familyDetails;
    const academic = typeof body.academicDetails === 'string' ? JSON.parse(body.academicDetails) : body.academicDetails;
    const hostelPref = typeof body.hostelPreference === 'string' ? JSON.parse(body.hostelPreference) : body.hostelPreference;

    if (!applicant || !family || !academic) {
      return res.status(400).json({ success: false, message: 'Incomplete application details.' });
    }

    const appNumber = await generateApplicationNumber();

    // Create Application transaction
    const application = await prisma.application.create({
      data: {
        applicationNumber: appNumber,
        hostelType: body.hostelType || 'BOYS',
        status: 'SUBMITTED',
        applicantDetails: {
          create: {
            firstName: applicant.firstName,
            middleName: applicant.middleName,
            lastName: applicant.lastName,
            dob: new Date(applicant.dob),
            gender: applicant.gender,
            mobile: applicant.mobile,
            email: applicant.email,
            subCaste: applicant.subCaste || 'Satvara',
            bloodGroup: applicant.bloodGroup,
            permanentAddress: applicant.permanentAddress,
            city: applicant.city,
            district: applicant.district,
            state: applicant.state || 'Gujarat',
            pincode: applicant.pincode,
          },
        },
        familyDetails: {
          create: {
            fatherName: family.fatherName,
            fatherOccupation: family.fatherOccupation,
            fatherMobile: family.fatherMobile,
            motherName: family.motherName,
            guardianName: family.guardianName,
            annualIncome: family.annualIncome ? parseFloat(family.annualIncome) : null,
            emergencyContact: family.emergencyContact,
            familyAddress: family.familyAddress,
          },
        },
        academicDetails: {
          create: {
            courseName: academic.courseName,
            collegeName: academic.collegeName,
            university: academic.university,
            currentYearSem: academic.currentYearSem,
            sscPercentage: academic.sscPercentage ? parseFloat(academic.sscPercentage) : null,
            hscPercentage: academic.hscPercentage ? parseFloat(academic.hscPercentage) : null,
            lastExamPercentage: parseFloat(academic.lastExamPercentage || '0'),
            admissionProofNo: academic.admissionProofNo,
          },
        },
        hostelPreference: {
          create: {
            hostelId: hostelPref?.hostelId ? parseInt(hostelPref.hostelId, 10) : null,
            preferredRoomType: hostelPref?.preferredRoomType || 'DOUBLE',
            expectedJoiningDate: hostelPref?.expectedJoiningDate ? new Date(hostelPref.expectedJoiningDate) : null,
            foodRequired: hostelPref?.foodRequired !== false,
            medicalCondition: hostelPref?.medicalCondition,
            specialRequest: hostelPref?.specialRequest,
          },
        },
      },
      include: {
        applicantDetails: true,
        academicDetails: true,
      },
    });

    // Save uploaded files if any
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const docEntries = req.files.map((file) => {
        let docType = 'OTHER';
        if (file.fieldname.includes('photo')) docType = 'PHOTO';
        else if (file.fieldname.includes('id')) docType = 'ID_PROOF';
        else if (file.fieldname.includes('community')) docType = 'COMMUNITY_PROOF';
        else if (file.fieldname.includes('marksheet')) docType = 'MARKSHEET';
        else if (file.fieldname.includes('college')) docType = 'COLLEGE_PROOF';
        else if (file.fieldname.includes('income')) docType = 'INCOME_PROOF';

        return {
          applicationId: application.id,
          docType,
          fileName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          verificationStatus: 'PENDING',
        };
      });

      await prisma.applicationDocument.createMany({ data: docEntries });
    }

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      applicationNumber: appNumber,
      applicationId: application.id,
    });
  } catch (error) {
    next(error);
  }
};

const trackApplication = async (req, res, next) => {
  try {
    const { applicationNumber, mobile } = req.body;
    const cleanAppNo = applicationNumber ? applicationNumber.trim() : '';
    const cleanMobile = mobile ? mobile.trim() : '';

    if (!cleanAppNo && !cleanMobile) {
      return res.status(400).json({ success: false, message: 'Please provide Application Number or Mobile Number.' });
    }

    const whereConditions = [];
    if (cleanAppNo && cleanMobile) {
      whereConditions.push({
        applicationNumber: cleanAppNo,
        applicantDetails: { mobile: cleanMobile },
      });
    } else if (cleanAppNo) {
      whereConditions.push({ applicationNumber: cleanAppNo });
    } else {
      whereConditions.push({ applicantDetails: { mobile: cleanMobile } });
    }

    const application = await prisma.application.findFirst({
      where: { OR: whereConditions },
      include: {
        applicantDetails: true,
        academicDetails: true,
        documents: true,
        feePayments: true,
        meritEntries: { include: { meritList: true } },
        student: {
          include: {
            hostel: { select: { name: true, address: true, wardenContact: true } },
            bed: { include: { room: true } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'No application record found matching your query.' });
    }

    const statusSteps = [
      { key: 'SUBMITTED', title: 'Application Submitted', done: true, date: application.submittedAt },
      { key: 'UNDER_REVIEW', title: 'Under Office Review', done: ['UNDER_REVIEW', 'VERIFIED', 'SHORTLISTED', 'SELECTED', 'HOSTEL_ALLOTTED', 'JOINED'].includes(application.status) },
      { key: 'VERIFIED', title: 'Documents Verified', done: ['VERIFIED', 'SHORTLISTED', 'SELECTED', 'HOSTEL_ALLOTTED', 'JOINED'].includes(application.status) },
      { key: 'SELECTED', title: 'Merit Selection Confirmed', done: ['SELECTED', 'HOSTEL_ALLOTTED', 'JOINED'].includes(application.status) },
      { key: 'HOSTEL_ALLOTTED', title: 'Hostel Bed Allocated', done: ['HOSTEL_ALLOTTED', 'JOINED'].includes(application.status) },
      { key: 'JOINED', title: 'Joined & Admitted', done: application.status === 'JOINED' },
    ];

    const isPaid = application.feePayments && application.feePayments.some(f => f.status === 'PAID');
    const meritRank = application.meritEntries && application.meritEntries.length > 0 ? application.meritEntries[0].rank : null;

    return res.json({
      success: true,
      application: {
        id: application.id,
        applicationNumber: application.applicationNumber,
        status: application.status,
        submittedAt: application.submittedAt,
        hostelType: application.hostelType,
        applicantName: application.applicantDetails ? `${application.applicantDetails.firstName} ${application.applicantDetails.lastName}` : 'Applicant',
        mobile: application.applicantDetails ? application.applicantDetails.mobile : cleanMobile,
        email: application.applicantDetails ? application.applicantDetails.email : '',
        city: application.applicantDetails ? application.applicantDetails.city : '',
        course: application.academicDetails ? application.academicDetails.courseName : '',
        college: application.academicDetails ? application.academicDetails.collegeName : '',
        meritRank,
        feePaid: isPaid,
        documentsCount: application.documents ? application.documents.length : 0,
        allocatedHostel: application.student?.hostel ? application.student.hostel.name : null,
        allocatedRoom: application.student?.bed?.room ? application.student.bed.room.roomNumber : null,
        allocatedBed: application.student?.bed ? application.student.bed.bedLabel : null,
        wardenContact: application.student?.hostel ? application.student.hostel.wardenContact : null,
        progressSteps: statusSteps,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Get Applications (Admin List)
const getApplications = async (req, res, next) => {
  try {
    const { search, hostelType, status, page = 1, limit = 20 } = req.query;

    const whereClause = {};

    if (hostelType) {
      whereClause.hostelType = hostelType;
    }

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { applicationNumber: { contains: search } },
        { applicantDetails: { firstName: { contains: search } } },
        { applicantDetails: { lastName: { contains: search } } },
        { applicantDetails: { mobile: { contains: search } } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: whereClause,
        include: {
          applicantDetails: true,
          academicDetails: true,
          familyDetails: true,
          documents: true,
          student: true,
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take,
      }),
      prisma.application.count({ where: whereClause }),
    ]);

    return res.json({
      success: true,
      applications,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 6. Get Application Detail by ID (Admin View)
const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await prisma.application.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        applicantDetails: true,
        familyDetails: true,
        academicDetails: true,
        hostelPreference: true,
        documents: true,
        student: {
          include: { hostel: true, bed: { include: { room: true } } },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    return res.json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

// 7. Update Application Status & Auto-Create Student
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const appId = parseInt(id, 10);

    const application = await prisma.application.update({
      where: { id: appId },
      data: { status },
    });

    // Auto-create Student record when status reaches SELECTED or HOSTEL_ALLOTTED
    if (['SELECTED', 'HOSTEL_ALLOTTED'].includes(status)) {
      const existingStudent = await prisma.student.findUnique({ where: { applicationId: appId } });
      if (!existingStudent) {
        const studentCode = `STU-${new Date().getFullYear()}-${String(appId).padStart(3, '0')}`;
        await prisma.student.create({
          data: {
            applicationId: appId,
            studentCode,
            status: 'ACTIVE',
          },
        });
      }
    }

    await logAudit({
      adminId: req.admin.id,
      adminName: req.admin.name,
      action: 'UPDATE_APPLICATION_STATUS',
      entity: 'Application',
      entityId: appId,
      details: `Updated application #${appId} status to ${status}`,
      req,
    });

    return res.json({ success: true, message: `Application status updated to ${status}.`, application });
  } catch (error) {
    next(error);
  }
};

// 8. Verify Document (Admin Action)
const verifyDocument = async (req, res, next) => {
  try {
    const { docId } = req.params;
    const { verificationStatus, rejectionReason } = req.body;

    const doc = await prisma.applicationDocument.update({
      where: { id: parseInt(docId, 10) },
      data: {
        verificationStatus,
        rejectionReason: verificationStatus === 'REJECTED' ? rejectionReason : null,
      },
    });

    await logAudit({
      adminId: req.admin.id,
      adminName: req.admin.name,
      action: 'VERIFY_DOCUMENT',
      entity: 'ApplicationDocument',
      entityId: docId,
      details: `Set document #${docId} status to ${verificationStatus}`,
      req,
    });

    return res.json({ success: true, doc });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMobileOtp,
  verifyMobileOtp,
  submitApplication,
  trackApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  verifyDocument,
};
