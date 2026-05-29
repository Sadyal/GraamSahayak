import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiRequest from '../../services/axiosInstance';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { FileText, Download, Calendar, Baby, Activity, AlertCircle } from 'lucide-react';

const MyApplications = () => {
  const [birthApps, setBirthApps] = useState([]);
  const [deathApps, setDeathApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('birth'); // 'birth' or 'death'

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const birthRes = await apiRequest('/api/birth/my');
      setBirthApps(birthRes.data || []);

      const deathRes = await apiRequest('/api/death/my');
      setDeathApps(deathRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const activeApps = activeTab === 'birth' ? birthApps : deathApps;

  return (
    <div>
      <div className="content-header">
        <h2>My Certificate Applications</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('birth')}
            className={`btn ${activeTab === 'birth' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <Baby size={16} />
            Birth Registrations ({birthApps.length})
          </button>
          <button
            onClick={() => setActiveTab('death')}
            className={`btn ${activeTab === 'death' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <Activity size={16} />
            Death Registrations ({deathApps.length})
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <Loader message="Fetching application records..." />
      ) : activeApps.length === 0 ? (
        <div className="gov-card text-center" style={{ padding: '40px 20px' }}>
          <p style={{ fontSize: '15px', color: 'var(--light-text)', marginBottom: '15px' }}>
            No {activeTab} certificate applications found in your profile.
          </p>
          <Link
            to={activeTab === 'birth' ? '/citizen/birth-apply' : '/citizen/death-apply'}
            className="btn btn-outline"
          >
            Submit New {activeTab === 'birth' ? 'Birth' : 'Death'} Application
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>App No.</th>
                <th>Submission Date</th>
                <th>{activeTab === 'birth' ? 'Child Name' : 'Deceased Name'}</th>
                <th>Father / Spouse</th>
                <th>Status</th>
                <th>Admin Remarks</th>
                <th style={{ textAlign: 'center' }}>Certificate Action</th>
              </tr>
            </thead>
            <tbody>
              {activeApps.map((app) => (
                <tr key={app._id}>
                  <td style={{ fontWeight: 'bold', color: 'var(--secondary-blue)', fontSize: '13px' }}>
                    {app.applicationNumber}
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                      <Calendar size={12} />
                      {formatDate(app.createdAt)}
                    </span>
                  </td>
                  <td style={{ fontWeight: 'bold' }}>
                    {activeTab === 'birth' ? app.childName : app.deceasedName}
                  </td>
                  <td>
                    {activeTab === 'birth' ? app.fatherName : app.fatherOrSpouseName}
                  </td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--light-text)', fontStyle: 'italic', maxWidth: '180px' }}>
                    {app.adminRemarks || 'Under verification.'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {app.status === 'Approved' ? (
                      <Link
                        to={`/citizen/certificate/${activeTab}/${app._id}`}
                        className="btn btn-success"
                        style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Download size={13} />
                        View Certificate
                      </Link>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--light-text)', fontWeight: 'bold' }}>
                        {app.status === 'Pending' ? 'Processing' : 'Application Rejected'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
