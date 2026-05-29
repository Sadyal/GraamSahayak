import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiRequest from '../../services/axiosInstance';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { RefreshCw, FileText, CheckCircle, XCircle, Eye, EyeOff, Save, Calendar, Download } from 'lucide-react';

const DeathRequests = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Review states
  const [expandedId, setExpandedId] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [statusAction, setStatusAction] = useState('Approved');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiRequest('/api/death/all');
      setApplications(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = (app) => {
    if (expandedId === app._id) {
      setExpandedId(null);
    } else {
      setExpandedId(app._id);
      setRemarks(app.adminRemarks || '');
      setStatusAction(app.status === 'Pending' ? 'Approved' : app.status);
    }
  };

  const handleUpdateStatus = async (id) => {
    setError('');
    setSuccess('');
    setActionLoading(true);
    try {
      const res = await apiRequest(`/api/death/${id}`, {
        method: 'PATCH',
        body: {
          status: statusAction,
          adminRemarks: remarks,
        },
      });

      setSuccess(`Application status successfully updated to ${statusAction}!`);
      
      // Update local state
      setApplications(applications.map(app => {
        if (app._id === id) {
          return {
            ...app,
            status: statusAction,
            adminRemarks: remarks,
            certificateId: res.data.certificateId,
          };
        }
        return app;
      }));

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update application.');
    } finally {
      setActionLoading(false);
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

  return (
    <div>
      <div className="content-header">
        <h2>Death Certificate Applications</h2>
        <button onClick={fetchApplications} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <Loader message="Loading death registrations..." />
      ) : applications.length === 0 ? (
        <div className="gov-card text-center" style={{ padding: '40px 20px' }}>
          <p style={{ fontSize: '15px', color: 'var(--light-text)' }}>No death certificate applications found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {applications.map((app) => {
            const isExpanded = expandedId === app._id;
            const citizen = app.citizen || {};
            return (
              <div
                key={app._id}
                className="gov-card"
                style={{
                  borderLeft: `5px solid ${
                    app.status === 'Approved'
                      ? 'var(--green)'
                      : app.status === 'Rejected'
                      ? '#dc2626'
                      : 'var(--saffron)'
                  }`,
                  padding: '16px 20px',
                  marginBottom: '0px',
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--light-text)', fontWeight: 'bold' }}>
                      APP NUMBER: {app.applicationNumber} | Village: {citizen.village || 'N/A'} (Ward {citizen.wardNumber || 'N/A'})
                    </span>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--secondary-blue)', textTransform: 'uppercase', margin: '3px 0' }}>
                      Deceased: {app.deceasedName} (Age: {app.ageAtDeath} | {app.gender})
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--light-text)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      Applicant: <strong>{app.applicantName}</strong> ({app.applicantRelation}) on {formatDate(app.createdAt)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <StatusBadge status={app.status} />

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {app.status === 'Approved' && (
                        <Link
                          to={`/citizen/certificate/death/${app._id}`}
                          className="btn btn-success"
                          style={{ padding: '6px 12px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Download size={14} /> Certificate
                        </Link>
                      )}
                      
                      <button
                        onClick={() => handleToggleExpand(app)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                      >
                        {isExpanded ? (
                          <>
                            <EyeOff size={14} /> Close Review
                          </>
                        ) : (
                          <>
                            <Eye size={14} /> Review
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Review Section */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '15px', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    {/* Application Details Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--light-text)', fontWeight: 'bold' }}>DATE OF DEATH</span>
                        <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{formatDate(app.dateOfDeath)}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--light-text)', fontWeight: 'bold' }}>PLACE OF DEATH</span>
                        <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{app.placeOfDeath}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--light-text)', fontWeight: 'bold' }}>FATHER / SPOUSE NAME</span>
                        <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{app.fatherOrSpouseName}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--light-text)', fontWeight: 'bold' }}>APPLICANT PHONE</span>
                        <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{citizen.phone || 'No phone registered'}</p>
                      </div>
                      <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e5e7eb', paddingTop: '10px', marginTop: '5px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--light-text)', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                          SUPPORTING UPLOAD PROOF DOCUMENT
                        </span>
                        <a
                          href={`http://localhost:5000/${app.documentPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline"
                          style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <FileText size={14} /> Open Uploaded Proof Slip (New Tab)
                        </a>
                      </div>
                    </div>

                    {/* Review Forms */}
                    <div style={{ border: '1px solid #e5e7eb', padding: '15px', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
                      <strong style={{ display: 'block', fontSize: '13px', color: 'var(--secondary-blue)', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px' }}>
                        Verification Verdict
                      </strong>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                        <div className="form-group">
                          <label htmlFor="statusAction">Verification Decision *</label>
                          <select
                            id="statusAction"
                            className="form-control"
                            value={statusAction}
                            onChange={(e) => setStatusAction(e.target.value)}
                            disabled={actionLoading}
                          >
                            <option value="Approved">Approve and Generate Certificate</option>
                            <option value="Rejected">Reject Application</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label htmlFor="remarks">Verification Remarks / Instructions</label>
                          <input
                            type="text"
                            id="remarks"
                            className="form-control"
                            placeholder="Enter notes (e.g. Verified with village register entry #120)"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            disabled={actionLoading}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => handleUpdateStatus(app._id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%' }}
                        disabled={actionLoading}
                      >
                        <Save size={16} />
                        {actionLoading ? 'Updating Database...' : 'Save Decision & Notify Citizen'}
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeathRequests;
