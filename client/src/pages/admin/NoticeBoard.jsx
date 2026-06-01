import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from '../../services/axiosInstance';
import Loader from '../../components/Loader';
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  Megaphone,
  AlertTriangle,
  Calendar,
  Layers,
  RefreshCw,
} from 'lucide-react';

const NoticeBoard = () => {
  const { user } = useContext(AuthContext);

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [modalError, setModalError] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Notice');
  const [severity, setSeverity] = useState('Info');
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiRequest(`/api/notices?village=${user.village}`);
      setNotices(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch notices.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingNotice(null);
    setTitle('');
    setDescription('');
    setCategory('Notice');
    setSeverity('Info');
    setExpiryDate('');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (notice) => {
    setEditingNotice(notice);
    setTitle(notice.title);
    setDescription(notice.description);
    setCategory(notice.category);
    setSeverity(notice.severity);
    setExpiryDate(notice.expiryDate ? notice.expiryDate.split('T')[0] : '');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!title.trim() || !description.trim()) {
      return setModalError('Please enter both the announcement title and description content.');
    }

    setActionLoading(true);
    try {
      const body = {
        title: title.trim(),
        description: description.trim(),
        category,
        severity,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
      };

      if (editingNotice) {
        // Edit Notice
        const res = await apiRequest(`/api/notices/${editingNotice._id}`, {
          method: 'PUT',
          body,
        });
        
        setNotices(notices.map(n => n._id === editingNotice._id ? res.data : n));
        setSuccess(`Announcement "${title.trim()}" updated successfully!`);
      } else {
        // Create Notice
        const res = await apiRequest('/api/notices', {
          method: 'POST',
          body,
        });

        // Insert at beginning of list
        setNotices([res.data, ...notices]);
        setSuccess(`Announcement "${title.trim()}" published successfully to GP Notice Board!`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setModalError(err.message || 'Failed to submit announcement.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id, titleText) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently delete and wipe the notice "${titleText}"? Citizens will no longer see it. This action cannot be undone.`)) {
      return;
    }

    setError('');
    setSuccess('');
    const previousNotices = [...notices];

    // Optimistic UI update
    setNotices(notices.filter(n => n._id !== id));

    try {
      await apiRequest(`/api/notices/${id}`, {
        method: 'DELETE',
      });
      setSuccess(`Announcement "${titleText}" deleted successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setNotices(previousNotices);
      setError(err.message || 'Failed to delete notice.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Active until manually removed';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getSeverityBadgeClass = (sev) => {
    switch (sev) {
      case 'Urgent':
        return 'badge-urgent';
      case 'Medium':
        return 'badge-medium';
      default:
        return 'badge-info';
    }
  };

  return (
    <div className="notice-mgmt-wrapper">
      <div className="content-header">
        <div>
          <h2>Notice Board Moderation Desk</h2>
          <p style={{ fontSize: '13px', color: 'var(--light-text)', marginTop: '4px' }}>
            Manage official announcements, development projects, and public welfare alerts for <strong>{user.village}</strong>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={fetchNotices}
            className="btn btn-secondary btn-icon-only-mobile"
            title="Refresh List"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> <span className="hide-on-mobile">Refresh</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="btn btn-success"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> Publish Notice
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Metrics Row */}
      <div className="notice-stats-grid" style={{ marginBottom: '25px' }}>
        <div className="stats-card blue">
          <div className="stats-info">
            <h3>Total Bulletins</h3>
            <p>{notices.length}</p>
            <span style={{ fontSize: '11px', color: 'var(--light-text)' }}>Active on e-Notice board</span>
          </div>
          <div className="stats-icon" style={{ color: 'var(--primary-blue)' }}>
            <Megaphone size={28} />
          </div>
        </div>

        <div className="stats-card saffron">
          <div className="stats-info">
            <h3>Urgent Warnings</h3>
            <p>{notices.filter(n => n.severity === 'Urgent').length}</p>
            <span style={{ fontSize: '11px', color: 'var(--light-text)' }}>High priority notices</span>
          </div>
          <div className="stats-icon" style={{ color: 'var(--saffron)' }}>
            <AlertTriangle size={28} />
          </div>
        </div>
      </div>

      {/* Notices List */}
      {loading ? (
        <Loader message="Compiling Notice records..." />
      ) : notices.length === 0 ? (
        <div className="gov-card text-center" style={{ padding: '50px 20px' }}>
          <p style={{ fontSize: '15px', color: 'var(--light-text)', margin: 0 }}>
            No notices are currently published for your village. Click 'Publish Notice' to create the first one.
          </p>
        </div>
      ) : (
        <div>
          {/* DESKTOP TABLE VIEW (Hidden on Mobile) */}
          <div className="gov-card desktop-only-view" style={{ padding: '0px', overflowX: 'auto', border: '1px solid var(--border-color)' }}>
            <table className="gov-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', textAlign: 'left' }}>
                  <th style={{ padding: '12px 15px' }}>Notice Details</th>
                  <th style={{ padding: '12px 15px' }}>Category</th>
                  <th style={{ padding: '12px 15px' }}>Priority</th>
                  <th style={{ padding: '12px 15px' }}>Expiry Schedule</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notices.map((n) => (
                  <tr key={n._id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
                    <td style={{ padding: '15px 15px', maxWidth: '350px' }}>
                      <div style={{ fontWeight: 'bold', color: 'var(--secondary-blue)', fontSize: '14px', marginBottom: '4px' }}>
                        {n.title}
                      </div>
                      <div style={{ color: 'var(--light-text)', fontSize: '12px', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {n.description}
                      </div>
                    </td>
                    <td style={{ padding: '15px 15px' }}>
                      <span className="category-label">{n.category}</span>
                    </td>
                    <td style={{ padding: '15px 15px' }}>
                      <span className={`priority-badge ${getSeverityBadgeClass(n.severity)}`}>
                        {n.severity}
                      </span>
                    </td>
                    <td style={{ padding: '15px 15px', color: n.expiryDate ? '#dc2626' : 'var(--light-text)', fontWeight: n.expiryDate ? 'bold' : 'normal' }}>
                      {formatDate(n.expiryDate)}
                    </td>
                    <td style={{ padding: '15px 15px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEditModal(n)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 8px', display: 'inline-flex', alignItems: 'center' }}
                          title="Edit Notice"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(n._id, n.title)}
                          className="btn btn-danger-outline"
                          style={{
                            padding: '6px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            backgroundColor: '#fee2e2',
                            borderColor: '#fecaca',
                            color: '#dc2626',
                          }}
                          title="Wipe Notice"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD STACK VIEW (Visible only on smartphone screens) */}
          <div className="mobile-only-view notices-mobile-stack">
            {notices.map((n) => (
              <div key={n._id} className="gov-card mobile-notice-item" style={{ marginBottom: '15px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <span className={`priority-badge ${getSeverityBadgeClass(n.severity)}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                    {n.severity}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', backgroundColor: '#eff6ff', padding: '2px 6px', borderRadius: '3px' }}>
                    {n.category}
                  </span>
                </div>
                <h4 style={{ margin: 0, color: 'var(--secondary-blue)', fontWeight: 'bold', fontSize: '14px', lineHeight: '1.4' }}>
                  {n.title}
                </h4>
                <p style={{ margin: 0, color: 'var(--light-text)', fontSize: '12px', lineHeight: '1.5' }}>
                  {n.description}
                </p>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                  <span style={{ color: n.expiryDate ? '#dc2626' : '#64748b', fontWeight: n.expiryDate ? 'bold' : 'normal' }}>
                    Expiry: {n.expiryDate ? new Date(n.expiryDate).toLocaleDateString('en-IN') : 'None'}
                  </span>
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEditModal(n)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center', height: '28px' }}
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(n._id, n.title)}
                      className="btn"
                      style={{
                        padding: '4px 8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        backgroundColor: '#fee2e2',
                        borderColor: '#fecaca',
                        color: '#dc2626',
                        height: '28px',
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '15px' }}>
          <div className="gov-card notice-modal-content" style={{ maxWidth: '520px', width: '100%', padding: '25px', position: 'relative', borderTop: '4px solid var(--primary-blue)', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>

            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: 'var(--secondary-blue)', textTransform: 'uppercase', fontWeight: 'bold' }}>
              {editingNotice ? 'Edit Announcement' : 'Publish New Announcement'}
            </h3>

            {modalError && <div className="alert alert-error" style={{ marginBottom: '15px', fontSize: '12px' }}>{modalError}</div>}

            <form onSubmit={handleSubmit}>
              
              <div className="form-group">
                <label htmlFor="title">Notice Title *</label>
                <input
                  type="text"
                  id="title"
                  className="form-control"
                  placeholder="e.g. Clean Drinking Water Drive in Ward 04"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  disabled={actionLoading}
                  required
                />
                <span style={{ fontSize: '10px', color: 'var(--light-text)', display: 'block', marginTop: '2px', textAlign: 'right' }}>
                  {title.length}/100 characters
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="description">Announcement Content (Body) *</label>
                <textarea
                  id="description"
                  className="form-control"
                  rows="4"
                  placeholder="Provide all essential details for citizens, such as timings, locations, requirements, and instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={actionLoading}
                  required
                  style={{ resize: 'vertical', minHeight: '80px' }}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }} className="modal-two-col">
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    className="form-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={actionLoading}
                    required
                  >
                    <option value="Notice">Notice</option>
                    <option value="Scheme">Scheme</option>
                    <option value="Health">Health</option>
                    <option value="Event">Event</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="severity">Priority Severity *</label>
                  <select
                    id="severity"
                    className="form-control"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    disabled={actionLoading}
                    required
                  >
                    <option value="Info">Info (Standard)</option>
                    <option value="Medium">Medium</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="expiryDate">Expiration Date (Optional)</label>
                <input
                  type="date"
                  id="expiryDate"
                  className="form-control"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  disabled={actionLoading}
                  min={new Date().toISOString().split('T')[0]}
                />
                <span style={{ fontSize: '10px', color: 'var(--light-text)', display: 'block', marginTop: '3px' }}>
                  Notice will automatically hide from citizen boards once expired.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button
                  type="submit"
                  className="btn btn-success"
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  disabled={actionLoading}
                >
                  <Save size={16} /> {actionLoading ? 'Publishing...' : 'Save & Publish'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Styled Responsive Classes */}
      <style>{`
        .notice-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .category-label {
          background-color: #eff6ff;
          color: #2563eb;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 11px;
          text-transform: uppercase;
        }

        .priority-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 3px;
        }

        .badge-info {
          background-color: #eff6ff;
          border: 1px solid #dbeafe;
          color: #2563eb;
        }

        .badge-medium {
          background-color: #fff7ed;
          border: 1px solid #ffedd5;
          color: #ea580c;
        }

        .badge-urgent {
          background-color: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .desktop-only-view {
          display: block;
        }

        .mobile-only-view {
          display: none;
        }

        /* PIN-POINT SMARTPHONE RESPONSIVE OVERRIDES */
        @media (max-width: 768px) {
          .desktop-only-view {
            display: none !important;
          }
          .mobile-only-view {
            display: block !important;
          }
          .notice-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }
          .modal-two-col {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }
          .notice-modal-content {
            padding: 15px !important;
            max-height: 95vh !important;
          }
          .hide-on-mobile {
            display: none !important;
          }
          .btn-icon-only-mobile {
            padding: 8px 10px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default NoticeBoard;
