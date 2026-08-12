const path = require('path');
const fs = require('fs');
const prisma = require('../utils/prisma');

const serveDocument = async (req, res, next) => {
  try {
    const { docId } = req.params;
    const document = await prisma.applicationDocument.findUnique({
      where: { id: parseInt(docId, 10) },
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const absolutePath = path.resolve(document.filePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: 'Physical file not found on server.' });
    }

    return res.sendFile(absolutePath);
  } catch (error) {
    next(error);
  }
};

module.exports = { serveDocument };
