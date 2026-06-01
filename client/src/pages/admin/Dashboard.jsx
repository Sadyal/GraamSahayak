import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
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
  Star,
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
    avgRating: 0,
    totalReviews: 0,
  });

  const [recentReviews, setRecentReviews] = useState([]);
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

      // Calculate satisfaction scorecard metrics
      const ratedComplaints = complaintsList.filter(c => c.feedback && c.feedback.rating);
      const ratingsSum = ratedComplaints.reduce((acc, c) => acc + c.feedback.rating, 0);
      const avgRating = ratedComplaints.length > 0 ? ratingsSum / ratedComplaints.length : 0;

      setMetrics({
        totalComplaints: complaintsList.length,
        pendingComplaints: complaintsList.filter(c => c.status !== 'Resolved').length,
        resolvedComplaints: complaintsList.filter(c => c.status === 'Resolved').length,
        birthRequests: birthList.length,
        pendingBirths: birthList.filter(b => b.status === 'Pending').length,
        deathRequests: deathList.length,
        pendingDeaths: deathList.filter(d => d.status === 'Pending').length,
        avgRating,
        totalReviews: ratedComplaints.length,
      });

      // Sort and slice top 3 recent reviews
      const sortedReviews = [...ratedComplaints].sort(
        (a, b) => new Date(b.feedback.ratedAt || b.updatedAt) - new Date(a.feedback.ratedAt || a.updatedAt)
      );
      setRecentReviews(sortedReviews.slice(0, 3));
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
    {
      title: 'Citizen Satisfaction Index',
      count: metrics.avgRating > 0 ? `${metrics.avgRating.toFixed(1)} / 5.0` : 'N/A',
      desc: `Based on ${metrics.totalReviews} rated grievances`,
      icon: <Star size={28} />,
      colorClass: 'green',
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
              <Link to="/admin/complaints" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Inbox size={16} /> Manage Civic Complaints
              </Link>
              <Link to="/admin/birth-requests" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Baby size={16} /> Review Birth Certificates
              </Link>
              <Link to="/admin/death-requests" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} /> Review Death Certificates
              </Link>
            </div>
          </div>

          {/* Recent Citizen Reviews & Feedback Panel */}
          <div className="gov-card" style={{ marginTop: '25px' }}>
            <div className="gov-card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px' }}>
              <Star size={16} style={{ color: '#eab308' }} /> Recent Citizen Grievance Reviews
            </div>
            
            {recentReviews.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--light-text)', fontStyle: 'italic', margin: '15px 0 0 0' }}>
                No citizen reviews or ratings have been submitted for resolved complaints yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }} className="reviews-stack">
                {recentReviews.map((rev) => (
                  <div
                    key={rev._id}
                    style={{
                      padding: '15px',
                      borderRadius: '6px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderLeft: '4px solid #ea580c',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                    className="review-item-card"
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      {/* Star Rating Display */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill={star <= rev.feedback.rating ? '#eab308' : 'none'}
                            stroke={star <= rev.feedback.rating ? '#eab308' : '#cbd5e1'}
                            width="16"
                            height="16"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#ea580c', marginLeft: '4px' }}>
                          ({rev.feedback.rating}/5)
                        </span>
                      </div>

                      {/* Metadata */}
                      <span style={{ fontSize: '11px', color: 'var(--light-text)' }}>
                        Resolved ID: <strong>{rev._id.slice(-6).toUpperCase()}</strong> | Type: <strong>{rev.complaintType}</strong>
                      </span>
                    </div>

                    {/* Citizen Name & Ward */}
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--secondary-blue)' }}>
                      Citizen: {rev.citizen?.name || 'Anonymous Ramesh'} (Ward {rev.citizen?.wardNumber || '03'})
                    </div>

                    {/* Written Comment */}
                    <p style={{ fontSize: '13px', margin: 0, color: 'var(--dark-text)', fontStyle: 'italic', lineHeight: '1.4' }}>
                      "{rev.feedback.comment || 'Citizen submitted a rating without comment.'}"
                    </p>

                    {/* Date */}
                    <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'right' }}>
                      Submitted on: {new Date(rev.feedback.ratedAt || rev.updatedAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
