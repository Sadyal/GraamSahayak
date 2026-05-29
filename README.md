# GraamSahayak (ग्राम सहायक) - MERN Gram Panchayat Portal MVP

An elegant, highly robust, and easy-to-understand e-Governance Portal for Gram Panchayats. Designed with a clean official Indian-Government tricolor visual theme (Navy Blue, Saffron, Green) and rigid, professional layouts. Built using the **MERN Stack** (MongoDB, Express, React, Node.js) with simple, flat structures for entry-level developers to understand easily.

---

## 🌟 Key Features

### 👥 Public Features
1. **Official Government Homepage**: Highlights available services, civic grievance statistics, active announcements, and footer disclaimers.
2. **e-Governance Single Sign-On (SSO)**: Secure citizen registration and login portal supporting unified credential checks.

### 🧑‍💼 Citizen Services
1. **Civic Grievance Desk**: Submit complaints (Sanitation, Water, Streetlights, Roads) with options to upload photographs and record voice logs directly in the browser.
2. **Birth e-Registration**: Apply for a birth certificate, upload hospital discharge reports, and check processing.
3. **Death e-Registration**: Apply for a death certificate, upload medical death reports or cremation slips.
4. **My Certificate Box**: Dynamic workspace to download officially signed e-certificates with unique IDs and QR verification grids upon administration approval.
5. **My Profile**: View registered ward number and village details, and update security passwords.

### 👑 Administration Suite
1. **Administrative Dashboard**: Aggregates real-time grievance lists, pending certificates, and resolution efficiencies.
2. **Grievance Moderation**: Play voice complaints, preview uploaded photos, post administrative action remarks, update progress, or delete.
3. **Registration Moderation**: Review submitted certificate proofs (hospital papers), approve/reject, and generate digital certificates.
4. **Certificate Generator**: Template viewer rendering official certificates, complete with double borders, Ashoka Chakra placeholders, QR code verifications, and digital signatures. It is print-ready (hides layouts during printing using standard `@media print` CSS rules).

---

## 📂 Project Architecture

```
GraamSahayak/
├── server/                     # Backend API Server (Node/Express)
│   ├── src/
│   │   ├── config/             # DB configurations
│   │   ├── controllers/        # Logical controllers (Auth, Complaints, Certificates)
│   │   ├── middleware/         # Session protect, role controls, local uploads
│   │   ├── models/             # Mongoose Schemas (User, Complaint, Birth, Death)
│   │   ├── routes/             # REST Endpoints
│   │   ├── utils/              # Token, Certificate ID & Database Seed helpers
│   │   └── uploads/            # Local folders serving citizen attachments
│   └── .env
└── client/                     # Frontend UI (React + Vite + Vanilla CSS)
    ├── src/
    │   ├── api/                # Core fetch endpoints
    │   ├── components/         # Common UI: Navbar, Sidebar, StatusBadge, AudioRecorder
    │   ├── context/            # Global Auth Session state
    │   ├── layouts/            # Route guards (CitizenLayout, AdminLayout)
    │   ├── pages/              # Pages: Public, Citizen, and Admin modules
    │   ├── routes/             # AppRoutes maps protected routes
    │   ├── services/           # Fetch request helpers
    │   ├── index.css           # Vanilla CSS government design system
    │   └── main.jsx            # Entry point
```

---

## 🚀 Setup & Execution Instructions

### 1. Prerequisites
- **Node.js** installed locally (v18+ recommended)
- **MongoDB** running locally (`mongodb://localhost:27017`) or an online MongoDB Atlas URI.

---

### 2. Configuration (`.env`)
Create/review the environment file in `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/graamsahayak
JWT_SECRET=supersecretpanchayatkey123
NODE_ENV=development
```

---

### 3. Quickstart Guide (Database Seeding)
The backend features an automated seed script that resets the database and injects pre-configured demo citizens, admins, active complaints, and pending certificate records for instant testing.

From the `server` directory, run:
```bash
npm run seed
```

This populates two demo accounts:
* **Citizen Account**:
  - Email: `ramesh@gmail.com`
  - Password: `password123`
* **Admin Account**:
  - Email: `panchayat.admin@gov.in`
  - Password: `adminpassword`

---

### 4. Running the Portals

#### Start Backend API Server
From the `server` directory, run:
```bash
# Production start
npm start

# Development hot-reload
npm run dev
```
The backend server runs on `http://localhost:5000`.

#### Start Frontend Client Dev Server
From the `client` directory, run:
```bash
npm run dev
```
The React portal launches on `http://localhost:3000`.

---

## 🛠️ Verification Checklist

1. **Self-Registration**: Visit `http://localhost:3000/register` to register your own Citizen or Admin accounts and sign in.
2. **Audio Recorder**: Go to the grievance form, click "Record Audio", record a sample description, and play it back before submitting.
3. **Application Verification**: Log in as Sh. Rajesh Singh (Admin), review Ramesh Kumar's pending birth certificate application, click Approve, write verification remarks, and hit Save.
4. **Certificate Print**: Open the approved certificate, click "Print / Save PDF", and verify that the page margins hide administrative widgets and frame the certificate ready for official distribution.
