const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/auditLogger');

const JWT_SECRET = process.env.JWT_SECRET || 'satvara_mandal_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or inactive account.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role, name: admin.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    await logAudit({
      adminId: admin.id,
      adminName: admin.name,
      action: 'LOGIN',
      entity: 'Admin',
      entityId: admin.id,
      details: 'Admin logged in successfully',
      req,
    });

    return res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions ? JSON.parse(admin.permissions) : null,
        phone: admin.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: { id: true, name: true, email: true, role: true, permissions: true, phone: true, isActive: true },
    });
    return res.json({
      success: true,
      admin: {
        ...admin,
        permissions: admin.permissions ? JSON.parse(admin.permissions) : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: newHash },
    });

    await logAudit({
      adminId: admin.id,
      adminName: admin.name,
      action: 'CHANGE_PASSWORD',
      entity: 'Admin',
      entityId: admin.id,
      details: 'Changed account password',
      req,
    });

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const admins = await prisma.admin.findMany({
      select: { id: true, name: true, email: true, role: true, permissions: true, phone: true, isActive: true, lastLogin: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const parsedAdmins = admins.map(a => ({
      ...a,
      permissions: a.permissions ? JSON.parse(a.permissions) : null,
    }));

    return res.json({ success: true, users: parsedAdmins });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, permissions } = req.body;
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Admin user with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const permissionsStr = Array.isArray(permissions) ? JSON.stringify(permissions) : (permissions || null);

    const newUser = await prisma.admin.create({
      data: {
        name,
        email,
        password: passwordHash,
        role: role || 'VIEWER',
        phone,
        permissions: permissionsStr,
      },
    });

    await logAudit({
      adminId: req.admin.id,
      adminName: req.admin.name,
      action: 'CREATE_USER',
      entity: 'Admin',
      entityId: newUser.id,
      details: `Created admin user ${email} with role ${role}`,
      req,
    });

    return res.status(201).json({
      success: true,
      user: {
        ...newUser,
        permissions: newUser.permissions ? JSON.parse(newUser.permissions) : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, phone, permissions, isActive } = req.body;

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (role) dataToUpdate.role = role;
    if (typeof isActive === 'boolean') dataToUpdate.isActive = isActive;
    if (permissions !== undefined) {
      dataToUpdate.permissions = Array.isArray(permissions) ? JSON.stringify(permissions) : (permissions || null);
    }
    if (password && password.trim() !== '') {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.admin.update({
      where: { id: parseInt(id, 10) },
      data: dataToUpdate,
    });

    await logAudit({
      adminId: req.admin.id,
      adminName: req.admin.name,
      action: 'UPDATE_USER',
      entity: 'Admin',
      entityId: id,
      details: `Updated user details for ${updated.email}`,
      req,
    });

    return res.json({
      success: true,
      user: {
        ...updated,
        permissions: updated.permissions ? JSON.parse(updated.permissions) : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminIdNum = parseInt(id, 10);

    if (adminIdNum === req.admin.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    const targetAdmin = await prisma.admin.findUnique({ where: { id: adminIdNum } });
    if (!targetAdmin) {
      return res.status(404).json({ success: false, message: 'Admin user not found.' });
    }

    await prisma.admin.delete({ where: { id: adminIdNum } });

    await logAudit({
      adminId: req.admin.id,
      adminName: req.admin.name,
      action: 'DELETE_USER',
      entity: 'Admin',
      entityId: id,
      details: `Deleted admin user ${targetAdmin.email}`,
      req,
    });

    return res.json({ success: true, message: 'Admin user deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  me,
  changePassword,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
