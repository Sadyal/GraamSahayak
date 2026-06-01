import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from '../../services/axiosInstance';
import Loader from '../../components/Loader';
import {
  Bell,
  Megaphone,
  Calendar,
  Heart,
  Tag,
  Printer,
  X,
  FileText,
  Clock,
} from 'lucide-react';

const Notices = () => {
  const { user } = useContext(AuthContext);

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selected Notice for detailed modal view
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    if (user?.village) {
      fetchNotices();
    }
  }, [user]);

  const fetchNotices = async () => {
    if (!user?.village) return;
    setLoading(true);
    setError('');
    try {
      // API call to fetch notices active in citizen's village
      const res = await apiRequest(`/api/notices?village=${user.village}`);
      setNotices(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch e-Notice board announcements.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Scheme':
        return <Tag size={16} />;
      case 'Health':
        return <Heart size={16} />;
      case 'Event':
        return <Calendar size={16} />;
      case 'General':
        return <Megaphone size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'Urgent':
        return {
          bg: '#fee2e2',
          border: '#fecaca',
          color: '#dc2626',
        };
      case 'Medium':
        return {
          bg: '#fff7ed',
          border: '#ffedd5',
          color: '#ea580c',
        };
      default:
        return {
          bg: '#eff6ff',
          border: '#dbeafe',
          color: '#2563eb',
        };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No Expiry';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="notices-container">
      {/* Dynamic Print Styles for Official Notice */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: 6px double #003366 !important;
            padding: 30px !important;
            margin: 0 !important;
            box-shadow: none !important;
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="content-header no-print">
        <div>
          <h2>Gram Panchayat e-Notice Board</h2>
          <p style={{ fontSize: '13px', color: 'var(--light-text)', marginTop: '4px' }}>
            Official bulletins, developmental projects, health alerts, and welfare schemes for <strong>{user?.village}</strong>.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error no-print">{error}</div>}

      {loading ? (
        <Loader message="Fetching Panchayat announcements..." />
      ) : notices.length === 0 ? (
        <div className="gov-card text-center no-print" style={{ padding: '60px 20px', borderTop: '4px solid var(--saffron)' }}>
          <Megaphone size={40} style={{ color: 'var(--light-text)', marginBottom: '15px' }} />
          <p style={{ fontSize: '15px', color: 'var(--light-text)' }}>
            There are currently no active official announcements published for your village.
          </p>
        </div>
      ) : (
        <div className="notices-grid no-print">
          {notices.map((notice) => {
            const styles = getSeverityStyles(notice.severity);
            return (
              <div
                key={notice._id}
                className="notice-card"
                onClick={() => setSelectedNotice(notice)}
                style={{
                  borderTop: `4px solid ${styles.color}`,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  backgroundColor: '#ffffff',
                  borderRadius: '6px',
                  padding: '20px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  {/* Category badge */}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: 'var(--primary-blue)',
                      backgroundColor: '#eff6ff',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {getCategoryIcon(notice.category)}
                    {notice.category}
                  </span>

                  {/* Severity badge */}
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      backgroundColor: styles.bg,
                      color: styles.color,
                      border: `1px solid ${styles.border}`,
                      padding: '2px 8px',
                      borderRadius: '3px',
                    }}
                  >
                    {notice.severity}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '15px', color: 'var(--secondary-blue)', fontWeight: 'bold', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                  {notice.title}
                </h3>

                {/* Short snippet */}
                <p style={{ fontSize: '13px', color: 'var(--light-text)', lineHeight: '1.5', margin: 0, flex: 1 }}>
                  {notice.description.length > 120
                    ? `${notice.description.substring(0, 120)}...`
                    : notice.description}
                </p>

                {/* Footer metadata */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '12px',
                    marginTop: 'auto',
                    fontSize: '11px',
                    color: '#64748b',
                    gap: '6px',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {formatDate(notice.createdAt)}
                  </span>
                  {notice.expiryDate && (
                    <span style={{ color: '#dc2626', fontWeight: 'bold' }}>
                      Expires: {formatDate(notice.expiryDate)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Styled Double-Border Official Notice Details Modal */}
      {selectedNotice && (
        <div
          className="notice-modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px',
            overflowY: 'auto',
          }}
        >
          <div
            className="notice-modal-card"
            style={{
              backgroundColor: '#ffffff',
              maxWidth: '650px',
              width: '100%',
              borderRadius: '8px',
              position: 'relative',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
          >
            {/* Modal Actions Header (Non-printable) */}
            <div
              className="no-print"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 20px',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
              }}
            >
              <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--secondary-blue)' }}>
                OFFICIAL BULLETIN PREVIEW
              </span>
              <div style={{ display: 'inline-flex', gap: '8px' }}>
                <button
                  onClick={handlePrint}
                  className="btn btn-success"
                  style={{
                    padding: '5px 12px',
                    fontSize: '12px',
                    height: 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Printer size={12} /> Print Notice
                </button>
                <button
                  onClick={() => setSelectedNotice(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Notice Area */}
            <div style={{ overflowY: 'auto', padding: '20px' }}>
              
              {/* Official Double Border Document Frame */}
              <div
                id="print-area"
                style={{
                  border: '4px double var(--primary-blue)',
                  padding: '25px',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  position: 'relative',
                }}
              >
                {/* Ashoka Emblem Placeholder / Tricolor Accent */}
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <div style={{ width: '100%', height: '4px', background: 'linear-gradient(to right, #ff9933 33%, #ffffff 33%, #ffffff 66%, #138808 66%)', marginBottom: '12px' }} />
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: '2px solid var(--primary-blue)',
                      color: 'var(--primary-blue)',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      backgroundColor: '#eff6ff',
                      marginBottom: '8px',
                    }}
                  >
                    सत्यमेव
                  </div>
                  <h4 style={{ margin: '0', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', color: '#1e293b', fontWeight: 'bold' }}>
                    Office of the Gram Panchayat Administration
                  </h4>
                  <h3 style={{ margin: '2px 0 0 0', fontSize: '16px', textTransform: 'uppercase', color: 'var(--primary-blue)', fontWeight: '800' }}>
                    {selectedNotice.village} Gram Panchayat
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
                    Ministry of Panchayati Raj, Govt of India
                  </p>
                </div>

                {/* Horizontal line divider */}
                <div style={{ borderBottom: '1px solid #cbd5e1', marginBottom: '15px' }}></div>

                {/* Reference Details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', marginBottom: '20px' }}>
                  <span>REF NO: <strong>GP-{selectedNotice.village.substring(0,3).toUpperCase()}-N/{selectedNotice._id.substring(18,24).toUpperCase()}</strong></span>
                  <span>DATE: <strong>{formatDate(selectedNotice.createdAt)}</strong></span>
                </div>

                {/* Notice Heading Header */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <span
                    style={{
                      borderBottom: '2px solid #000000',
                      paddingBottom: '2px',
                      fontSize: '15px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Official Announcement: {selectedNotice.category}
                  </span>
                </div>

                {/* Dynamic Badge for Print View */}
                {selectedNotice.severity === 'Urgent' && (
                  <div style={{ backgroundColor: '#fee2e2', border: '1px solid #dc2626', color: '#dc2626', fontWeight: 'bold', fontSize: '11px', padding: '6px 12px', borderRadius: '4px', textAlign: 'center', marginBottom: '15px', textTransform: 'uppercase' }}>
                    ⚠️ URGENT PUBLIC NOTICE - IMMEDIATE ATTENTION REQUIRED
                  </div>
                )}

                {/* Title */}
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--secondary-blue)', marginBottom: '15px', lineHeight: '1.4', textTransform: 'uppercase' }}>
                  {selectedNotice.title}
                </h2>

                {/* Description Body */}
                <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#1e293b', whiteSpace: 'pre-wrap', marginBottom: '25px', textAlign: 'justify' }}>
                  {selectedNotice.description}
                </p>

                {/* Expiry Warning */}
                {selectedNotice.expiryDate && (
                  <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    * This bulletin is active in Panchayat records until {formatDate(selectedNotice.expiryDate)}.
                  </div>
                )}

                {/* Sign-off footer section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                  
                  {/* Left: Stamp details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#64748b' }}>
                      <FileText size={10} /> GraamSahayak Verification
                    </div>
                    {/* Simulated Panchayat Seal stamp grid */}
                    <div style={{ border: '2px dashed #1e40af', color: '#1e40af', width: '90px', padding: '6px', textAlign: 'center', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', borderRadius: '4px', transform: 'rotate(-4deg)' }}>
                      PANCHAYAT<br />OFFICE SEAL
                    </div>
                  </div>

                  {/* Right: Signature */}
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontStyle: 'italic', color: '#64748b' }}>Digitally Approved By:</p>
                    <p style={{ margin: '0', fontSize: '12px', fontWeight: 'bold', color: 'var(--secondary-blue)', textTransform: 'uppercase' }}>
                      {selectedNotice.publishedBy?.name || 'Panchayat Officer'}
                    </p>
                    <p style={{ margin: '0', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>
                      {selectedNotice.publishedBy?.role || 'Admin Officer'}
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#10b981', fontWeight: 'bold' }}>
                      ✓ SECURED DIGITAL SIGNATURE
                    </p>
                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* Styled CSS elements for Notices Layout */}
      <style>{`
        .notices-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 15px;
        }

        .notices-container {
          padding: 0 10px;
        }

        /* PIN-POINT SMARTPHONE RESPONSIVE OVERRIDES */
        @media (max-width: 600px) {
          .notices-grid {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }
          .notice-modal-card {
            max-height: 95vh !important;
            width: 100% !important;
            margin: 0 !important;
          }
          .notice-modal-overlay {
            padding: 10px !important;
          }
          #print-area {
            padding: 15px !important;
            border-width: 3px !important;
          }
          #print-area h2 {
            font-size: 14px !important;
          }
          #print-area h3 {
            font-size: 14px !important;
          }
          #print-area p {
            font-size: 12px !important;
            line-height: 1.6 !important;
          }
        }
      `}</style>

    </div>
  );
};

export default Notices;
