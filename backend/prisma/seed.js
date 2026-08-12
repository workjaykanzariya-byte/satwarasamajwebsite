const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Satvara Samaj database seeding...');

  // 1. Create Default Admin User
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
  // 2. Clear & Create Hostels, Buildings, Floors, Rooms & Beds
  await prisma.bedAllotment.deleteMany({});
  await prisma.bed.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.floor.deleteMany({});
  await prisma.building.deleteMany({});
  await prisma.feeStructure.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.hostel.deleteMany({});

  const boysHostel = await prisma.hostel.create({
    data: {
      name: 'Shree Satwara Boys Hostel',
      type: 'BOYS',
      address: 'Satwara Vidyarthi Bhavan, 13 Panchalnagar Society, Behind Devashya Hospital, Old Wadaj, Ahmedabad',
      city: 'Ahmedabad',
      wardenName: 'Rameshbhai Satvara',
      wardenContact: '+91 98250 12345',
      wardenEmail: 'warden.boys@satvaramahamandal.org',
      totalCapacity: 60,
      description: 'Modern hostel facility for male Satwara students with Wi-Fi, mess, CCTV, and study library.',
      image: '/images/boys-hostel.jpg',
      status: true,
    },
  });

  const girlsHostel = await prisma.hostel.create({
    data: {
      name: 'Shree Satwara Kanya Chhatralaya (Girls Hostel)',
      type: 'GIRLS',
      address: 'Satwara Kanya Bhavan, Nr. Naranpura Bus Stop, Naranpura, Ahmedabad',
      city: 'Ahmedabad',
      wardenName: 'Kanchanben Satvara',
      wardenContact: '+91 98250 67890',
      wardenEmail: 'warden.girls@satvaramahamandal.org',
      totalCapacity: 40,
      description: 'Secure and peaceful hostel environment for female Satwara students with 24/7 security and home-style nutritious mess.',
      image: '/images/girls-hostel.jpg',
      status: true,
    },
  });

  const anandHostel = await prisma.hostel.create({
    data: {
      name: 'Shree Satwara Hostel, Anand (V.V. Nagar)',
      type: 'BOYS',
      address: 'Satwara Chhatralaya, Near Railway Station / Campus Area, Vallabh Vidyanagar, Anand - 388120',
      city: 'Anand / V.V. Nagar',
      wardenName: 'Pravinbhai Satvara',
      wardenContact: '+91 98790 54321',
      wardenEmail: 'warden.anand@satvaramahamandal.org',
      totalCapacity: 30,
      description: 'Modern hostel facility in Vallabh Vidyanagar (Anand) for Satwara students pursuing Higher Education, Engineering, and Pharmacy.',
      image: '/images/anand-hostel.jpg',
      status: true,
    },
  });

  // Create Boys Hostel Structure (Main Wing, 3 Floors, 4 Rooms per floor, 4 Beds per room)
  const boysBuilding = await prisma.building.create({
    data: {
      hostelId: boysHostel.id,
      name: 'Main Wing',
      description: '3-story residential block',
    },
  });

  const floorNames = ['Ground Floor', '1st Floor', '2nd Floor'];
  let totalBoysBeds = 0;

  for (let fIdx = 0; fIdx < floorNames.length; fIdx++) {
    const floor = await prisma.floor.create({
      data: {
        hostelId: boysHostel.id,
        buildingId: boysBuilding.id,
        name: floorNames[fIdx],
        floorNumber: fIdx,
      },
    });

    for (let r = 1; r <= 4; r++) {
      const roomNum = `${fIdx * 100 + 100 + r}`;
      const room = await prisma.room.create({
        data: {
          floorId: floor.id,
          hostelId: boysHostel.id,
          roomNumber: roomNum,
          roomType: r % 2 === 0 ? 'DOUBLE' : 'TRIPLE',
          bedCount: r % 2 === 0 ? 2 : 3,
          status: 'ACTIVE',
        },
      });

      const bedLabels = r % 2 === 0 ? ['A', 'B'] : ['A', 'B', 'C'];
      for (const label of bedLabels) {
        await prisma.bed.create({
          data: {
            roomId: room.id,
            hostelId: boysHostel.id,
            bedLabel: `${roomNum}-${label}`,
            status: 'VACANT',
          },
        });
        totalBoysBeds++;
      }
    }
  }

  // Update total capacity
  await prisma.hostel.update({
    where: { id: boysHostel.id },
    data: { totalCapacity: totalBoysBeds },
  });

  // Create Girls Hostel Structure
  const girlsBuilding = await prisma.building.create({
    data: {
      hostelId: girlsHostel.id,
      name: 'Kanya Block A',
    },
  });

  let totalGirlsBeds = 0;
  for (let fIdx = 0; fIdx < 2; fIdx++) {
    const floor = await prisma.floor.create({
      data: {
        hostelId: girlsHostel.id,
        buildingId: girlsBuilding.id,
        name: `${fIdx + 1}st Floor`,
        floorNumber: fIdx + 1,
      },
    });

    for (let r = 1; r <= 3; r++) {
      const roomNum = `${(fIdx + 1) * 100 + r}`;
      const room = await prisma.room.create({
        data: {
          floorId: floor.id,
          hostelId: girlsHostel.id,
          roomNumber: roomNum,
          roomType: 'DOUBLE',
          bedCount: 2,
          status: 'ACTIVE',
        },
      });

      for (const label of ['A', 'B']) {
        await prisma.bed.create({
          data: {
            roomId: room.id,
            hostelId: girlsHostel.id,
            bedLabel: `${roomNum}-${label}`,
            status: 'VACANT',
          },
        });
        totalGirlsBeds++;
      }
    }
  }

  await prisma.hostel.update({
    where: { id: girlsHostel.id },
    data: { totalCapacity: totalGirlsBeds },
  });

  // Create Anand Hostel Structure
  const anandBuilding = await prisma.building.create({
    data: {
      hostelId: anandHostel.id,
      name: 'Vidyanagar Block A',
    },
  });

  let totalAnandBeds = 0;
  for (let fIdx = 0; fIdx < 2; fIdx++) {
    const floor = await prisma.floor.create({
      data: {
        hostelId: anandHostel.id,
        buildingId: anandBuilding.id,
        name: `${fIdx + 1}st Floor`,
        floorNumber: fIdx + 1,
      },
    });

    for (let r = 1; r <= 3; r++) {
      const roomNum = `A-${(fIdx + 1) * 100 + r}`;
      const room = await prisma.room.create({
        data: {
          floorId: floor.id,
          hostelId: anandHostel.id,
          roomNumber: roomNum,
          roomType: 'DOUBLE',
          bedCount: 2,
          status: 'ACTIVE',
        },
      });

      for (const label of ['1', '2']) {
        await prisma.bed.create({
          data: {
            roomId: room.id,
            hostelId: anandHostel.id,
            bedLabel: `${roomNum}-${label}`,
            status: 'VACANT',
          },
        });
        totalAnandBeds++;
      }
    }
  }

  await prisma.hostel.update({
    where: { id: anandHostel.id },
    data: { totalCapacity: totalAnandBeds },
  });

  console.log(`✅ Boys Hostel: ${totalBoysBeds} beds. Girls Hostel: ${totalGirlsBeds} beds. Anand Hostel: ${totalAnandBeds} beds.`);

  // 3. Create Sample Application & Student with Assigned Bed
  let sampleApp = await prisma.application.findUnique({
    where: { applicationNumber: 'SAT-2026-1001' },
  });

  if (!sampleApp) {
    sampleApp = await prisma.application.create({
      data: {
        applicationNumber: 'SAT-2026-1001',
        hostelType: 'BOYS',
        status: 'JOINED',
        applicantDetails: {
          create: {
            firstName: 'Jaykumar',
            middleName: 'Rameshbhai',
            lastName: 'Satvara',
            dob: new Date('2003-05-14'),
            gender: 'Male',
            mobile: '9898012345',
            email: 'jay.satvara@example.com',
            permanentAddress: 'Plot 45, Satvara Nagar, Surendranagar',
            city: 'Surendranagar',
            district: 'Surendranagar',
            state: 'Gujarat',
            pincode: '363001',
          },
        },
        familyDetails: {
          create: {
            fatherName: 'Rameshbhai Satvara',
            fatherOccupation: 'Agriculture / Business',
            fatherMobile: '9825098765',
            emergencyContact: '9825098765',
            annualIncome: 180000,
          },
        },
        academicDetails: {
          create: {
            courseName: 'B.Tech Computer Engineering',
            collegeName: 'L.D. College of Engineering',
            university: 'GTU',
            currentYearSem: '3rd Year / 5th Sem',
            sscPercentage: 88.5,
            hscPercentage: 86.2,
            lastExamPercentage: 84.0,
          },
        },
      },
    });
  }

  // Get first available bed in boys hostel and assign it to student
  const existingStudent = await prisma.student.findUnique({
    where: { applicationId: sampleApp.id },
  });

  if (!existingStudent) {
    const sampleBed = await prisma.bed.findFirst({
      where: { hostelId: boysHostel.id, status: 'VACANT' },
    });

    if (sampleBed) {
      const student = await prisma.student.create({
        data: {
          applicationId: sampleApp.id,
          studentCode: 'STU-2026-001',
          hostelId: boysHostel.id,
          roomId: sampleBed.roomId,
          bedId: sampleBed.id,
          status: 'ACTIVE',
        },
      });

      await prisma.bed.update({
        where: { id: sampleBed.id },
        data: { status: 'OCCUPIED' },
      });

      await prisma.bedAllotment.create({
        data: {
          studentId: student.id,
          bedId: sampleBed.id,
          hostelId: boysHostel.id,
          allottedByAdminId: admin.id,
          remarks: 'Initial merit admission allotment',
        },
      });

      console.log(`✅ Sample Student assigned to Bed ${sampleBed.bedLabel}`);
    }
  }

  // 4. Create Fee Structure
  await prisma.feeStructure.createMany({
    data: [
      { hostelId: boysHostel.id, academicYear: '2026-2027', admissionFee: 2000, monthlyFee: 1500, securityDeposit: 3000, messFee: 2500 },
      { hostelId: girlsHostel.id, academicYear: '2026-2027', admissionFee: 2000, monthlyFee: 1500, securityDeposit: 3000, messFee: 2500 },
      { hostelId: anandHostel.id, academicYear: '2026-2027', admissionFee: 2000, monthlyFee: 1500, securityDeposit: 3000, messFee: 2500 },
    ],
  });

  // 5. Create Committee Members
  await prisma.committeeMember.createMany({
    data: [
      {
        nameGu: 'શ્રી પુરુષોત્તમભાઈ સતવારા',
        nameEn: 'Shri Purshottambhai Satvara',
        designationGu: 'પ્રમુખ શ્રી (President)',
        designationEn: 'President',
        bioGu: 'સમાજ સેવા અને શૈક્ષણિક ઉન્નતિ માટે છેલ્લા ૩૦ વર્ષથી સતત કાર્યરત.',
        bioEn: 'Dedicated to community welfare and education for over 30 years.',
        displayOrder: 1,
        isActive: true,
      },
      {
        nameGu: 'શ્રી મગનભાઈ સતવારા',
        nameEn: 'Shri Maganbhai Satvara',
        designationGu: 'મહામંત્રી શ્રી (General Secretary)',
        designationEn: 'General Secretary',
        bioGu: 'વિદ્યાર્થી છાત્રાલય સંચાલન અને શિષ્યવૃત્તિ યોજનાઓના પ્રણેતા.',
        bioEn: 'Pioneer of student hostel management and scholarship schemes.',
        displayOrder: 2,
        isActive: true,
      },
      {
        nameGu: 'શ્રી રમેશચંદ્ર જી. સતવારા',
        nameEn: 'Shri Rameshchandra G. Satvara',
        designationGu: 'ખજાનચી શ્રી (Treasurer)',
        designationEn: 'Treasurer',
        bioGu: 'નાણાકીય વ્યવસ્થાપન અને પારદર્શક વહીવટના સક્ષમ વડા.',
        bioEn: 'Incharge of financial auditing and transparent execution.',
        displayOrder: 3,
        isActive: true,
      },
      {
        nameGu: 'શ્રીમતી કાન્તાબેન પી. સતવારા',
        nameEn: 'Smt. Kantaben P. Satvara',
        designationGu: 'ટ્રસ્ટી શ્રી (Trustee - Girls Wing)',
        designationEn: 'Trustee - Girls Wing',
        bioGu: 'કન્યા છાત્રાલય સંચાલન અને સુરક્ષા માર્ગદર્શન પૂરું પાડતા માર્ગદર્શક.',
        bioEn: 'Overseeing female education and student welfare initiatives.',
        displayOrder: 4,
        isActive: true,
      },
    ],
  });

  // 6. Create Darpan Publications (Matching Screenshots 4 & 5)
  await prisma.publication.createMany({
    data: [
      {
        titleGu: 'સતવારા દર્પણ-ઓગસ્ટ ૨૦૨૬',
        titleEn: 'Satvara Darpan - August 2026',
        month: 'ઓગસ્ટ',
        year: '૨૦૨૬',
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
        pdfFile: '/documents/darpan-august-2026.pdf',
        isPublished: true,
      },
      {
        titleGu: 'સતવારા દર્પણ-જુલાઈ ૨૦૨૬',
        titleEn: 'Satvara Darpan - July 2026',
        month: 'જુલાઈ',
        year: '૨૦૨૬',
        coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80',
        pdfFile: '/documents/darpan-july-2026.pdf',
        isPublished: true,
      },
      {
        titleGu: 'સતવારા દર્પણ-જૂન ૨૦૨૬',
        titleEn: 'Satvara Darpan - June 2026',
        month: 'જૂન',
        year: '૨૦૨૬',
        coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
        pdfFile: '/documents/darpan-june-2026.pdf',
        isPublished: true,
      },
      {
        titleGu: 'સતવારા દર્પણ-મે ૨૦૨૬',
        titleEn: 'Satvara Darpan - May 2026',
        month: 'મે',
        year: '૨૦૨૬',
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
        pdfFile: '/documents/darpan-may-2026.pdf',
        isPublished: true,
      },
      {
        titleGu: 'સતવારા દર્પણ-એપ્રિલ ૨૦૨૬',
        titleEn: 'Satvara Darpan - April 2026',
        month: 'એપ્રિલ',
        year: '૨૦૨૬',
        coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80',
        pdfFile: '/documents/darpan-april-2026.pdf',
        isPublished: true,
      },
      {
        titleGu: 'સતવારા દર્પણ-માર્ચ ૨૦૨૬',
        titleEn: 'Satvara Darpan - March 2026',
        month: 'માર્ચ',
        year: '૨૦૨૬',
        coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80',
        pdfFile: '/documents/darpan-march-2026.pdf',
        isPublished: true,
      },
      {
        titleGu: 'સતવારા દર્પણ-ફેબ્રુઆરી ૨૦૨૬',
        titleEn: 'Satvara Darpan - February 2026',
        month: 'ફેબ્રુઆરી',
        year: '૨૦૨૬',
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
        pdfFile: '/documents/darpan-february-2026.pdf',
        isPublished: true,
      },
    ],
  });

  // 7. Create News Items
  await prisma.news.createMany({
    data: [
      {
        titleGu: 'શૈક્ષણિક વર્ષ ૨૦૨૬-૨૭ માટે છાત્રાલય પ્રવેશ ફોર્મ પ્રક્રિયા શરૂ',
        titleEn: 'Hostel Admission Process Begins for Academic Year 2026-27',
        contentGu: 'શ્રી સતવારા મહામંડળ દ્વારા અમદાવાદ સ્થિત બોયઝ, ગર્લ્સ તથા આણંદ (વી.વી. નગર) હોસ્ટેલ માટે ઓનલાઇન પ્રવેશ અરજીઓ મંગાવવામાં આવે છે. છેલ્લી તારીખ ૩૧ ઓગસ્ટ ૨૦૨૬ છે.',
        contentEn: 'Shree Satwara Maha Mandal invites online applications for Ahmedabad Boys/Girls Hostels and Anand (V.V. Nagar) Hostel. Last date for submission is 31st August 2026.',
        isPublished: true,
      },
    ],
  });

  // 8. Create Static Pages
  const pages = [
    {
      slug: 'about-us',
      titleGu: 'અમારા વિશે (About Us)',
      titleEn: 'About Shree Satwara Maha Mandal',
      contentGu: 'શ્રી સતવારા મહામંડળ એ સતવારા સમાજના વિદ્યાર્થીઓ માટે શિક્ષણ, રહેઠાણ અને સર્વાંગી વિકાસ માટે કાર્યરત સંસ્થા છે.',
      contentEn: 'Shree Satwara Maha Mandal is a dedicated community trust focused on student education, accommodation, and holistic development.',
    },
    {
      slug: 'privacy-policy',
      titleGu: 'પ્રાઇવસી પોલિસી',
      titleEn: 'Privacy Policy',
      contentGu: 'તમારી અંગત માહિતી સુરક્ષિત રાખવી એ અમારી પ્રાથમિકતા છે.',
      contentEn: 'We respect applicant privacy and ensure submitted personal information is strictly used for admission verification.',
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  // 9. Create Default Settings (Admission, Leadership Desk, Contact Info)
  const defaultSettings = [
    { key: 'org_name_gu', value: 'સમસ્ત સતવારા મહામંડળ, અમદાવાદ' },
    { key: 'org_name_en', value: 'Samast Satwara Mahamandal, Ahmedabad' },
    { key: 'trust_reg_no', value: 'A/1234/AHMEDABAD' },
    { key: 'contact_phone', value: '+91 7043704446' },
    { key: 'contact_email', value: 'info@satvaramahamandal.org' },
    { key: 'office_address', value: 'Satwara Vidyarthi Bhavan, 13 Panchalnagar Society, Behind Devashya Hospital, Old Wadaj, Ahmedabad - 380013' },
    { key: 'office_hours', value: '10:00 AM – 6:00 PM (Mon-Sat)' },
    
    // Admission Control Toggles (Global & Per-Hostel Specific)
    { key: 'admission_status', value: 'OPEN' }, // 'OPEN' or 'CLOSED'
    { key: 'admission_status_boys_ahmedabad', value: 'OPEN' },
    { key: 'admission_status_girls_ahmedabad', value: 'OPEN' },
    { key: 'admission_status_boys_anand', value: 'OPEN' },
    { key: 'admission_closed_notice_gu', value: 'શૈક્ષણિક વર્ષ ૨૦૨૬-૨૭ માટે ઓનલાઇન પ્રવેશ પ્રક્રિયા પૂર્ણ થઈ ગયેલ છે અથવા હાલ પૂરતી બંધ છે. આગામી સુચના કે મેરિટ યાદી જોવા માટે પોર્ટલ ચકાસતા રહો.' },
    { key: 'admission_closed_notice_en', value: 'Online admissions for Academic Year 2026-2027 are currently closed. Please check published merit lists or contact the trust office for urgent inquiries.' },
    { key: 'merit_list_status', value: 'PUBLISHED' },

    // Leadership Desk (Screenshot 2)
    { key: 'president_name_gu', value: 'રાજેશભાઈ કે. મકવાણા' },
    { key: 'president_name_en', value: 'Rajeshbhai K. Makwana' },
    { key: 'president_title_gu', value: 'પ્રમુખશ્રીની કલમે' },
    { key: 'president_desig_gu', value: 'પ્રમુખશ્રી (ધંધુકા, અમદાવાદ)' },
    { key: 'president_motto_gu', value: 'શિક્ષણ અને સંસ્કારથી સમાજનો સર્વાંગી વિકાસ.' },
    { key: 'president_msg_gu', value: 'પ્રિય સમાજજનો, સમસ્ત સતવારા મહામંડળ સમાજના વિકાસ અને વિદ્યાર્થીઓના ઉજ્જવળ ભવિષ્ય માટે સતત કાર્યરત છે. આપ સૌના સહયોગથી સંસ્થા નવા શૈક્ષણિક અને સામાજિક માપદંડો સ્થાપિત કરી રહી છે.' },
    { key: 'president_photo', value: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80' },
    
    { key: 'secretary_name_gu', value: 'ગીરીશભાઈ એસ. લકુમ' },
    { key: 'secretary_name_en', value: 'Girishbhai S. Lakum' },
    { key: 'secretary_title_gu', value: 'મહામંત્રીશ્રીની કલમે' },
    { key: 'secretary_desig_gu', value: 'મહામંત્રીશ્રી (હળવદ, સુરેન્દ્રનગર)' },
    { key: 'secretary_motto_gu', value: 'ટ્રેડિશનના સંકલ્પ સાથે ટેકનોલોજીને આવકારતી આપણી સંસ્થા' },
    { key: 'secretary_msg_gu', value: 'વિશ્વભરમાં વસતા સતવારાનું ગૌરવ બનેલી આપણી સંસ્થા નવા સમય સાથે પરંપરાને જાળવીને આગળ વધી રહી છે. ઓનલાઈન પ્રવેશ પ્રક્રિયા દ્વારા વિદ્યાર્થીઓને વધુ સરળતા અને પારદર્શિતા ઉપલબ્ધ કરાવવામાં આવી છે.' },
    { key: 'secretary_photo', value: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80' },
  ];

  for (const item of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: item.key },
      update: {},
      create: item,
    });
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
