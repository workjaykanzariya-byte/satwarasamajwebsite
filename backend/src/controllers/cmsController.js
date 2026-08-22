const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/auditLogger');
const { saveBase64ToFile, formatMediaUrl } = require('../utils/fileHelper');

// --- NEWS ---
const getNews = async (req, res, next) => {
  try {
    const rawNews = await prisma.news.findMany({
      orderBy: { publishedDate: 'desc' },
    });
    const news = rawNews.map((n) => ({
      ...n,
      featuredImage: formatMediaUrl(n.featuredImage),
      pdfAttachment: formatMediaUrl(n.pdfAttachment),
    }));
    return res.json({ success: true, news });
  } catch (error) {
    next(error);
  }
};

const createNews = async (req, res, next) => {
  try {
    let { titleGu, titleEn, contentGu, contentEn, featuredImage } = req.body;
    
    // Save base64 image to physical file in uploads
    if (featuredImage) {
      featuredImage = saveBase64ToFile(featuredImage, 'news');
    }

    const item = await prisma.news.create({
      data: { titleGu, titleEn, contentGu, contentEn, featuredImage },
    });

    if (req.admin) {
      await logAudit({
        adminId: req.admin.id,
        adminName: req.admin.name,
        action: 'CREATE_NEWS',
        entity: 'News',
        entityId: item.id,
        details: `Created news item ${titleEn || titleGu}`,
        req,
      });
    }

    return res.status(201).json({ success: true, item });
  } catch (error) {
    console.error('Error creating news:', error);
    next(error);
  }
};

const updateNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { titleGu, titleEn, contentGu, contentEn, featuredImage } = req.body;

    if (featuredImage) {
      featuredImage = saveBase64ToFile(featuredImage, 'news');
    }

    const item = await prisma.news.update({
      where: { id: parseInt(id, 10) },
      data: { titleGu, titleEn, contentGu, contentEn, featuredImage },
    });

    return res.json({ success: true, item });
  } catch (error) {
    console.error('Error updating news:', error);
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
    const rawMembers = await prisma.committeeMember.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    const members = rawMembers.map((m) => ({
      ...m,
      photoPath: formatMediaUrl(m.photoPath),
    }));
    return res.json({ success: true, members });
  } catch (error) {
    next(error);
  }
};

const createCommitteeMember = async (req, res, next) => {
  try {
    let { nameGu, nameEn, designationGu, designationEn, bioGu, bioEn, photoPath, displayOrder, isActive } = req.body;
    
    // Save base64 photo to physical file in uploads
    if (photoPath) {
      photoPath = saveBase64ToFile(photoPath, 'committee');
    }

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
    console.error('Error creating committee member:', error);
    next(error);
  }
};

const updateCommitteeMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { nameGu, nameEn, designationGu, designationEn, bioGu, bioEn, photoPath, displayOrder, isActive } = req.body;

    if (photoPath) {
      photoPath = saveBase64ToFile(photoPath, 'committee');
    }

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
    console.error('Error updating committee member:', error);
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
    const rawPublications = await prisma.publication.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    const publications = rawPublications.map((p) => ({
      ...p,
      coverImage: formatMediaUrl(p.coverImage),
      pdfFile: formatMediaUrl(p.pdfFile),
      displayOrder: p.displayOrder !== undefined ? p.displayOrder : 1,
    }));
    return res.json({ success: true, publications });
  } catch (error) {
    next(error);
  }
};

const createPublication = async (req, res, next) => {
  try {
    let { titleGu, titleEn, month, year, coverImage, pdfFile, displayOrder, isPublished } = req.body;
    
    // Save base64 cover image & PDF document
    if (coverImage) {
      coverImage = saveBase64ToFile(coverImage, 'darpan_cover');
    }
    if (pdfFile) {
      pdfFile = saveBase64ToFile(pdfFile, 'darpan_doc');
    }

    const pub = await prisma.publication.create({
      data: {
        titleGu,
        titleEn,
        month,
        year,
        coverImage,
        pdfFile: pdfFile || '/documents/sample.pdf',
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder, 10) : 1,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      },
    });

    return res.status(201).json({ success: true, publication: pub });
  } catch (error) {
    console.error('Error creating publication:', error);
    next(error);
  }
};

const updatePublication = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { titleGu, titleEn, month, year, coverImage, pdfFile, displayOrder, isPublished } = req.body;

    if (coverImage) {
      coverImage = saveBase64ToFile(coverImage, 'darpan_cover');
    }
    if (pdfFile) {
      pdfFile = saveBase64ToFile(pdfFile, 'darpan_doc');
    }

    const pub = await prisma.publication.update({
      where: { id: parseInt(id, 10) },
      data: {
        titleGu,
        titleEn,
        month,
        year,
        coverImage,
        pdfFile,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder, 10) : undefined,
        isPublished,
      },
    });

    return res.json({ success: true, publication: pub });
  } catch (error) {
    console.error('Error updating publication:', error);
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
    settings.forEach((s) => {
      if (s.key.includes('photo') || s.key.includes('image') || s.key.includes('file') || s.key.includes('qr')) {
        map[s.key] = formatMediaUrl(s.value);
      } else {
        map[s.key] = s.value;
      }
    });
    return res.json({ success: true, settings: map });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const settings = req.body; // Expect { key: value, key2: value2 }
    for (let [key, value] of Object.entries(settings)) {
      if (typeof value === 'string' && value.startsWith('data:')) {
        value = saveBase64ToFile(value, `setting_${key}`);
      }
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
    console.error('Error updating settings:', error);
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

// --- GENERAL MEDIA FILE UPLOAD (FOR HIGH-RES IMAGES & LARGE PDFS) ---
const uploadMediaFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file was uploaded.' });
    }
    const fileUrl = `/api/v1/uploads/${req.file.filename}`;
    return res.json({
      success: true,
      message: 'File uploaded successfully.',
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });
  } catch (error) {
    console.error('Upload media file error:', error);
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
  uploadMediaFile,
  createEnquiry,
  getEnquiries,
};

