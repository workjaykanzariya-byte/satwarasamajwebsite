const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'satvara_mandal_super_secret_jwt_key_2026';

const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, permissions: true, isActive: true },
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid or inactive admin account.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    // SUPER_ADMIN has access to everything
    if (req.admin.role === 'SUPER_ADMIN' || allowedRoles.includes(req.admin.role)) {
      return next();
    }

    return res.status(403).json({ success: false, message: 'Permission denied. Insufficient role privileges.' });
  };
};

const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    if (req.admin.role === 'SUPER_ADMIN') {
      return next();
    }

    let userPerms = [];
    try {
      userPerms = req.admin.permissions ? JSON.parse(req.admin.permissions) : [];
    } catch (e) {
      userPerms = [];
    }

    if (userPerms.includes(permissionKey) || userPerms.includes('all')) {
      return next();
    }

    return res.status(403).json({ success: false, message: `Access denied. You do not have permission for '${permissionKey}'.` });
  };
};

module.exports = { authenticateAdmin, authorizeRoles, requirePermission };
