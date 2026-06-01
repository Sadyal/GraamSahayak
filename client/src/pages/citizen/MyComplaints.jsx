import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiRequest from '../../services/axiosInstance';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { PlusCircle, Image, Volume2, Eye, EyeOff, Calendar, Award } from 'lucide-react';

const GrievanceRatingForm = ({ complaintId, existingFeedback, onFeedbackSubmitted }) => {
  const [rating, setRating] = useState(existingFeedback?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingFeedback?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(!!existingFeedback?.rating);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      return setError('Please select a star rating between 1 and 5.');
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await apiRequest(`/api/complaints/${complaintId}/rate`, {
        method: 'POST',
        body: { rating, comment },
      });
      setSuccess(true);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success || existingFeedback?.rating) {
    const finalRating = rating || existingFeedback?.rating;
    const finalComment = comment || existingFeedback?.comment;
    return (
      <div style={{ padding: '15px', borderRadius: '4px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', marginTop: '12px' }}>
        <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#16a34a', textTransform: 'uppercase', marginBottom: '5px' }}>
          ⭐ Your Resolution Feedback
        </strong>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={star <= finalRating ? '#eab308' : 'none'}
              stroke={star <= finalRating ? '#eab308' : '#cbd5e1'}
              width="20"
              height="20"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
          <span style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '6px', color: '#16a34a' }}>
            ({finalRating}/5 Stars)
          </span>
        </div>
        {finalComment && (
          <p style={{ fontSize: '13px', color: '#374151', margin: 0, fontStyle: 'italic', lineHeight: '1.4' }}>
            "{finalComment}"
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '15px', borderRadius: '4px', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', marginTop: '12px' }}>
      <strong style={{ display: 'block', fontSize: '13px', color: '#ea580c', textTransform: 'uppercase', marginBottom: '8px' }}>
        ⭐ Rate Resolution Quality
      </strong>
      <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 12px 0', lineHeight: '1.4' }}>
        How satisfied are you with the resolution of this grievance? Your feedback helps the Panchayat maintain service standards.
      </p>

      {error && <div className="alert alert-error" style={{ padding: '8px 12px', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}

      <form onSubmit={handleSubmitFeedback}>
        {/* Star Rating Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }} className="star-rating-row">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.1s ease',
              }}
              className="star-btn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={star <= (hoverRating || rating) ? '#eab308' : 'none'}
                stroke={star <= (hoverRating || rating) ? '#eab308' : '#9ca3af'}
                width="30"
                height="30"
                style={{
                  transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: star <= (hoverRating || rating) ? 'scale(1.15)' : 'scale(1.0)',
                }}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          ))}
          {rating > 0 && (
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#ea580c', marginLeft: '8px' }}>
              {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'} ({rating}/5)
            </span>
          )}
        </div>

        {/* Feedback Comment */}
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <textarea
            className="form-control"
            rows="2"
            placeholder="Add a comment about the resolution (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
            style={{ fontSize: '13px', resize: 'vertical' }}
          ></textarea>
        </div>

        <button
          type="submit"
          className="btn btn-success btn-rating-submit"
          disabled={submitting}
          style={{
            fontSize: '12px',
            padding: '6px 16px',
            height: '32px',
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#ea580c',
            borderColor: '#ea580c',
            width: '100%',
            maxWidth: '180px',
            justifyContent: 'center',
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Satisfaction'}
        </button>
      </form>

      <style>{`
        @media (max-width: 600px) {
          .star-btn svg {
            width: 36px !important;
            height: 36px !important;
          }
          .btn-rating-submit {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const handleFeedbackSubmitted = (updatedComplaint) => {
    setComplaints(complaints.map(c => c._id === updatedComplaint._id ? updatedComplaint : c));
  };

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

                    {/* Citizen Feedback Rating System */}
                    {complaint.status === 'Resolved' && (
                      <GrievanceRatingForm
                        complaintId={complaint._id}
                        existingFeedback={complaint.feedback}
                        onFeedbackSubmitted={handleFeedbackSubmitted}
                      />
                    )}
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
