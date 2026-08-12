const prisma = require('../utils/prisma');

const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuditLogs };
