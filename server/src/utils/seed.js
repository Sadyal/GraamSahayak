const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Complaint = require('../models/Complaint');
const BirthApplication = require('../models/BirthApplication');
const DeathApplication = require('../models/DeathApplication');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/graamsahayak';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Complaint.deleteMany();
    await BirthApplication.deleteMany();
    await DeathApplication.deleteMany();

    console.log('Creating demo users...');

    // 1. Create Citizen Ramesh
    const citizen = await User.create({
      name: 'Ramesh Kumar',
      email: 'ramesh@gmail.com',
      phone: '9876543210',
      password: 'password123', // Will be encrypted by Pre-save hook
      village: 'Rampur',
      wardNumber: '03',
      role: 'Citizen',
    });
    console.log('✓ Citizen Account Created: ramesh@gmail.com (password: password123)');

    // 2. Create Admin Panchayat Officer
    const admin = await User.create({
      name: 'Sh. Rajesh Singh',
      email: 'panchayat.admin@gov.in',
      phone: '9999888877',
      password: 'adminpassword', // Will be encrypted by Pre-save hook
      village: 'Rampur',
      wardNumber: '01',
      role: 'Admin',
    });
    console.log('✓ Admin Account Created: panchayat.admin@gov.in (password: adminpassword)');

    console.log('Creating sample citizen grievances...');
    // Create complaint
    await Complaint.create({
      citizen: citizen._id,
      complaintType: 'Sanitation',
      description: 'Stagnant water accumulation behind ward 3 primary school due to blocked drains. Breeding grounds for mosquitoes. Needs urgent clearance.',
      status: 'Pending',
    });
    console.log('✓ Grievance registered successfully.');

    console.log('Creating sample certificate applications...');
    // Create birth certificate application
    await BirthApplication.create({
      citizen: citizen._id,
      applicationNumber: 'B-20260528-4089',
      childName: 'Aarav Kumar',
      gender: 'Male',
      dateOfBirth: new Date('2026-05-15'),
      placeOfBirth: 'Rampur Primary Health Center',
      fatherName: 'Ramesh Kumar',
      motherName: 'Sunita Devi',
      documentPath: 'uploads/documents/sample-discharge.pdf',
      status: 'Pending',
    });
    console.log('✓ Birth Certificate application registered successfully.');

    // Create death certificate application
    await DeathApplication.create({
      citizen: citizen._id,
      applicationNumber: 'D-20260528-9124',
      deceasedName: 'Somnath Kumar',
      gender: 'Male',
      dateOfDeath: new Date('2026-04-20'),
      ageAtDeath: 82,
      placeOfDeath: 'Rampur Home (House 114)',
      fatherOrSpouseName: 'Late Hariram Kumar',
      applicantName: 'Ramesh Kumar',
      applicantRelation: 'Son',
      documentPath: 'uploads/documents/sample-death-slip.pdf',
      status: 'Pending',
    });
    console.log('✓ Death Certificate application registered successfully.');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
