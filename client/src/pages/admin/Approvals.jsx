import React, { useState, useEffect } from 'react';
import apiRequest from '../../services/axiosInstance';
import Loader from '../../components/Loader';
import {
  UserCheck,
  UserX,
  Trash2,
  Clock,
  Search,
  Building,
  RefreshCw,
  Users,
  Shield,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const Approvals = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiRequest('/api/auth/admins');
      setAdmins(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin accounts.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setError('');
    setSuccess('');
    
    // Save previous state for rollbacks on failure
    const previousAdmins = [...admins];
    
    // Optimistic UI Update: instantly update status in local state
    setAdmins(
      admins.map((admin) =>
        admin._id === id ? { ...admin, status: newStatus } : admin
      )
    );

    try {
      await apiRequest(`/api/auth/admins/${id}`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      setSuccess(`Account status successfully updated to ${newStatus}!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Rollback to previous state on failure
      setAdmins(previousAdmins);
      setError(err.message || 'Failed to update administrator status.');
    }
  };

  const handleDeleteAdmin = async (id, name) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently delete the admin account for "${name}"? This action cannot be undone.`)) {
      return;
    }

    setError('');
    setSuccess('');
    
    // Save previous state for rollbacks on failure
    const previousAdmins = [...admins];
    
    // Optimistic UI Update: instantly remove account from list
    setAdmins(admins.filter((admin) => admin._id !== id));

    try {
      await apiRequest(`/api/auth/admins/${id}`, {
        method: 'DELETE',
      });
      setSuccess('Administrator account deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Rollback on failure
      setAdmins(previousAdmins);
      setError(err.message || 'Failed to delete administrator account.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Compile metrics
  const totalCount = admins.length;
  const pendingCount = admins.filter((a) => a.status === 'Pending').length;
  const approvedCount = admins.filter((a) => a.status === 'Approved').length;
  const rejectedCount = admins.filter((a) => a.status === 'Rejected').length;

  // Filter list
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.phone.includes(searchQuery);

    const matchesStatus =
      statusFilter === 'All' || admin.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="content-header">
        <h2>Administrator Registration Requests</h2>
        <button
          onClick={fetchAdmins}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Requests
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Metrics Cards */}
      <div className="dashboard-grid" style={{ marginBottom: '25px' }}>
        <div className="stats-card blue">
          <div className="stats-info">
            <h3>Total Registered Admins</h3>
            <p>{totalCount}</p>
            <span style={{ fontSize: '11px', color: 'var(--light-text)' }}>Across all system villages</span>
          </div>
          <div className="stats-icon" style={{ color: 'var(--primary-blue)' }}>
            <Users size={28} />
          </div>
        </div>

        <div className="stats-card saffron">
          <div className="stats-info">
            <h3>Awaiting Approval</h3>
            <p>{pendingCount}</p>
            <span style={{ fontSize: '11px', color: 'var(--light-text)' }}>Requires verification review</span>
          </div>
          <div className="stats-icon" style={{ color: 'var(--saffron)' }}>
            <Clock size={28} />
          </div>
        </div>

        <div className="stats-card green">
          <div className="stats-info">
            <h3>Active Admins</h3>
            <p>{approvedCount}</p>
            <span style={{ fontSize: '11px', color: 'var(--light-text)' }}>Granted system control access</span>
          </div>
          <div className="stats-icon" style={{ color: 'var(--green)' }}>
            <Shield size={28} />
          </div>
        </div>
      </div>

      {/* Control panel & Filter row */}
      <div className="gov-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Search box */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '4px', padding: '6px 12px', minWidth: '280px', flex: '1', maxWidth: '400px' }}>
            <Search size={16} style={{ color: '#9ca3af', marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Search by Name, Email, Village, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '13px' }}
            />
          </div>

          {/* Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--secondary-blue)' }}>Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
              style={{ width: '160px', padding: '6px 10px', height: 'auto', marginBottom: '0px' }}
            >
              <option value="All">All Statuses ({totalCount})</option>
              <option value="Pending">Pending ({pendingCount})</option>
              <option value="Approved">Approved ({approvedCount})</option>
              <option value="Rejected">Rejected ({rejectedCount})</option>
            </select>
          </div>

        </div>
      </div>

      {/* Table view of requests */}
      {loading ? (
        <Loader message="Fetching administrator database records..." />
      ) : filteredAdmins.length === 0 ? (
        <div className="gov-card text-center" style={{ padding: '50px 20px' }}>
          <p style={{ fontSize: '15px', color: 'var(--light-text)' }}>
            No registered administrator accounts match your filter criteria.
          </p>
        </div>
      ) : (
        <div className="gov-card" style={{ padding: '0px', overflowX: 'auto', border: '1px solid var(--border-color)' }}>
          <table className="gov-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', textAlign: 'left' }}>
                <th style={{ padding: '12px 15px' }}>Official Details</th>
                <th style={{ padding: '12px 15px' }}>Village (Gram Panchayat)</th>
                <th style={{ padding: '12px 15px' }}>Contact Information</th>
                <th style={{ padding: '12px 15px' }}>Registration Date</th>
                <th style={{ padding: '12px 15px', textAlign: 'center' }}>Approval Status</th>
                <th style={{ padding: '12px 15px', textAlign: 'center' }}>Administrative Verdict</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((admin) => (
                <tr
                  key={admin._id}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: admin.status === 'Pending' ? '#fffbeb' : '#ffffff',
                  }}
                >
                  {/* Name and Role */}
                  <td style={{ padding: '14px 15px' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--secondary-blue)', textTransform: 'uppercase' }}>
                      {admin.name}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--light-text)' }}>
                      Ward Number: {admin.wardNumber}
                    </span>
                  </td>

                  {/* Village details */}
                  <td style={{ padding: '14px 15px', fontWeight: '500' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Building size={14} style={{ color: 'var(--saffron)' }} />
                      <span>{admin.village}</span>
                    </div>
                  </td>

                  {/* Contact details */}
                  <td style={{ padding: '14px 15px' }}>
                    <div>{admin.email}</div>
                    <div style={{ color: 'var(--light-text)', fontSize: '12px' }}>{admin.phone}</div>
                  </td>

                  {/* Date */}
                  <td style={{ padding: '14px 15px', color: 'var(--light-text)' }}>
                    {formatDate(admin.createdAt)}
                  </td>

                  {/* Badge */}
                  <td style={{ padding: '14px 15px', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor:
                          admin.status === 'Approved'
                            ? '#dcfce7'
                            : admin.status === 'Rejected'
                            ? '#fee2e2'
                            : '#fef3c7',
                        color:
                          admin.status === 'Approved'
                            ? '#15803d'
                            : admin.status === 'Rejected'
                            ? '#b91c1c'
                            : '#b45309',
                        border: `1px solid ${
                          admin.status === 'Approved'
                            ? '#bbf7d0'
                            : admin.status === 'Rejected'
                            ? '#fecaca'
                            : '#fde68a'
                        }`,
                      }}
                    >
                      {admin.status}
                    </span>
                  </td>

                  {/* Verdict button controls */}
                  <td style={{ padding: '14px 15px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'center' }}>
                      {admin.status !== 'Approved' && (
                        <button
                          onClick={() => handleUpdateStatus(admin._id, 'Approved')}
                          className="btn btn-success"
                          style={{
                            padding: '6px 10px',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          disabled={actionLoading}
                        >
                          <UserCheck size={14} /> Approve
                        </button>
                      )}

                      {admin.status !== 'Rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(admin._id, 'Rejected')}
                          className="btn"
                          style={{
                            padding: '6px 10px',
                            fontSize: '12px',
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          disabled={actionLoading}
                        >
                          <UserX size={14} /> Reject
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteAdmin(admin._id, admin.name)}
                        className="btn btn-secondary"
                        style={{
                          padding: '6px 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: '#f3f4f6',
                          borderColor: '#d1d5db',
                          color: '#dc2626',
                        }}
                        disabled={actionLoading}
                        title="Delete Admin Permanently"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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

export default Approvals;
