const prisma = require('./prisma');

async function logAudit({ adminId, adminName, action, entity, entityId, details, req }) {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : null;
    await prisma.auditLog.create({
      data: {
        adminId: adminId || null,
        adminName: adminName || 'System',
        action,
        entity,
        entityId: entityId ? String(entityId) : null,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        ipAddress,
      },
    });
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
}

module.exports = { logAudit };
