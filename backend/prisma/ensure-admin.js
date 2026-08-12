const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('📦 Creating/synchronizing Prisma database tables...');
  try {
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      env: process.env,
    });
    console.log('✅ Prisma database schema synchronized successfully!');
  } catch (err) {
    console.error('⚠️ Warning during db push:', err.message);
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
