const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/auditLogger');

// Generate unique receipt number
const generateReceiptNo = async () => {
  const count = await prisma.feePayment.count();
  const year = new Date().getFullYear();
  return `REC-${year}-${String(count + 1001).padStart(4, '0')}`;
};

const recordFeePayment = async (req, res, next) => {
  try {
    const { studentId, applicationId, amount, paymentMode, paymentType, remarks } = req.body;

    const receiptNo = await generateReceiptNo();

    const payment = await prisma.feePayment.create({
      data: {
        studentId: studentId ? parseInt(studentId, 10) : null,
        applicationId: applicationId ? parseInt(applicationId, 10) : null,
        receiptNo,
        amount: parseFloat(amount),
        paymentMode: paymentMode || 'CASH',
        paymentType: paymentType || 'ADMISSION_FEE',
        status: 'PAID',
        remarks,
      },
      include: {
        student: { include: { application: { include: { applicantDetails: true } } } },
      },
    });

    await logAudit({
      adminId: req.admin.id,
      adminName: req.admin.name,
      action: 'RECORD_FEE_PAYMENT',
      entity: 'FeePayment',
      entityId: payment.id,
      details: `Recorded fee payment of ₹${amount} (Receipt: ${receiptNo})`,
      req,
    });

    return res.status(201).json({ success: true, message: 'Payment recorded successfully.', payment });
  } catch (error) {
    next(error);
  }
};

const getFeePayments = async (req, res, next) => {
  try {
    const payments = await prisma.feePayment.findMany({
      include: {
        student: {
          include: { application: { include: { applicantDetails: true } } },
        },
        application: {
          include: { applicantDetails: true },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });

    return res.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
};

const getFeeStructures = async (req, res, next) => {
  try {
    const structures = await prisma.feeStructure.findMany({
      include: { hostel: true },
    });

    return res.json({ success: true, structures });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordFeePayment,
  getFeePayments,
  getFeeStructures,
};
