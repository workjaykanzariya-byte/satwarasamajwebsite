const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const Razorpay = require('razorpay');

// Helper to get Razorpay instance if keys are configured
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (key_id && key_secret && key_id !== 'your_razorpay_key_id') {
    return new Razorpay({ key_id, key_secret });
  }
  return null;
};

const fs = require('fs');
const path = require('path');

// Helper to save Base64 image string to uploads directory
const saveBase64ToFile = (base64Str, prefix) => {
  if (!base64Str || typeof base64Str !== 'string') return null;
  if (!base64Str.startsWith('data:image/')) return base64Str; // Already a URL path

  try {
    const matches = base64Str.match(/^data:image\/([a-zA-Z0-9+.=-]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;

    let ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    if (ext.includes('svg')) ext = 'svg';
    if (ext.includes('png')) ext = 'png';
    if (ext.includes('webp')) ext = 'webp';

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const fileName = `${prefix}_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}.${ext}`;
    const uploadsDir = path.resolve(__dirname, '../../uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/${fileName}`;
  } catch (err) {
    console.error('Failed to save base64 file to disk:', err);
    return null;
  }
};

/**
 * Submit QR Code UPI Payment Proof
 */
const submitQRPayment = async (req, res, next) => {
  try {
    const { donorName, mobile, email, amount, donorPhoto, paymentScreenshot, transactionId, message } = req.body;

    if (!donorName || !amount || !paymentScreenshot) {
      return res.status(400).json({
        success: false,
        message: 'Donor Name, Amount, and Payment Screenshot proof are required.',
      });
    }

    const donorMobile = mobile && mobile.trim() ? mobile.trim() : 'N/A';
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid donation amount.',
      });
    }

    // Save image files to disk to prevent database packet overflow
    const savedScreenshotPath = saveBase64ToFile(paymentScreenshot, 'screenshot') || paymentScreenshot;
    const savedPhotoPath = donorPhoto ? (saveBase64ToFile(donorPhoto, 'photo') || donorPhoto) : null;

    // Generate unique Certificate Number e.g. MD-2026-8819
    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    const certificateNo = `MD-2026-${uniqueNum}`;

    // Create database entry in UNDER_VERIFICATION status
    const donation = await prisma.mahaDan.create({
      data: {
        certificateNo,
        donorName,
        mobile: donorMobile,
        email: email || null,
        photoPath: savedPhotoPath,
        amount: parsedAmount,
        paymentMode: 'UPI_QR',
        transactionId: transactionId || `UTR-${Date.now()}`,
        paymentScreenshot: savedScreenshotPath,
        verificationStatus: 'UNDER_VERIFICATION',
        paymentStatus: 'PENDING',
        message: message || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Payment proof submitted successfully! Verification pending by trust admin.',
      donationId: donation.id,
      certificateNo: donation.certificateNo,
      verificationStatus: 'UNDER_VERIFICATION',
      amount: parsedAmount,
      donorName,
      photoPath: donation.photoPath,
      createdAt: donation.createdAt,
    });
  } catch (error) {
    console.error('MahaDan QR submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to submit payment proof at this moment. Please check your network connection or try again.',
    });
  }
};

/**
 * Public Track Donation & Certificate Status by Reference ID / Mobile
 */
const trackDonationStatus = async (req, res, next) => {
  try {
    const { query } = req.params;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a Reference ID or Mobile Number.' });
    }

    const cleanQuery = query.trim();

    // Search by certificateNo, mobile, or transactionId
    const donations = await prisma.mahaDan.findMany({
      where: {
        OR: [
          { certificateNo: cleanQuery },
          { mobile: cleanQuery },
          { transactionId: cleanQuery },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!donations || donations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No donation record found for the provided Reference ID or Mobile Number.',
      });
    }

    return res.json({
      success: true,
      donation: donations[0],
      allDonations: donations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Verify & Approve / Reject QR Code Payment
 */
const verifyDonationByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body; // 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status. Must be APPROVED or REJECTED.' });
    }

    const donation = await prisma.mahaDan.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation record not found.' });
    }

    const updatedDonation = await prisma.mahaDan.update({
      where: { id: donation.id },
      data: {
        verificationStatus: status,
        paymentStatus: status === 'APPROVED' ? 'SUCCESS' : 'FAILED',
        rejectionReason: status === 'REJECTED' ? (rejectionReason || 'Payment screenshot could not be verified by Admin.') : null,
      },
    });

    return res.json({
      success: true,
      message: status === 'APPROVED' 
        ? 'Donation approved & Honor Certificate Card activated!' 
        : 'Donation status updated to Rejected.',
      donation: updatedDonation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate Maha Dan Order (Razorpay compatibility)
 */
const createDonationOrder = async (req, res, next) => {
  try {
    const { donorName, mobile, email, amount, message } = req.body;

    if (!donorName || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Donor Name and Amount are required fields.',
      });
    }

    const donorMobile = mobile && mobile.trim() ? mobile.trim() : 'N/A';
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid donation amount.',
      });
    }

    let photoPath = null;
    if (req.file) {
      photoPath = `/uploads/${req.file.filename}`;
    }

    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    const certificateNo = `MD-2026-${uniqueNum}`;

    const donation = await prisma.mahaDan.create({
      data: {
        donorName,
        mobile: donorMobile,
        email: email || null,
        photoPath,
        amount: parsedAmount,
        paymentStatus: 'PENDING',
        verificationStatus: 'UNDER_VERIFICATION',
        certificateNo,
        message: message || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Donation order created successfully.',
      donationId: donation.id,
      certificateNo: donation.certificateNo,
      amount: parsedAmount,
      donorName,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Certificate details by Certificate Number (Public)
 */
const getCertificateDetails = async (req, res, next) => {
  try {
    const { certificateNo } = req.params;
    const donation = await prisma.mahaDan.findUnique({
      where: { certificateNo },
    });

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Maha Dan Certificate not found.' });
    }

    return res.json({
      success: true,
      donation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get All Maha Dan Contributions
 */
const getAdminDonations = async (req, res, next) => {
  try {
    const { search, status } = req.query;

    const where = {};
    if (status) {
      where.verificationStatus = status;
    }

    if (search) {
      where.OR = [
        { donorName: { contains: search } },
        { mobile: { contains: search } },
        { certificateNo: { contains: search } },
        { transactionId: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const donations = await prisma.mahaDan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const approvedDonations = donations.filter((d) => d.verificationStatus === 'APPROVED' || d.paymentStatus === 'SUCCESS');
    const totalAmount = approvedDonations.reduce((sum, d) => sum + d.amount, 0);
    const totalDonors = approvedDonations.length;
    const pendingVerifications = donations.filter((d) => d.verificationStatus === 'UNDER_VERIFICATION').length;

    return res.json({
      success: true,
      stats: {
        totalAmount,
        totalDonors,
        pendingVerifications,
      },
      donations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get Single Donation Record by ID
 */
const getAdminDonationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const donation = await prisma.mahaDan.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation record not found.' });
    }

    return res.json({ success: true, donation });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete Single Donation Record
 */
const deleteDonation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.mahaDan.findUnique({ where: { id: parseInt(id, 10) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Donation record not found.' });
    }
    await prisma.mahaDan.delete({
      where: { id: parseInt(id, 10) },
    });
    return res.json({ success: true, message: 'Donation record deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Bulk Delete Multiple Donation Records
 */
const bulkDeleteDonations = async (req, res, next) => {
  try {
    const { ids } = req.body; // expects { ids: [1, 2, 3, ...] }
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of IDs to delete.' });
    }
    const intIds = ids.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
    const result = await prisma.mahaDan.deleteMany({
      where: { id: { in: intIds } },
    });
    return res.json({ success: true, message: `${result.count} donation record(s) deleted successfully.`, count: result.count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitQRPayment,
  trackDonationStatus,
  verifyDonationByAdmin,
  createDonationOrder,
  getCertificateDetails,
  getAdminDonations,
  getAdminDonationById,
  deleteDonation,
  bulkDeleteDonations,
};

