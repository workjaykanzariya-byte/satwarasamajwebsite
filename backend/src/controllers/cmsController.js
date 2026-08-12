const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/auditLogger');

// --- NEWS ---
const getNews = async (req, res, next) => {
  try {
    const news = await prisma.news.findMany({
      orderBy: { publishedDate: 'desc' },
    });
    return res.json({ success: true, news });
  } catch (error) {
    next(error);
  }
};

const createNews = async (req, res, next) => {
  try {
    const { titleGu, titleEn, contentGu, contentEn, featuredImage } = req.body;
    const item = await prisma.news.create({
      data: { titleGu, titleEn, contentGu, contentEn, featuredImage },
    });

    await logAudit({
      adminId: req.admin.id,
      adminName: req.admin.name,
      action: 'CREATE_NEWS',
      entity: 'News',
      entityId: item.id,
      details: `Created news item ${titleEn}`,
      req,
    });

    return res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

const updateNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titleGu, titleEn, contentGu, contentEn, featuredImage } = req.body;
    const item = await prisma.news.update({
      where: { id: parseInt(id, 10) },
      data: { titleGu, titleEn, contentGu, contentEn, featuredImage },
    });

    return res.json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

const deleteNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.news.delete({
      where: { id: parseInt(id, 10) },
    });

    return res.json({ success: true, message: 'News item deleted.' });
  } catch (error) {
    next(error);
  }
};

// --- GALLERY ALBUMS ---
const getGallery = async (req, res, next) => {
  try {
    const albums = await prisma.galleryAlbum.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, albums });
  } catch (error) {
    next(error);
  }
};

// --- DOWNLOADS ---
const getDownloads = async (req, res, next) => {
  try {
    const downloads = await prisma.download.findMany({
      orderBy: { publishedDate: 'desc' },
    });
    return res.json({ success: true, downloads });
  } catch (error) {
    next(error);
  }
};

// --- COMMITTEE MEMBERS ---
const getCommittee = async (req, res, next) => {
  try {
    const members = await prisma.committeeMember.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return res.json({ success: true, members });
  } catch (error) {
    next(error);
  }
};

const createCommitteeMember = async (req, res, next) => {
  try {
    const { nameGu, nameEn, designationGu, designationEn, bioGu, bioEn, photoPath, displayOrder, isActive } = req.body;
    const member = await prisma.committeeMember.create({
      data: {
        nameGu,
        nameEn,
        designationGu,
        designationEn,
        bioGu,
        bioEn,
        photoPath,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder, 10) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return res.status(201).json({ success: true, member });
  } catch (error) {
    next(error);
  }
};

const updateCommitteeMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nameGu, nameEn, designationGu, designationEn, bioGu, bioEn, photoPath, displayOrder, isActive } = req.body;

    const member = await prisma.committeeMember.update({
      where: { id: parseInt(id, 10) },
      data: {
        nameGu,
        nameEn,
        designationGu,
        designationEn,
        bioGu,
        bioEn,
        photoPath,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder, 10) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return res.json({ success: true, member });
  } catch (error) {
    next(error);
  }
};

const deleteCommitteeMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.committeeMember.delete({
      where: { id: parseInt(id, 10) },
    });

    return res.json({ success: true, message: 'Committee member deleted.' });
  } catch (error) {
    next(error);
  }
};

// --- PUBLICATIONS (DARPAN) ---
const getPublications = async (req, res, next) => {
  try {
    const publications = await prisma.publication.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, publications });
  } catch (error) {
    next(error);
  }
};

const createPublication = async (req, res, next) => {
  try {
    const { titleGu, titleEn, month, year, coverImage, pdfFile, isPublished } = req.body;
    const pub = await prisma.publication.create({
      data: {
        titleGu,
        titleEn,
        month,
        year,
        coverImage,
        pdfFile: pdfFile || '/documents/sample.pdf',
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      },
    });

    return res.status(201).json({ success: true, publication: pub });
  } catch (error) {
    next(error);
  }
};

const updatePublication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titleGu, titleEn, month, year, coverImage, pdfFile, isPublished } = req.body;
    const pub = await prisma.publication.update({
      where: { id: parseInt(id, 10) },
      data: { titleGu, titleEn, month, year, coverImage, pdfFile, isPublished },
    });

    return res.json({ success: true, publication: pub });
  } catch (error) {
    next(error);
  }
};

const deletePublication = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.publication.delete({
      where: { id: parseInt(id, 10) },
    });

    return res.json({ success: true, message: 'Publication deleted.' });
  } catch (error) {
    next(error);
  }
};

// --- STATIC PAGES ---
const getPageBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const page = await prisma.page.findUnique({ where: { slug } });
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found.' });
    }
    return res.json({ success: true, page });
  } catch (error) {
    next(error);
  }
};

// --- SETTINGS ---
const getSettings = async (req, res, next) => {
  try {
    const settings = await prisma.setting.findMany();
    const map = {};
    settings.forEach((s) => (map[s.key] = s.value));
    return res.json({ success: true, settings: map });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const settings = req.body; // Expect { key: value, key2: value2 }
    for (const [key, value] of Object.entries(settings)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    const all = await prisma.setting.findMany();
    const map = {};
    all.forEach((s) => (map[s.key] = s.value));

    return res.json({ success: true, settings: map });
  } catch (error) {
    next(error);
  }
};

// --- QR CODE IMAGE UPLOAD FOR MAHA DAN ---
const uploadQRCode = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No QR image file uploaded.' });
    }

    const qrImagePath = `/uploads/${req.file.filename}`;

    // Save path as a setting
    await prisma.setting.upsert({
      where: { key: 'mahadan_qr_image' },
      update: { value: qrImagePath },
      create: { key: 'mahadan_qr_image', value: qrImagePath },
    });

    return res.json({
      success: true,
      message: 'QR code image uploaded and saved successfully.',
      qrImagePath,
    });
  } catch (error) {
    next(error);
  }
};

// --- ENQUIRIES / TEMPORARY ACCOMMODATION REQUESTS ---
const createEnquiry = async (req, res, next) => {
  try {
    const { enquiryType, name, mobile, email, city, subject, message, hostelType, checkInDate, checkOutDate } = req.body;
    const enquiry = await prisma.enquiry.create({
      data: {
        enquiryType: enquiryType || 'GENERAL',
        name,
        mobile,
        email,
        city,
        subject,
        message,
        hostelType,
        checkInDate: checkInDate ? new Date(checkInDate) : null,
        checkOutDate: checkOutDate ? new Date(checkOutDate) : null,
      },
    });

    return res.status(201).json({ success: true, message: 'Your enquiry has been received.', enquiry });
  } catch (error) {
    next(error);
  }
};

const getEnquiries = async (req, res, next) => {
  try {
    const enquiries = await prisma.enquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, enquiries });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNews,
  createNews,
  updateNews,
  deleteNews,
  getPublications,
  createPublication,
  updatePublication,
  deletePublication,
  getGallery,
  getDownloads,
  getCommittee,
  createCommitteeMember,
  updateCommitteeMember,
  deleteCommitteeMember,
  getPageBySlug,
  getSettings,
  updateSettings,
  uploadQRCode,
  createEnquiry,
  getEnquiries,
};
