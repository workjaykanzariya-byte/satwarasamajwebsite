const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/auditLogger');

// 1. Get Hostels Summary (Public & Admin)
const getHostelsSummary = async (req, res, next) => {
  try {
    const hostels = await prisma.hostel.findMany({
      where: { status: true },
      include: {
        beds: {
          select: { id: true, status: true },
        },
      },
    });

    const summary = hostels.map((hostel) => {
      const totalBeds = hostel.beds.length;
      const occupied = hostel.beds.filter((b) => b.status === 'OCCUPIED').length;
      const vacant = hostel.beds.filter((b) => b.status === 'VACANT').length;
      const reserved = hostel.beds.filter((b) => b.status === 'RESERVED').length;
      const maintenance = hostel.beds.filter((b) => b.status === 'MAINTENANCE').length;

      return {
        id: hostel.id,
        name: hostel.name,
        type: hostel.type,
        address: hostel.address,
        city: hostel.city,
        wardenName: hostel.wardenName,
        wardenContact: hostel.wardenContact,
        wardenEmail: hostel.wardenEmail,
        description: hostel.description,
        image: hostel.image,
        totalCapacity: hostel.totalCapacity || totalBeds,
        totalBeds,
        occupiedBeds: occupied,
        availableBeds: vacant,
        reservedBeds: reserved,
        maintenanceBeds: maintenance,
        occupancyRatePct: totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0,
      };
    });

    return res.json({ success: true, hostels: summary });
  } catch (error) {
    next(error);
  }
};

// 2. Get Hostel Hierarchy (For Admin Structure & Floor-by-Floor view)
const getHostelHierarchy = async (req, res, next) => {
  try {
    const { hostelId } = req.params;

    const hostel = await prisma.hostel.findUnique({
      where: { id: parseInt(hostelId, 10) },
      include: {
        buildings: {
          include: {
            floors: {
              orderBy: { floorNumber: 'asc' },
              include: {
                rooms: {
                  include: {
                    beds: {
                      include: {
                        students: {
                          where: { status: 'ACTIVE' },
                          include: {
                            application: {
                              include: { applicantDetails: true, academicDetails: true },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        floors: {
          where: { buildingId: null },
          orderBy: { floorNumber: 'asc' },
          include: {
            rooms: {
              include: {
                beds: {
                  include: {
                    students: {
                      where: { status: 'ACTIVE' },
                      include: {
                        application: {
                          include: { applicantDetails: true, academicDetails: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found.' });
    }

    return res.json({ success: true, hostel });
  } catch (error) {
    next(error);
  }
};

// 3. Visual Occupancy Grid (Optimized for Admin Panel visual bed manager)
const getVisualOccupancyGrid = async (req, res, next) => {
  try {
    const { hostelId } = req.params;
    const { floorId } = req.query;

    const whereClause = { hostelId: parseInt(hostelId, 10) };
    if (floorId) {
      whereClause.id = parseInt(floorId, 10);
    }

    const floors = await prisma.floor.findMany({
      where: whereClause,
      orderBy: { floorNumber: 'asc' },
      include: {
        building: { select: { id: true, name: true } },
        rooms: {
          include: {
            beds: {
              include: {
                students: {
                  where: { status: 'ACTIVE' },
                  include: {
                    application: {
                      include: { applicantDetails: true, academicDetails: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Format grid structure with student profile attached to occupied beds
    const formattedFloors = floors.map((fl) => ({
      id: fl.id,
      name: fl.name,
      floorNumber: fl.floorNumber,
      buildingName: fl.building ? fl.building.name : 'Main Block',
      rooms: fl.rooms.map((rm) => ({
        id: rm.id,
        roomNumber: rm.roomNumber,
        roomType: rm.roomType,
        bedCount: rm.bedCount,
        status: rm.status,
        beds: rm.beds.map((bd) => {
          const activeStudent = bd.students.length > 0 ? bd.students[0] : null;
          const applicant = activeStudent ? activeStudent.application.applicantDetails : null;
          const academic = activeStudent ? activeStudent.application.academicDetails : null;

          return {
            id: bd.id,
            bedLabel: bd.bedLabel,
            status: bd.status,
            assignedStudent: activeStudent
              ? {
                  id: activeStudent.id,
                  studentCode: activeStudent.studentCode,
                  joiningDate: activeStudent.joiningDate,
                  expiringDate: activeStudent.expiringDate,
                  result: activeStudent.result,
                  fullName: applicant ? `${applicant.firstName} ${applicant.middleName} ${applicant.lastName}` : 'Student',
                  mobile: applicant ? applicant.mobile : '',
                  city: applicant ? applicant.city : '',
                  course: academic ? academic.courseName : '',
                  college: academic ? academic.collegeName : '',
                  applicationNumber: activeStudent.application.applicationNumber,
                }
              : null,
          };
        }),
      })),
    }));

    return res.json({ success: true, floors: formattedFloors });
  } catch (error) {
    next(error);
  }
};

// 4. Create Hostel
const createHostel = async (req, res, next) => {
  try {
    const { name, type, address, city, wardenName, wardenContact, wardenEmail, description } = req.body;
    const hostel = await prisma.hostel.create({
      data: {
        name,
        type: type || 'BOYS',
        address,
        city: city || 'Ahmedabad',
        wardenName,
        wardenContact,
        wardenEmail,
        description,
      },
    });

    await logAudit({
      adminId: req.admin.id,
      adminName: req.admin.name,
      action: 'CREATE_HOSTEL',
      entity: 'Hostel',
      entityId: hostel.id,
      details: `Created hostel ${name}`,
      req,
    });

    return res.status(201).json({ success: true, hostel });
  } catch (error) {
    next(error);
  }
};

// 5. Add Floor
const addFloor = async (req, res, next) => {
  try {
    const { hostelId, buildingId, name, floorNumber } = req.body;
    const floor = await prisma.floor.create({
      data: {
        hostelId: parseInt(hostelId, 10),
        buildingId: buildingId ? parseInt(buildingId, 10) : null,
        name,
        floorNumber: parseInt(floorNumber, 10),
      },
    });

    await logAudit({
      adminId: req.admin.id,
      adminName: req.admin.name,
      action: 'ADD_FLOOR',
      entity: 'Floor',
      entityId: floor.id,
      details: `Added floor ${name} to hostel #${hostelId}`,
      req,
    });

    return res.status(201).json({ success: true, floor });
  } catch (error) {
    next(error);
  }
};

// 6. Add Room (Auto generates child Bed records!)
const addRoom = async (req, res, next) => {
  try {
    const { floorId, hostelId, roomNumber, roomType, bedCount } = req.body;
    const count = parseInt(bedCount, 10) || 2;

    const room = await prisma.room.create({
      data: {
        floorId: parseInt(floorId, 10),
        hostelId: parseInt(hostelId, 10),
        roomNumber,
        roomType: roomType || 'DOUBLE',
        bedCount: count,
      },
    });

    // Auto-create child beds
    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const bedData = [];
    for (let i = 0; i < count; i++) {
      const label = alphabet[i] || `${i + 1}`;
      bedData.push({
        roomId: room.id,
        hostelId: parseInt(hostelId, 10),
        bedLabel: `${roomNumber}-${label}`,
        status: 'VACANT',
      });
    }

    await prisma.bed.createMany({ data: bedData });

    // Update hostel capacity
    const totalBedsCount = await prisma.bed.count({
      where: { hostelId: parseInt(hostelId, 10) },
    });
    await prisma.hostel.update({
      where: { id: parseInt(hostelId, 10) },
      data: { totalCapacity: totalBedsCount },
    });

    await logAudit({
      adminId: req.admin.id,
      adminName: req.admin.name,
      action: 'ADD_ROOM',
      entity: 'Room',
      entityId: room.id,
      details: `Added room ${roomNumber} with ${count} auto-generated beds`,
      req,
    });

    return res.status(201).json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

// 7. Add Individual Bed
const addBed = async (req, res, next) => {
  try {
    const { roomId, hostelId, bedLabel } = req.body;
    const bed = await prisma.bed.create({
      data: {
        roomId: parseInt(roomId, 10),
        hostelId: parseInt(hostelId, 10),
        bedLabel,
        status: 'VACANT',
      },
    });

    await prisma.room.update({
      where: { id: parseInt(roomId, 10) },
      data: { bedCount: { increment: 1 } },
    });

    const totalBedsCount = await prisma.bed.count({
      where: { hostelId: parseInt(hostelId, 10) },
    });
    await prisma.hostel.update({
      where: { id: parseInt(hostelId, 10) },
      data: { totalCapacity: totalBedsCount },
    });

    return res.status(201).json({ success: true, bed });
  } catch (error) {
    next(error);
  }
};

// 8. Update Bed Status (e.g. MAINTENANCE / RESERVED / VACANT)
const updateBedStatus = async (req, res, next) => {
  try {
    const { bedId } = req.params;
    const { status } = req.body;

    const bed = await prisma.bed.update({
      where: { id: parseInt(bedId, 10) },
      data: { status },
    });

    await logAudit({
      adminId: req.admin.id,
      adminName: req.admin.name,
      action: 'UPDATE_BED_STATUS',
      entity: 'Bed',
      entityId: bedId,
      details: `Updated bed #${bedId} status to ${status}`,
      req,
    });

    return res.json({ success: true, bed });
  } catch (error) {
    next(error);
  }
};

// 9. Assign Student to Bed (Core Allotment Action)
const assignStudentToBed = async (req, res, next) => {
  try {
    const { bedId, studentId, remarks } = req.body;
    const bId = parseInt(bedId, 10);
    const sId = parseInt(studentId, 10);

    const bed = await prisma.bed.findUnique({ where: { id: bId } });
    if (!bed) {
      return res.status(404).json({ success: false, message: 'Bed not found.' });
    }

    if (bed.status === 'OCCUPIED') {
      return res.status(400).json({ success: false, message: 'Bed is already occupied.' });
    }

    const student = await prisma.student.findUnique({
      where: { id: sId },
      include: { application: { include: { applicantDetails: true } } },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    // Check if student is already assigned elsewhere
    if (student.bedId && student.bedId !== bId) {
      // Vacate old bed if any
      await prisma.bed.update({
        where: { id: student.bedId },
        data: { status: 'VACANT' },
      });
      await prisma.bedAllotment.updateMany({
        where: { studentId: sId, vacatedAt: null },
        data: { vacatedAt: new Date() },
      });
    }

    // Update Bed status to OCCUPIED
    await prisma.bed.update({
      where: { id: bId },
      data: { status: 'OCCUPIED' },
    });

    // Update Student record with assigned hostel/room/bed
    await prisma.student.update({
      where: { id: sId },
      data: {
        hostelId: bed.hostelId,
        roomId: bed.roomId,
        bedId: bId,
        status: 'ACTIVE',
      },
    });

    // Update Application Status to HOSTEL_ALLOTTED if not already
    await prisma.application.update({
      where: { id: student.applicationId },
      data: { status: 'HOSTEL_ALLOTTED' },
    });

    // Create BedAllotment history row
    const allotment = await prisma.bedAllotment.create({
      data: {
        studentId: sId,
        bedId: bId,
        hostelId: bed.hostelId,
        allottedByAdminId: req.admin.id,
        remarks: remarks || 'Bed allotment assigned by hostel manager',
      },
    });

    await logAudit({
      adminId: req.admin.id,
      adminName: req.admin.name,
      action: 'ALLOT_BED',
      entity: 'BedAllotment',
      entityId: allotment.id,
      details: `Assigned Bed ${bed.bedLabel} to student ${student.studentCode}`,
      req,
    });

    return res.json({ success: true, message: `Bed ${bed.bedLabel} successfully assigned.`, allotment });
  } catch (error) {
    next(error);
  }
};

// 10. Vacate Bed
const vacateBed = async (req, res, next) => {
  try {
    const { bedId } = req.body;
    const bId = parseInt(bedId, 10);

    const bed = await prisma.bed.findUnique({
      where: { id: bId },
      include: { students: { where: { status: 'ACTIVE' } } },
    });

    if (!bed) {
      return res.status(404).json({ success: false, message: 'Bed not found.' });
    }

    // Mark bed as VACANT
    await prisma.bed.update({
      where: { id: bId },
      data: { status: 'VACANT' },
    });

    // Clear student bed association
    const activeStudent = bed.students[0];
    if (activeStudent) {
      await prisma.student.update({
        where: { id: activeStudent.id },
        data: { bedId: null, roomId: null, checkoutDate: new Date() },
      });

      // Update allotment history row
      await prisma.bedAllotment.updateMany({
        where: { studentId: activeStudent.id, bedId: bId, vacatedAt: null },
        data: { vacatedAt: new Date() },
      });
    }

    await logAudit({
      adminId: req.admin.id,
      adminName: req.admin.name,
      action: 'VACATE_BED',
      entity: 'Bed',
      entityId: bId,
      details: `Vacated bed ${bed.bedLabel}`,
      req,
    });

    return res.json({ success: true, message: `Bed ${bed.bedLabel} has been vacated.` });
  } catch (error) {
    next(error);
  }
};

// 11. Search Student Bed Location ("Where is student X")
const searchStudentBedLocation = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required.' });
    }

    const students = await prisma.student.findMany({
      where: {
        OR: [
          { studentCode: { contains: query } },
          { application: { applicationNumber: { contains: query } } },
          { application: { applicantDetails: { firstName: { contains: query } } } },
          { application: { applicantDetails: { lastName: { contains: query } } } },
          { application: { applicantDetails: { mobile: { contains: query } } } },
        ],
      },
      include: {
        hostel: true,
        bed: {
          include: {
            room: {
              include: { floor: { include: { building: true } } },
            },
          },
        },
        application: {
          include: { applicantDetails: true, academicDetails: true },
        },
      },
    });

    const results = students.map((st) => ({
      id: st.id,
      studentCode: st.studentCode,
      status: st.status,
      fullName: st.application.applicantDetails
        ? `${st.application.applicantDetails.firstName} ${st.application.applicantDetails.lastName}`
        : 'Student',
      mobile: st.application.applicantDetails ? st.application.applicantDetails.mobile : '',
      applicationNumber: st.application.applicationNumber,
      course: st.application.academicDetails ? st.application.academicDetails.courseName : '',
      hostelName: st.hostel ? st.hostel.name : 'Unassigned',
      buildingName: st.bed?.room?.floor?.building ? st.bed.room.floor.building.name : 'Main Block',
      floorName: st.bed?.room?.floor ? st.bed.room.floor.name : 'Unassigned',
      roomNumber: st.bed?.room ? st.bed.room.roomNumber : 'Unassigned',
      bedLabel: st.bed ? st.bed.bedLabel : 'Unassigned Bed',
    }));

    return res.json({ success: true, results });
  } catch (error) {
    next(error);
  }
};

// 12. Get Vacant Beds (Filterable)
const getVacantBeds = async (req, res, next) => {
  try {
    const { hostelId, hostelType } = req.query;

    const whereClause = { status: 'VACANT' };
    if (hostelId) {
      whereClause.hostelId = parseInt(hostelId, 10);
    } else if (hostelType) {
      whereClause.hostel = { type: hostelType };
    }

    const vacantBeds = await prisma.bed.findMany({
      where: whereClause,
      include: {
        hostel: { select: { id: true, name: true, type: true } },
        room: {
          include: { floor: { include: { building: true } } },
        },
      },
      orderBy: { bedLabel: 'asc' },
    });

    const formatted = vacantBeds.map((b) => ({
      id: b.id,
      bedLabel: b.bedLabel,
      hostelId: b.hostelId,
      hostelName: b.hostel.name,
      roomNumber: b.room.roomNumber,
      roomType: b.room.roomType,
      floorName: b.room.floor.name,
      buildingName: b.room.floor.building ? b.room.floor.building.name : 'Main Block',
    }));

    return res.json({ success: true, vacantBeds: formatted });
  } catch (error) {
    next(error);
  }
};

// 13. Delete Floor (Dynamic removal of empty floor)
const deleteFloor = async (req, res, next) => {
  try {
    const { floorId } = req.params;
    const fId = parseInt(floorId, 10);

    const occupiedBedsCount = await prisma.bed.count({
      where: {
        room: { floorId: fId },
        status: 'OCCUPIED',
      },
    });

    if (occupiedBedsCount > 0) {
      return res.status(400).json({ success: false, message: `Cannot delete floor. There are ${occupiedBedsCount} occupied beds on this floor.` });
    }

    const floor = await prisma.floor.findUnique({ where: { id: fId } });
    if (!floor) {
      return res.status(404).json({ success: false, message: 'Floor not found.' });
    }

    await prisma.floor.delete({ where: { id: fId } });

    // Update hostel capacity
    const totalBedsCount = await prisma.bed.count({
      where: { hostelId: floor.hostelId },
    });
    await prisma.hostel.update({
      where: { id: floor.hostelId },
      data: { totalCapacity: totalBedsCount },
    });

    await logAudit({
      adminId: req.admin.id,
      adminName: req.admin.name,
      action: 'DELETE_FLOOR',
      entity: 'Floor',
      entityId: floorId,
      details: `Deleted floor ${floor.name} (#${floorId})`,
      req,
    });

    return res.json({ success: true, message: `Floor '${floor.name}' deleted successfully.` });
  } catch (error) {
    next(error);
  }
};

// 14. Delete Room
const deleteRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const rId = parseInt(roomId, 10);

    const occupiedBeds = await prisma.bed.count({
      where: { roomId: rId, status: 'OCCUPIED' },
    });

    if (occupiedBeds > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete room with occupied beds. Vacate beds first.' });
    }

    const room = await prisma.room.findUnique({ where: { id: rId } });
    if (room) {
      await prisma.room.delete({ where: { id: rId } });

      // Update hostel capacity
      const totalBedsCount = await prisma.bed.count({
        where: { hostelId: room.hostelId },
      });
      await prisma.hostel.update({
        where: { id: room.hostelId },
        data: { totalCapacity: totalBedsCount },
      });
    }

    return res.json({ success: true, message: 'Room deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHostelsSummary,
  getHostelHierarchy,
  getVisualOccupancyGrid,
  createHostel,
  addFloor,
  addRoom,
  addBed,
  updateBedStatus,
  assignStudentToBed,
  vacateBed,
  searchStudentBedLocation,
  getVacantBeds,
  deleteFloor,
  deleteRoom,
};
