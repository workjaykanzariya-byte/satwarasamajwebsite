const fs = require('fs');
const path = require('path');

const uploadsDir = path.resolve(process.env.UPLOAD_PATH || './uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Checks if a string is a base64 DataURL and saves it to the uploads folder as a physical file.
 * Returns the relative static URL path (/uploads/filename.ext) or the original string if not base64.
 *
 * @param {string} base64Str Base64 Data URL or standard URL
 * @param {string} prefix Prefix for the saved file name (e.g. 'committee', 'news', 'darpan')
 * @returns {string|null} Saved relative URL path or original string
 */
const saveBase64ToFile = (base64Str, prefix = 'file') => {
  if (!base64Str || typeof base64Str !== 'string') return base64Str;
  
  // If it doesn't start with data:, it's already a URL or path
  if (!base64Str.startsWith('data:')) {
    return base64Str;
  }

  try {
    const matches = base64Str.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9+.=-]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Str;
    }

    const mimeType = matches[1].toLowerCase();
    const base64Data = matches[2];

    let ext = '.png';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';
    else if (mimeType.includes('webp')) ext = '.webp';
    else if (mimeType.includes('png')) ext = '.png';
    else if (mimeType.includes('gif')) ext = '.gif';
    else if (mimeType.includes('svg')) ext = '.svg';
    else if (mimeType.includes('pdf')) ext = '.pdf';
    else if (mimeType.includes('csv')) ext = '.csv';

    const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${safePrefix}_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);

    return `/uploads/${fileName}`;
  } catch (err) {
    console.error(`Failed to save base64 file for prefix [${prefix}]:`, err);
    return base64Str;
  }
};

module.exports = {
  saveBase64ToFile,
};
