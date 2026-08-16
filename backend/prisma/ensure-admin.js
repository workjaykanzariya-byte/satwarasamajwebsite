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

  console.log('🏢 Verifying default hostel facilities in database...');
  const hostelCount = await prisma.hostel.count();
  if (hostelCount === 0) {
    console.log('🌱 Seeding default Satwara hostels into database...');
    await prisma.hostel.create({
      data: {
        name: 'Shree Satwara Boys Hostel',
        type: 'BOYS',
        address: 'Satwara Vidyarthi Bhavan, 13 Panchalnagar Society, Behind Devashya Hospital, Old Wadaj, Ahmedabad',
        city: 'Ahmedabad',
        wardenName: 'Rameshbhai Satvara',
        wardenContact: '+91 98250 12345',
        wardenEmail: 'warden.boys@satvaramahamandal.org',
        totalCapacity: 30,
        description: 'Modern hostel facility for male Satwara students with Wi-Fi, mess, CCTV, and study library.',
        status: true,
      },
    });

    await prisma.hostel.create({
      data: {
        name: 'Shree Satwara Kanya Chhatralaya (Girls Hostel)',
        type: 'GIRLS',
        address: 'Satwara Kanya Bhavan, Nr. Naranpura Bus Stop, Naranpura, Ahmedabad',
        city: 'Ahmedabad',
        wardenName: 'Kanchanben Satvara',
        wardenContact: '+91 98250 67890',
        wardenEmail: 'warden.girls@satvaramahamandal.org',
        totalCapacity: 12,
        description: 'Secure and peaceful hostel environment for female Satwara students with 24/7 security and home-style nutritious mess.',
        status: true,
      },
    });

    await prisma.hostel.create({
      data: {
        name: 'Shree Satwara Hostel, Anand (V.V. Nagar)',
        type: 'BOYS',
        address: 'Satwara Chhatralaya, Near Railway Station / Campus Area, Vallabh Vidyanagar, Anand - 388120',
        city: 'Anand / V.V. Nagar',
        wardenName: 'Pravinbhai Satvara',
        wardenContact: '+91 98790 54321',
        wardenEmail: 'warden.anand@satvaramahamandal.org',
        totalCapacity: 12,
        description: 'Modern hostel facility in Vallabh Vidyanagar (Anand) for Satwara students pursuing Higher Education, Engineering, and Pharmacy.',
        status: true,
      },
    });
    console.log('✅ Default hostels created successfully!');
  }
}

main()
  .catch((e) => {
    console.error('❌ Admin verification error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
