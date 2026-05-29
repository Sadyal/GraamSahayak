import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import CitizenLayout from '../layouts/CitizenLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';

// Citizen Pages
import CitizenDashboard from '../pages/citizen/Dashboard';
import CreateComplaint from '../pages/citizen/CreateComplaint';
import MyComplaints from '../pages/citizen/MyComplaints';
import BirthCertificate from '../pages/citizen/BirthCertificate';
import DeathCertificate from '../pages/citizen/DeathCertificate';
import MyApplications from '../pages/citizen/MyApplications';
import CitizenProfile from '../pages/citizen/Profile';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminComplaints from '../pages/admin/Complaints';
import BirthRequests from '../pages/admin/BirthRequests';
import DeathRequests from '../pages/admin/DeathRequests';
import AdminApprovals from '../pages/admin/Approvals';
import VillageManagement from '../pages/admin/VillageManagement';
import VillagersDirectory from '../pages/admin/VillagersDirectory';

// Certificate Generator / Viewer (Used by both roles)
import CertificateGenerator from '../pages/admin/CertificateGenerator';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Citizen Dashboard & Subpages (Guarded by CitizenLayout) */}
      <Route path="/citizen" element={<CitizenLayout />}>
        <Route index element={<CitizenDashboard />} />
        <Route path="complaint/new" element={<CreateComplaint />} />
        <Route path="complaints" element={<MyComplaints />} />
        <Route path="birth-apply" element={<BirthCertificate />} />
        <Route path="death-apply" element={<DeathCertificate />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="profile" element={<CitizenProfile />} />
        {/* Certificate view path */}
        <Route path="certificate/:type/:id" element={<CertificateGenerator />} />
      </Route>

      {/* Admin Dashboard & Moderation (Guarded by AdminLayout) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="complaints" element={<AdminComplaints />} />
        <Route path="birth-requests" element={<BirthRequests />} />
        <Route path="death-requests" element={<DeathRequests />} />
        <Route path="approvals" element={<AdminApprovals />} />
        <Route path="villages" element={<VillageManagement />} />
        <Route path="villagers" element={<VillagersDirectory />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
