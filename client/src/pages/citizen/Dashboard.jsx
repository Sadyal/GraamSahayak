import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { AlertTriangle, Baby, Activity, FileCheck, UserCircle, PhoneCall } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const serviceCards = [
    {
      title: 'File Grievance / Complaint',
      desc: 'Report sanitation, roads, street light, or electricity problems in your ward. You can upload photo evidence or record audio.',
      link: '/citizen/complaint/new',
      icon: <AlertTriangle size={32} color="#dc2626" />,
      btnText: 'Register Grievance',
      color: '#dc2626',
    },
    {
      title: 'Apply for Birth Certificate',
      desc: 'Submit details of new births in your household. Upload hospital birth report. Download certificate once signed by Panchayat.',
      link: '/citizen/birth-apply',
      icon: <Baby size={32} color="var(--primary-blue)" />,
      btnText: 'Apply Birth Record',
      color: 'var(--primary-blue)',
    },
    {
      title: 'Apply for Death Certificate',
      desc: 'Submit applications for death registration. Upload medical reports or cremation receipts. Download certificates upon approval.',
      link: '/citizen/death-apply',
      icon: <Activity size={32} color="var(--green)" />,
      btnText: 'Apply Death Record',
      color: 'var(--green)',
    },
    {
      title: 'Track My Applications',
      desc: 'Check the live status of your birth certificate and death certificate applications. Download generated e-certificates.',
      link: '/citizen/applications',
      icon: <FileCheck size={32} color="#4b5563" />,
      btnText: 'Check Certificates',
      color: '#4b5563',
    },
    {
      title: 'Manage Citizen Profile',
      desc: 'Review your registered village, ward number, contact details. Change your system login password.',
      link: '/citizen/profile',
      icon: <UserCircle size={32} color="#f59e0b" />,
      btnText: 'View Profile',
      color: '#f59e0b',
    },
  ];

  return (
    <div>
      <div className="content-header">
        <h2>Citizen Service Center</h2>
        <div style={{ fontSize: '13px', color: 'var(--light-text)', fontWeight: '600' }}>
          Gramsabha: <strong>{user?.village}</strong> | Ward No: <strong>{user?.wardNumber}</strong>
        </div>
      </div>

      {/* Welcome Board */}
      <div className="gov-card" style={{ background: 'linear-gradient(to right, #fefefe, #f4f6f9)', borderLeft: '5px solid var(--saffron)' }}>
        <h3 style={{ color: 'var(--primary-blue)', fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>
          Welcome, {user?.name}!
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--light-text)', lineHeight: '1.6' }}>
          This portal provides single-window access to e-services provided by your Gram Panchayat. You can file civic complaints, submit registration forms for birth and death certificates, track their processing status, and download officially generated digital certificates securely.
        </p>
      </div>

      {/* Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '25px' }}>
        {serviceCards.map((card, idx) => (
          <div key={idx} className="gov-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '15px' }}>
              <div>{card.icon}</div>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--secondary-blue)', textTransform: 'uppercase' }}>
                {card.title}
              </h4>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--light-text)', lineHeight: '1.6', marginBottom: '20px', flex: '1' }}>
              {card.desc}
            </p>
            <div style={{ marginTop: 'auto' }}>
              <Link to={card.link} className="btn btn-primary" style={{ width: '100%', backgroundColor: card.color, borderColor: card.color }}>
                {card.btnText}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Helpdesk Notice */}
      <div className="gov-card" style={{ marginTop: '30px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff' }}>
        <div style={{ color: 'var(--primary-blue)' }}><PhoneCall size={32} /></div>
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary-blue)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Panchayat Helpline & Support
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--light-text)' }}>
            For assistance with registration, documents, or grievance tracking, contact your Ward Member or visit the Panchayat Bhawan. 
            <br />
            Helpline Email: <code>panchayat.support@gov.in</code> | Phone: <code>1800-PANCHAYAT</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
