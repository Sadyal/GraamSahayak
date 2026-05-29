import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from '../../services/axiosInstance';
import Loader from '../../components/Loader';
import {
  Inbox,
  Baby,
  Activity,
  CheckCircle,
  Clock,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const [metrics, setMetrics] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    birthRequests: 0,
    pendingBirths: 0,
    deathRequests: 0,
    pendingDeaths: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all records to compile actual dashboard figures!
      const complaintsRes = await apiRequest('/api/complaints/all');
      const birthRes = await apiRequest('/api/birth/all');
      const deathRes = await apiRequest('/api/death/all');

      const complaintsList = complaintsRes.data || [];
      const birthList = birthRes.data || [];
      const deathList = deathRes.data || [];

      setMetrics({
        totalComplaints: complaintsList.length,
        pendingComplaints: complaintsList.filter(c => c.status !== 'Resolved').length,
        resolvedComplaints: complaintsList.filter(c => c.status === 'Resolved').length,
        birthRequests: birthList.length,
        pendingBirths: birthList.filter(b => b.status === 'Pending').length,
        deathRequests: deathList.length,
        pendingDeaths: deathList.filter(d => d.status === 'Pending').length,
      });
    } catch (err) {
      setError('Could not load dashboard statistics. Please verify backend connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statsList = [
    {
      title: 'Total Grievances',
      count: metrics.totalComplaints,
      desc: 'Total logged civic complaints',
      icon: <Inbox size={28} />,
      colorClass: 'blue',
    },
    {
      title: 'Pending Grievances',
      count: metrics.pendingComplaints,
      desc: 'Awaiting resolution actions',
      icon: <Clock size={28} />,
      colorClass: 'saffron',
    },
    {
      title: 'Resolved Grievances',
      count: metrics.resolvedComplaints,
      desc: 'Successfully closed cases',
      icon: <CheckCircle size={28} />,
      colorClass: 'green',
    },
    {
      title: 'Birth Requests',
      count: metrics.birthRequests,
      desc: 'Applications registered',
      icon: <Baby size={28} />,
      colorClass: 'blue',
    },
    {
      title: 'Pending Birth Certificates',
      count: metrics.pendingBirths,
      desc: 'Applications to verify',
      icon: <Clock size={28} />,
      colorClass: 'saffron',
    },
    {
      title: 'Death Requests',
      count: metrics.deathRequests,
      desc: 'Applications registered',
      icon: <Activity size={28} />,
      colorClass: 'blue',
    },
    {
      title: 'Pending Death Certificates',
      count: metrics.pendingDeaths,
      desc: 'Applications to verify',
      icon: <Clock size={28} />,
      colorClass: 'saffron',
    },
  ];

  return (
    <div>
      <div className="content-header">
        <h2>Administrative Control Center</h2>
        <div style={{ fontSize: '13px', color: 'var(--light-text)', fontWeight: '600' }}>
          Official: <strong>{user?.name}</strong> | Role: <strong>{user?.role}</strong>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Admin Notice Board */}
      <div className="gov-card" style={{ borderLeft: '5px solid var(--primary-blue)', background: 'linear-gradient(to right, #ffffff, #f4f6f9)' }}>
        <h3 style={{ color: 'var(--primary-blue)', fontSize: '18px', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase' }}>
          Panchayat Administration Portal
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--light-text)', lineHeight: '1.6' }}>
          Use the dashboard below to manage local governance. Review citizen grievances, play voice recordings, inspect submitted photographs, verify document attachments (discharge cards/cremation slips), and approve certificate issuances. Once approved, secure digital certificate IDs are generated automatically.
        </p>
      </div>

      {loading ? (
        <Loader message="Compiling administrative records..." />
      ) : (
        <div>
          {/* Stats Grid */}
          <h3 style={{ fontSize: '15px', color: 'var(--secondary-blue)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '20px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            System Metrics Overview
          </h3>
          
          <div className="dashboard-grid">
            {statsList.map((stat, idx) => (
              <div key={idx} className={`stats-card ${stat.colorClass}`}>
                <div className="stats-info">
                  <h3>{stat.title}</h3>
                  <p>{stat.count}</p>
                  <span style={{ fontSize: '11px', color: 'var(--light-text)' }}>{stat.desc}</span>
                </div>
                <div className="stats-icon" style={{ color: stat.colorClass === 'saffron' ? 'var(--saffron)' : stat.colorClass === 'green' ? 'var(--green)' : 'var(--primary-blue)' }}>
                  {stat.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions Panel */}
          <div className="gov-card">
            <div className="gov-card-header">Administrative Shortcuts</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '10px' }}>
              <a href="/admin/complaints" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Inbox size={16} /> Manage Civic Complaints
              </a>
              <a href="/admin/birth-requests" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Baby size={16} /> Review Birth Certificates
              </a>
              <a href="/admin/death-requests" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} /> Review Death Certificates
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
