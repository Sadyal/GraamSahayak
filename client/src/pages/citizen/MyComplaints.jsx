import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiRequest from '../../services/axiosInstance';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { PlusCircle, Image, Volume2, Eye, EyeOff, Calendar, Award } from 'lucide-react';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/complaints/my');
      setComplaints(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
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
        <h2>My Lodged Grievances</h2>
        <Link to="/citizen/complaint/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <PlusCircle size={16} />
          File New Complaint
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <Loader message="Fetching grievance history..." />
      ) : complaints.length === 0 ? (
        <div className="gov-card text-center" style={{ padding: '40px 20px' }}>
          <p style={{ fontSize: '15px', color: 'var(--light-text)', marginBottom: '15px' }}>
            You have not registered any grievances yet.
          </p>
          <Link to="/citizen/complaint/new" className="btn btn-outline">
            Register Your First Grievance
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {complaints.map((complaint) => {
            const isExpanded = expandedId === complaint._id;
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
                {/* Header row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--light-text)', fontWeight: 'bold' }}>
                      ID: {complaint._id.slice(-8).toUpperCase()}
                    </span>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--secondary-blue)', textTransform: 'uppercase', margin: '3px 0' }}>
                      {complaint.complaintType}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--light-text)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {formatDate(complaint.createdAt)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <StatusBadge status={complaint.status} />
                    
                    <button
                      onClick={() => toggleExpand(complaint._id)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                    >
                      {isExpanded ? (
                        <>
                          <EyeOff size={14} /> Hide Details
                        </>
                      ) : (
                        <>
                          <Eye size={14} /> View Details
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details section */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '15px', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '12px', color: 'var(--primary-blue)', textTransform: 'uppercase', marginBottom: '5px' }}>
                        Description of Grievance
                      </strong>
                      <p style={{ fontSize: '14px', color: 'var(--dark-text)', whiteSpace: 'pre-wrap', lineHeight: '1.6', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                        {complaint.description}
                      </p>
                    </div>

                    {/* Media Attachments */}
                    {(complaint.imagePath || complaint.audioPath) && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                        {complaint.imagePath && (
                          <div>
                            <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--primary-blue)', textTransform: 'uppercase', marginBottom: '5px' }}>
                              <Image size={14} /> Photo Attachment
                            </strong>
                            <a href={`/${complaint.imagePath}`} target="_blank" rel="noopener noreferrer">
                              <img
                                src={`/${complaint.imagePath}`}
                                alt="Attachment"
                                style={{
                                  maxWidth: '220px',
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
                              <Volume2 size={14} /> Voice Complaint Recording
                            </strong>
                            <audio src={`/${complaint.audioPath}`} controls style={{ width: '100%', height: '40px', marginTop: '5px' }} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin Remarks */}
                    <div style={{ padding: '15px', borderRadius: '4px', backgroundColor: complaint.status === 'Resolved' ? '#ecfdf5' : '#f8fafc', borderLeft: `4px solid ${complaint.status === 'Resolved' ? 'var(--green)' : '#cbd5e1'}` }}>
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--secondary-blue)', textTransform: 'uppercase', marginBottom: '5px' }}>
                        <Award size={15} /> Panchayat Administration Remarks
                      </strong>
                      <p style={{ fontSize: '13px', color: complaint.adminRemarks ? 'var(--dark-text)' : 'var(--light-text)', fontStyle: complaint.adminRemarks ? 'normal' : 'italic', lineHeight: '1.5' }}>
                        {complaint.adminRemarks || 'No updates or comments provided yet by the Panchayat office.'}
                      </p>
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

export default MyComplaints;
