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

    const donorMobile = mobile && mobile.trim() ? mobile.trim() : '';
    if (!donorMobile || donorMobile.length !== 10 || !/^\d{10}$/.test(donorMobile)) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number must be exactly 10 digits (મોબાઈલ નંબર ૧૦ અંકનો હોવો જોઈએ).',
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 500) {
      return res.status(400).json({
        success: false,
        message: 'Minimum donation amount must be ₹500 (દાનની રકમ ઓછામાં ઓછી ₹500 હોવી જોઈએ).',
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

    // Fetch display offset settings
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['mahadan_display_extra_amount', 'mahadan_display_extra_donors'],
        },
      },
    });

    const settingsMap = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const displayExtraAmount = parseFloat(settingsMap['mahadan_display_extra_amount'] || '0') || 0;
    const displayExtraDonors = parseInt(settingsMap['mahadan_display_extra_donors'] || '0', 10) || 0;

    return res.json({
      success: true,
      stats: {
        totalAmount,
        totalDonors,
        pendingVerifications,
        displayExtraAmount,
        displayExtraDonors,
        frontendTotalAmount: totalAmount + displayExtraAmount,
        frontendTotalDonors: totalDonors + displayExtraDonors,
      },
      donations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update Frontend Display Offset Settings for Total Donation & Donors
 */
const updateDisplaySettings = async (req, res, next) => {
  try {
    const { extraAmount, extraDonors } = req.body;

    const parsedExtraAmount = parseFloat(extraAmount) || 0;
    const parsedExtraDonors = parseInt(extraDonors, 10) || 0;

    await prisma.setting.upsert({
      where: { key: 'mahadan_display_extra_amount' },
      update: { value: String(parsedExtraAmount) },
      create: { key: 'mahadan_display_extra_amount', value: String(parsedExtraAmount) },
    });

    await prisma.setting.upsert({
      where: { key: 'mahadan_display_extra_donors' },
      update: { value: String(parsedExtraDonors) },
      create: { key: 'mahadan_display_extra_donors', value: String(parsedExtraDonors) },
    });

    return res.json({
      success: true,
      message: 'Frontend display donation settings updated successfully!',
      displayExtraAmount: parsedExtraAmount,
      displayExtraDonors: parsedExtraDonors,
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

/**
 * Public: Get Total Maha Dan Statistics (Approved amount & donor count + Admin offset settings)
 */
const getPublicStats = async (req, res, next) => {
  try {
    const donations = await prisma.mahaDan.findMany({
      where: {
        OR: [
          { verificationStatus: 'APPROVED' },
          { paymentStatus: 'SUCCESS' },
        ],
      },
      select: {
        amount: true,
      },
    });

    const realTotalAmount = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    const realTotalDonors = donations.length;

    // Fetch display offset settings
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['mahadan_display_extra_amount', 'mahadan_display_extra_donors'],
        },
      },
    });

    const settingsMap = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const extraAmount = parseFloat(settingsMap['mahadan_display_extra_amount'] || '0') || 0;
    const extraDonors = parseInt(settingsMap['mahadan_display_extra_donors'] || '0', 10) || 0;

    const totalAmount = realTotalAmount + extraAmount;
    const totalDonors = realTotalDonors + extraDonors;

    return res.json({
      success: true,
      stats: {
        totalAmount,
        totalDonors,
        realTotalAmount,
        realTotalDonors,
        extraAmount,
        extraDonors,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to parse CSV string content into array of row objects
 */
const parseCSV = (csvText) => {
  if (!csvText || typeof csvText !== 'string') return [];
  // Strip UTF-8 BOM if present
  const cleanText = csvText.replace(/^\uFEFF/, '');
  const lines = cleanText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const parseRow = (text) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result.map((val) =>
      val
        .replace(/^"|"$/g, '')
        .replace(/""/g, '"')
        .replace(/^'/, '')
        .trim()
    );
  };

  const headers = parseRow(lines[0]).map((h) =>
    h
      .toLowerCase()
      .replace(/[\/()₹_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push(row);
  }

  return rows;
};

/**
 * Admin: Bulk Import Maha Dan Donors via CSV File or Data
 */
const importCSVDonations = async (req, res, next) => {
  try {
    let csvContent = '';

    if (req.file) {
      csvContent = fs.readFileSync(req.file.path, 'utf8');
    } else if (req.body && req.body.csvData) {
      csvContent = req.body.csvData;
    } else {
      return res.status(400).json({
        success: false,
        message: 'No CSV file or CSV text content uploaded.',
      });
    }

    const rows = parseCSV(csvContent);
    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'The uploaded CSV file is empty or formatted incorrectly.',
      });
    }

    const createdDonations = [];
    const failedRows = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const getField = (...keys) => {
        for (const k of keys) {
          const normKey = k.toLowerCase().replace(/[\/()₹_-]/g, ' ').replace(/\s+/g, ' ').trim();
          if (row[normKey] !== undefined && row[normKey] !== '') {
            return String(row[normKey]).trim();
          }
        }
        return '';
      };

      const donorName = getField('donorName', 'donor name', 'donor_name', 'name', 'full name');
      const amountRaw = getField('amount', 'amount inr', 'amount ₹', 'donationamount', 'donation amount');
      const mobile = getField('mobile', 'mobile number', 'phone', 'contact') || 'N/A';
      const email = getField('email', 'email address') || null;
      let certificateNo = getField('certificateNo', 'certificate no', 'ref id', 'ref id certificate no');
      let transactionId = getField('transactionId', 'transaction id', 'utr', 'utr no', 'transaction utr no');
      const paymentMode = getField('paymentMode', 'payment mode') || 'OFFLINE_IMPORT';
      const verificationStatusRaw = (getField('verificationStatus', 'verification status', 'status') || 'APPROVED').toUpperCase();
      const message = getField('message', 'message notes', 'remarks', 'note') || null;

      // Mandatory Field Validations
      if (!donorName || !donorName.trim()) {
        failedRows.push({ rowNumber: i + 2, reason: 'Donor Name is mandatory.' });
        continue;
      }

      const parsedAmount = parseFloat(amountRaw.replace(/[^\d.]/g, ''));
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        failedRows.push({ rowNumber: i + 2, donorName, reason: 'Valid Donation Amount is mandatory.' });
        continue;
      }

      // Auto-generate Certificate Number if not provided
      if (!certificateNo.trim()) {
        const uniqueNum = Math.floor(10000 + Math.random() * 90000);
        certificateNo = `MD-2026-${uniqueNum}`;
      }

      // Check certificateNo uniqueness
      const existingCert = await prisma.mahaDan.findUnique({ where: { certificateNo } });
      if (existingCert) {
        const uniqueNum = Math.floor(10000 + Math.random() * 90000);
        certificateNo = `MD-2026-${uniqueNum}`;
      }

      if (!transactionId.trim()) {
        transactionId = `IMP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      }

      const validStatus = ['APPROVED', 'UNDER_VERIFICATION', 'REJECTED'].includes(verificationStatusRaw)
        ? verificationStatusRaw
        : 'APPROVED';

      const paymentStatus = validStatus === 'APPROVED' ? 'SUCCESS' : validStatus === 'REJECTED' ? 'FAILED' : 'PENDING';

      try {
        const newDonation = await prisma.mahaDan.create({
          data: {
            certificateNo,
            donorName: donorName.trim(),
            mobile: mobile.trim() ? mobile.trim() : 'N/A',
            email: email && email.trim() ? email.trim() : null,
            amount: parsedAmount,
            paymentMode: paymentMode.trim() ? paymentMode.trim() : 'OFFLINE_IMPORT',
            transactionId,
            verificationStatus: validStatus,
            paymentStatus,
            message: message && message.trim() ? message.trim() : null,
          },
        });
        createdDonations.push(newDonation);
      } catch (err) {
        console.error(`Failed to insert CSV row ${i + 2}:`, err);
        failedRows.push({ rowNumber: i + 2, donorName, reason: err.message || 'Database insert error' });
      }
    }

    // Clean up uploaded file if temporary file on disk
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }

    return res.json({
      success: true,
      message: `CSV Import completed. ${createdDonations.length} donor record(s) imported successfully.${failedRows.length > 0 ? ` ${failedRows.length} row(s) failed.` : ''}`,
      importedCount: createdDonations.length,
      failedCount: failedRows.length,
      failedRows,
    });
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
  updateDisplaySettings,
  getAdminDonationById,
  deleteDonation,
  bulkDeleteDonations,
  getPublicStats,
  importCSVDonations,
};



