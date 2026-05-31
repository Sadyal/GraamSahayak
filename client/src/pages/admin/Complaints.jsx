import React, { useState, useEffect } from 'react';
import apiRequest from '../../services/axiosInstance';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { Search, Filter, RefreshCw, Eye, EyeOff, Image, Volume2, Save, Trash2, Calendar } from 'lucide-react';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [villageFilter, setVillageFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Action states
  const [expandedId, setExpandedId] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Build query string
      let queryParams = [];
      if (statusFilter) queryParams.push(`status=${statusFilter}`);
      if (villageFilter) queryParams.push(`village=${villageFilter}`);
      if (dateFilter) queryParams.push(`date=${dateFilter}`);
      
      const queryStr = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      
      const res = await apiRequest(`/api/complaints/all${queryStr}`);
      setComplaints(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = (complaint) => {
    if (expandedId === complaint._id) {
      setExpandedId(null);
    } else {
      setExpandedId(complaint._id);
      setRemarks(complaint.adminRemarks || '');
      setUpdateStatus(complaint.status || 'Pending');
    }
  };

  const handleUpdateStatus = async (id) => {
    setError('');
    setSuccess('');
    setActionLoading(true);
    try {
      await apiRequest(`/api/complaints/${id}`, {
        method: 'PATCH',
        body: {
          status: updateStatus,
          adminRemarks: remarks,
        },
      });

      setSuccess('Complaint record updated successfully!');
      
      // Update local state instead of re-fetching
      setComplaints(complaints.map(c => {
        if (c._id === id) {
          return { ...c, status: updateStatus, adminRemarks: remarks };
        }
        return c;
      }));

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm('WARNING: Are you absolutely sure you want to permanently delete this complaint and all associated upload files?')) {
      return;
    }

    setError('');
    setSuccess('');
    setActionLoading(true);
    try {
      await apiRequest(`/api/complaints/${id}`, {
        method: 'DELETE',
      });

      setSuccess('Complaint deleted successfully.');
      setComplaints(complaints.filter(c => c._id !== id));
      setExpandedId(null);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="content-header">
        <h2>Grievances Lodged Management</h2>
        <button onClick={fetchComplaints} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Filter Bar */}
      <div className="gov-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end', backgroundColor: '#f9fafb', border: '1px solid var(--border-color)' }}>
        
        <div className="form-group" style={{ marginBottom: '0', flex: '1', minWidth: '150px' }}>
          <label htmlFor="statusFilter" style={{ fontSize: '11px' }}>Filter Status</label>
          <select
            id="statusFilter"
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '0', flex: '1', minWidth: '150px' }}>
          <label htmlFor="villageFilter" style={{ fontSize: '11px' }}>Filter Village</label>
          <input
            type="text"
            id="villageFilter"
            className="form-control"
            placeholder="Search Village"
            value={villageFilter}
            onChange={(e) => setVillageFilter(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '0', flex: '1', minWidth: '150px' }}>
          <label htmlFor="dateFilter" style={{ fontSize: '11px' }}>Filter Date</label>
          <input
            type="date"
            id="dateFilter"
            className="form-control"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <button
          onClick={fetchComplaints}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '38px', minWidth: '110px' }}
        >
          <Filter size={16} /> Filter
        </button>
      </div>

      {loading ? (
        <Loader message="Loading registered complaints..." />
      ) : complaints.length === 0 ? (
        <div className="gov-card text-center" style={{ padding: '40px 20px' }}>
          <p style={{ fontSize: '15px', color: 'var(--light-text)' }}>No civic complaints found matching the criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          {complaints.map((complaint) => {
            const isExpanded = expandedId === complaint._id;
            const citizen = complaint.citizen || {};
            return (
              <div
                key={complaint._id}
                className="gov-card"
                style={{
                  borderLeft: `5px solid ${
                    complaint.status === 'Resolved'
                      ? 'var(--green)'
                      : complaint.status === 'In Progress'
                      ? 'var(--primary-blue)'
                      : 'var(--saffron)'
                  }`,
                  padding: '16px 20px',
                  marginBottom: '0px',
                }}
              >
                {/* Header overview row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--light-text)', fontWeight: 'bold' }}>
                      ID: {complaint._id.slice(-8).toUpperCase()} | Village: {citizen.village || 'N/A'} (Ward {citizen.wardNumber || 'N/A'})
                    </span>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--secondary-blue)', textTransform: 'uppercase', margin: '3px 0' }}>
                      {complaint.complaintType}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--light-text)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      Filed by: <strong>{citizen.name || 'Anonymous'}</strong> ({citizen.phone || 'No Phone'}) on {formatDate(complaint.createdAt)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <StatusBadge status={complaint.status} />
                    
                    <button
                      onClick={() => handleToggleExpand(complaint)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                    >
                      {isExpanded ? (
                        <>
                          <EyeOff size={14} /> Close Review
                        </>
                      ) : (
                        <>
                          <Eye size={14} /> Review Complaint
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expansion details */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '15px', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '12px', color: 'var(--primary-blue)', textTransform: 'uppercase', marginBottom: '5px' }}>
                        Citizen Statement
                      </strong>
                      <p style={{ fontSize: '14px', color: 'var(--dark-text)', whiteSpace: 'pre-wrap', lineHeight: '1.6', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                        {complaint.description}
                      </p>
                    </div>

                    {/* Media attachments */}
                    {(complaint.imagePath || complaint.audioPath) && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                        {complaint.imagePath && (
                          <div>
                            <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--primary-blue)', textTransform: 'uppercase', marginBottom: '5px' }}>
                              <Image size={14} /> Grievance Snapshot
                            </strong>
                            <a href={`/${complaint.imagePath}`} target="_blank" rel="noopener noreferrer">
                              <img
                                src={`/${complaint.imagePath}`}
                                alt="Complaint attachment"
                                style={{
                                  maxWidth: '280px',
                                  height: 'auto',
                                  borderRadius: '4px',
                                  border: '1px solid #d1d5db',
                                  display: 'block',
                                }}
                              />
                            </a>
                          </div>
                        )}

                        {complaint.audioPath && (
                          <div style={{ flex: '1', minWidth: '250px' }}>
                            <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--primary-blue)', textTransform: 'uppercase', marginBottom: '5px' }}>
                              <Volume2 size={14} /> Voice Grievance recording
                            </strong>
                            <audio src={`/${complaint.audioPath}`} controls style={{ width: '100%', height: '40px', marginTop: '5px' }} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Review Form */}
                    <div style={{ border: '1px solid #e5e7eb', padding: '15px', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
                      <strong style={{ display: 'block', fontSize: '13px', color: 'var(--secondary-blue)', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px' }}>
                        Action Board
                      </strong>

                      <div className="gov-form-row">
                        <div className="form-group">
                          <label htmlFor="updateStatus">Update Grievance Status *</label>
                          <select
                            id="updateStatus"
                            className="form-control"
                            value={updateStatus}
                            onChange={(e) => setUpdateStatus(e.target.value)}
                            disabled={actionLoading}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label htmlFor="remarks">Action Taken / Admin Remarks</label>
                          <input
                            type="text"
                            id="remarks"
                            className="form-control"
                            placeholder="Enter steps taken or verification details (e.g. Electrician dispatched to Ward 3)"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            disabled={actionLoading}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', marginTop: '10px' }}>
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={() => handleUpdateStatus(complaint._id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                          disabled={actionLoading}
                        >
                          <Save size={16} /> Save Status & Remarks
                        </button>

                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleDeleteComplaint(complaint._id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                          disabled={actionLoading}
                        >
                          <Trash2 size={16} /> Delete Grievance
                        </button>
                      </div>
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

export default Complaints;
