import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { ShieldCheck, FileText, AlertCircle, TrendingUp, CheckCircle, Clock, Volume2 } from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);

  const announcements = [
    { id: 1, text: "Gram Sabha meeting scheduled on 15th June 2026 at Panchayat Bhawan." },
    { id: 2, text: "Online Birth and Death certificate applications are now open for all wards." },
    { id: 3, text: "Submit your Sanitation and Clean Water complaints directly via the portal." },
    { id: 4, text: "Panchayat development budget for FY 2026-27 is published on the notice board." }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6' }}>
      <Navbar />

      {/* Announcements Marquee banner */}
      <div style={{ backgroundColor: '#ff9933', color: '#ffffff', padding: '6px 20px', display: 'flex', fontSize: '13px', fontWeight: 'bold', borderBottom: '2px solid #ffffff' }}>
        <span style={{ whiteSpace: 'nowrap', paddingRight: '10px', borderRight: '2px solid #ffffff' }}>ANNOUNCEMENTS:</span>
        <marquee scrollamount="4" style={{ cursor: 'pointer' }}>
          {announcements.map(a => a.text).join(' | ')}
        </marquee>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 className="hero-title">
            Empowering Villages, Strengthening Democracy
          </h2>
          <p style={{ fontSize: '16px', color: '#ff9933', fontWeight: '600', textTransform: 'uppercase', marginBottom: '25px' }}>
            Official e-Governance Service Portal of Gram Panchayat
          </p>
          <p style={{ fontSize: '15px', color: '#e5e7eb', marginBottom: '35px', lineHeight: '1.7' }}>
            GraamSahayak makes public service delivery swift, transparent, and completely digital. Citizen applications for vital records, local grievance management, and administrative tracking are now fully streamlined online.
          </p>
          
          <div className="hero-buttons">
            {user ? (
              <Link to={user.role === 'Admin' ? '/admin' : '/citizen'} className="btn btn-success" style={{ padding: '12px 24px', fontSize: '15px' }}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '15px', backgroundColor: '#003366', borderColor: '#003366' }}>
                  Citizen/Admin Login
                </Link>
                <Link to="/register" className="btn btn-success" style={{ padding: '12px 24px', fontSize: '15px', backgroundColor: '#138808' }}>
                  Register as Citizen
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <h3 className="text-center" style={{ fontSize: '24px', color: 'var(--primary-blue)', fontWeight: '800', marginBottom: '35px', textTransform: 'uppercase' }}>
          Available Services Online
        </h3>
        
        <div className="services-grid">
          
          {/* Service 1 */}
          <div className="gov-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
              <div style={{ color: '#dc2626' }}><AlertCircle size={24} /></div>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--primary-blue)', textTransform: 'uppercase' }}>Grievance Redressal</h4>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--light-text)' }}>
              Submit complaints about local public services such as sanitation, water supply, broken street lights, or bad roads. Support for photos and audio recordings is provided.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
              <Link to="/login" style={{ fontSize: '13px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                File Complaint →
              </Link>
            </div>
          </div>

          {/* Service 2 */}
          <div className="gov-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
              <div style={{ color: 'var(--primary-blue)' }}><FileText size={24} /></div>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--primary-blue)', textTransform: 'uppercase' }}>Birth Certificate</h4>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--light-text)' }}>
              Apply for birth registration digitally. Upload hospital discharge certificates or vaccination slips. Download signed official digital certificates upon approval.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
              <Link to="/login" style={{ fontSize: '13px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                Apply Online →
              </Link>
            </div>
          </div>

          {/* Service 3 */}
          <div className="gov-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
              <div style={{ color: 'var(--green)' }}><ShieldCheck size={24} /></div>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--primary-blue)', textTransform: 'uppercase' }}>Death Certificate</h4>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--light-text)' }}>
              Apply for death registration online. Submit medical death reports or cremation receipts. Get fast approvals and generate official certificates.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
              <Link to="/login" style={{ fontSize: '13px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                Apply Online →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Complaint Statistics Section */}
      <section style={{ backgroundColor: '#ffffff', padding: '50px 40px', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <h3 className="text-center" style={{ fontSize: '22px', color: 'var(--primary-blue)', fontWeight: '800', marginBottom: '35px', textTransform: 'uppercase' }}>
            Panchayat grievance & service performance
          </h3>
          
          <div className="gov-stats-row">
            <div className="gov-stats-col">
              <h5 style={{ color: 'var(--saffron)', fontSize: '32px', fontWeight: '800' }}>247</h5>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--light-text)', textTransform: 'uppercase', marginTop: '5px' }}>
                Total Grievances Filed
              </p>
            </div>
            <div className="gov-stats-col">
              <h5 style={{ color: 'var(--green)', fontSize: '32px', fontWeight: '800' }}>212</h5>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--light-text)', textTransform: 'uppercase', marginTop: '5px' }}>
                Resolved Grievances
              </p>
            </div>
            <div className="gov-stats-col">
              <h5 style={{ color: 'var(--primary-blue)', fontSize: '32px', fontWeight: '800' }}>389</h5>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--light-text)', textTransform: 'uppercase', marginTop: '5px' }}>
                Birth Certificates Approved
              </p>
            </div>
            <div className="gov-stats-col">
              <h5 style={{ color: '#111827', fontSize: '32px', fontWeight: '800' }}>94.2%</h5>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--light-text)', textTransform: 'uppercase', marginTop: '5px' }}>
                Resolution Efficiency
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', backgroundColor: 'var(--secondary-blue)', color: '#ffffff', padding: '30px 40px', borderTop: '3px solid var(--saffron)' }}>
        <div className="footer-content">
          <div>
            <h4 style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '15px', color: '#ffffff', marginBottom: '10px' }}>
              GraamSahayak portal
            </h4>
            <p style={{ color: '#9ca3af' }}>
              Ministry of Panchayati Raj, Government of India.
              <br />
              Digital e-Governance Initiatives of Gram Panchayat Administration.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '14px', color: '#ffffff', marginBottom: '10px' }}>
              Portal Links
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/login" style={{ color: '#d1d5db' }}>Login (Admin/Citizen)</Link>
              <Link to="/register" style={{ color: '#d1d5db' }}>Register (Citizen Only)</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '14px', color: '#ffffff', marginBottom: '10px' }}>
              Disclaimer
            </h4>
            <p style={{ color: '#9ca3af', maxWidth: '350px' }}>
              This is a demonstration MVP designed for the Gram Panchayat Grievance & Vital Records Portal. Content, seals, and records shown are for representation purposes.
            </p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1f2937', marginTop: '25px', paddingTop: '15px', textAlign: 'center', fontSize: '11px', color: '#9ca3af' }}>
          © {new Date().getFullYear()} GraamSahayak Gram Panchayat Portal. Designed by Advanced Agentic Coding. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
