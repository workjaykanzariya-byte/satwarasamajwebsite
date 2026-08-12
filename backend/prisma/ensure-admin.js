const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('📦 Ensuring database tables exist via Prisma...');
  try {
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
  } catch (err) {
    console.warn('⚠️ Warning: Prisma db push step note:', err.message);
  }

  console.log('🔍 Verifying default admin user in database...');
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@satvara.org' },
    update: {},
    create: {
      name: 'Super Administrator',
      email: 'admin@satvara.org',
      password: passwordHash,
      role: 'SUPER_ADMIN',
      phone: '9876543210',
      isActive: true,
    },
  });
  console.log(`✅ Default admin user verified: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Admin verification error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
