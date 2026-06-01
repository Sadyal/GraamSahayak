const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Complaint = require('../models/Complaint');
const BirthApplication = require('../models/BirthApplication');
const DeathApplication = require('../models/DeathApplication');
const Village = require('../models/Village');
const Notice = require('../models/Notice');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/graamsahayak';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
    });

    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Complaint.deleteMany();
    await BirthApplication.deleteMany();
    await DeathApplication.deleteMany();
    await Village.deleteMany();
    await Notice.deleteMany();

    console.log('Creating official villages and wards...');
    await Village.create({
      name: 'Rampur',
      wards: ['01', '02', '03', '04', '05'],
      district: 'Kangra',
      state: 'Himachal Pradesh',
    });
    await Village.create({
      name: 'Shyampur',
      wards: ['01', '02', '03'],
      district: 'Kangra',
      state: 'Himachal Pradesh',
    });
    console.log('✓ Seeded Villages: Rampur (wards 01-05), Shyampur (wards 01-03)');

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
      status: 'Approved',
    });
    console.log('✓ Admin Account Created: panchayat.admin@gov.in (password: adminpassword)');

    // 3. Create Super Admin
    const superAdmin = await User.create({
      name: 'Panchayat Super Admin',
      email: 'superadmin@graamsahayak.gov.in',
      phone: '9000000000',
      password: 'Sadyal@4752', // Will be encrypted by Pre-save hook
      village: 'System',
      wardNumber: '00',
      role: 'SuperAdmin',
      status: 'Approved',
    });
    console.log('✓ Super Admin Account Created: superadmin@graamsahayak.gov.in (password: Sadyal@4752)');

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

    console.log('Creating sample dynamic notices and announcements...');
    
    // Rampur Notice 1
    await Notice.create({
      title: 'Emergency Water Pipeline Repair (Ward 02 & 03)',
      description: 'The main water pipeline near Rampur Primary Health Center suffered a rupture. Water supply will remain suspended in Wards 02 and 03 on Tuesday between 08:00 AM and 02:00 PM for repair works. Residents are advised to store sufficient water in advance.',
      category: 'Notice',
      severity: 'Urgent',
      village: 'Rampur',
      publishedBy: admin._id,
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    });

    // Rampur Notice 2
    await Notice.create({
      title: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) Subsidies',
      description: 'Applications are officially invited from small and marginal farmers of Rampur Gram Panchayat for borewell and drip-irrigation equipment subsidies under the PMKSY scheme. Visit the Panchayat Bhawan during weekdays with land records and bank passbooks to submit your registration form.',
      category: 'Scheme',
      severity: 'Info',
      village: 'Rampur',
      publishedBy: admin._id,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    // Shyampur Notice
    await Notice.create({
      title: 'Gram Sabha Development Meeting Scheduled',
      description: 'An official Gram Sabha general body meeting is scheduled for Shyampur residents on 15th June 2026 at 11:00 AM under the presidency of the Gram Pradhan. Agenda covers FY 2026-27 solar streetlight installations and street drainage expansion plans. Mandatory attendance is requested.',
      category: 'Event',
      severity: 'Medium',
      village: 'Shyampur',
      publishedBy: admin._id,
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
    });

    // Global Notice
    await Notice.create({
      title: 'GraamSahayak Digital Portal Launched Successfully!',
      description: 'Welcome to the official digital portal of Gram Panchayat e-Governance. Citizens can now register, file civic complaints (with photo and voice descriptions), apply for official Birth or Death certificates, and retrieve approved digital copies directly from the portal.',
      category: 'General',
      severity: 'Info',
      village: 'All',
      publishedBy: admin._id,
      expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000) // 120 days from now
    });

    console.log('✓ Dynamic Notice Board announcements seeded successfully.');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
