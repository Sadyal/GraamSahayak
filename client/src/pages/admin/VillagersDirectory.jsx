import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from '../../services/axiosInstance';
import Loader from '../../components/Loader';
import {
  Users,
  Search,
  Building,
  Edit2,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Baby,
  Activity,
  Calendar,
  X,
  Save,
} from 'lucide-react';

const VillagersDirectory = () => {
  const { user } = useContext(AuthContext);

  const [villagers, setVillagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState('All');

  // Wards configured for this village
  const [villageWards, setVillageWards] = useState([]);

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVillager, setEditingVillager] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWard, setEditWard] = useState('');
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchVillagers();
    fetchVillageWards();
  }, []);

  const fetchVillagers = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiRequest('/api/auth/villagers');
      setVillagers(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch villagers directory.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVillageWards = async () => {
    try {
      const res = await apiRequest('/api/villages');
      const villagesList = res.data || [];
      const currentVillage = villagesList.find(
        (v) => v.name.toLowerCase() === user.village.toLowerCase()
      );
      if (currentVillage) {
        setVillageWards(currentVillage.wards || []);
      }
    } catch (err) {
      console.error('Failed to load village ward configurations.', err);
    }
  };

  const handleOpenEditModal = (villager) => {
    setEditingVillager(villager);
    setEditName(villager.name);
    setEditEmail(villager.email);
    setEditPhone(villager.phone);
    setEditWard(villager.wardNumber);
    setModalError('');
    setIsEditModalOpen(true);
  };

  const handleUpdateVillager = async (e) => {
    e.preventDefault();
    setModalError('');
    setActionLoading(true);

    try {
      const res = await apiRequest(`/api/auth/villagers/${editingVillager._id}`, {
        method: 'PUT',
        body: {
          name: editName.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim(),
          wardNumber: editWard,
        },
      });

      // Update local state
      setVillagers(
        villagers.map((v) =>
          v._id === editingVillager._id
            ? {
                ...v,
                name: editName,
                email: editEmail,
                phone: editPhone,
                wardNumber: editWard,
              }
            : v
        )
      );

      setSuccess(`Profile for "${editName}" updated successfully!`);
      setIsEditModalOpen(false);
      setEditingVillager(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setModalError(err.message || 'Failed to update villager profile.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVillager = async (id, name) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently delete the citizen account for "${name}"? This will delete their account and wipe all of their filed complaints, birth applications, and death requests from the system. This action cannot be undone.`)) {
      return;
    }

    setError('');
    setSuccess('');

    const previousVillagers = [...villagers];

    // Optimistic UI Update: instantly remove from list
    setVillagers(villagers.filter((v) => v._id !== id));

    try {
      await apiRequest(`/api/auth/villagers/${id}`, {
        method: 'DELETE',
      });
      setSuccess(`Citizen account for "${name}" deleted successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Rollback on failure
      setVillagers(previousVillagers);
      setError(err.message || 'Failed to delete villager account.');
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

  // Filter list
  const filteredVillagers = villagers.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.phone.includes(searchQuery);

    const matchesWard = wardFilter === 'All' || v.wardNumber === wardFilter;

    return matchesSearch && matchesWard;
  });

  return (
    <div>
      <div className="content-header">
        <h2>Village Citizens Directory ({user.village})</h2>
        <button
          onClick={fetchVillagers}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh List
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Control row */}
      <div className="gov-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Search box */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '4px', padding: '6px 12px', minWidth: '280px', flex: '1', maxWidth: '400px' }}>
            <Search size={16} style={{ color: '#9ca3af', marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Search citizens by Name, Email, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '13px' }}
            />
          </div>

          {/* Ward filter dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--secondary-blue)' }}>Filter Ward:</span>
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="form-control"
              style={{ width: '160px', padding: '6px 10px', height: 'auto', marginBottom: '0px' }}
            >
              <option value="All">All Wards ({villagers.length})</option>
              {villageWards.map((w) => (
                <option key={w} value={w}>
                  Ward {w}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Villagers directory table */}
      {loading ? (
        <Loader message="Compiling village registry databases..." />
      ) : filteredVillagers.length === 0 ? (
        <div className="gov-card text-center" style={{ padding: '50px 20px' }}>
          <p style={{ fontSize: '15px', color: 'var(--light-text)' }}>
            No registered villagers match your current filter criteria.
          </p>
        </div>
      ) : (
        <div className="gov-card" style={{ padding: '0px', overflowX: 'auto', border: '1px solid var(--border-color)' }}>
          <table className="gov-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', textAlign: 'left' }}>
                <th style={{ padding: '12px 15px' }}>Citizen Name</th>
                <th style={{ padding: '12px 15px' }}>Ward</th>
                <th style={{ padding: '12px 15px' }}>Contact Information</th>
                <th style={{ padding: '12px 15px', textAlign: 'center' }}>Portal Activity Metrics</th>
                <th style={{ padding: '12px 15px' }}>Registration Date</th>
                <th style={{ padding: '12px 15px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVillagers.map((v) => (
                <tr key={v._id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
                  
                  {/* Name */}
                  <td style={{ padding: '14px 15px', fontWeight: 'bold', color: 'var(--secondary-blue)', textTransform: 'uppercase' }}>
                    {v.name}
                  </td>

                  {/* Ward */}
                  <td style={{ padding: '14px 15px', fontWeight: '500' }}>
                    <span style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold' }}>
                      WARD {v.wardNumber}
                    </span>
                  </td>

                  {/* Contact */}
                  <td style={{ padding: '14px 15px' }}>
                    <div>{v.email}</div>
                    <div style={{ color: 'var(--light-text)', fontSize: '12px' }}>{v.phone}</div>
                  </td>

                  {/* Metric Counts */}
                  <td style={{ padding: '14px 15px' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <span title="Civic Grievances Filed" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#fffbeb', color: '#b45309', padding: '3px 8px', borderRadius: '4px', border: '1px solid #fef3c7', fontSize: '11px', fontWeight: 'bold' }}>
                        <AlertTriangle size={11} /> {v.stats ? v.stats.complaints : 0}
                      </span>
                      <span title="Birth Certificates Applied" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '4px', border: '1px solid #dbeafe', fontSize: '11px', fontWeight: 'bold' }}>
                        <Baby size={11} /> {v.stats ? v.stats.births : 0}
                      </span>
                      <span title="Death Certificates Applied" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#fdf2f8', color: '#be185d', padding: '3px 8px', borderRadius: '4px', border: '1px solid #fce7f3', fontSize: '11px', fontWeight: 'bold' }}>
                        <Activity size={11} /> {v.stats ? v.stats.deaths : 0}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td style={{ padding: '14px 15px', color: 'var(--light-text)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {formatDate(v.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 15px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      
                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEditModal(v)}
                        className="btn btn-secondary"
                        style={{
                          padding: '6px 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: '#f3f4f6',
                          borderColor: '#cbd5e1',
                          color: 'var(--primary-blue)',
                        }}
                        title="Edit Citizen Details"
                      >
                        <Edit2 size={13} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteVillager(v._id, v.name)}
                        className="btn"
                        style={{
                          padding: '6px 8px',
                          backgroundColor: '#fee2e2',
                          borderColor: '#fecaca',
                          color: '#dc2626',
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                        title="Wipe Citizen Account"
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
      )}

      {/* Edit Villager Modal Overlay */}
      {isEditModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="gov-card" style={{ maxWidth: '500px', width: '100%', padding: '25px', position: 'relative', borderTop: '4px solid var(--primary-blue)' }}>
            
            <button onClick={() => setIsEditModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>

            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: 'var(--secondary-blue)', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Edit Villager Profile
            </h3>

            {modalError && <div className="alert alert-error" style={{ marginBottom: '15px', fontSize: '12px' }}>{modalError}</div>}

            <form onSubmit={handleUpdateVillager}>
              <div className="form-group">
                <label htmlFor="editName">Full Name *</label>
                <input
                  type="text"
                  id="editName"
                  className="form-control"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={actionLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="editEmail">Email Address *</label>
                <input
                  type="email"
                  id="editEmail"
                  className="form-control"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  disabled={actionLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="editPhone">Phone Number *</label>
                <input
                  type="text"
                  id="editPhone"
                  className="form-control"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  disabled={actionLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="editWard">Ward Number Assignment *</label>
                <select
                  id="editWard"
                  className="form-control"
                  value={editWard}
                  onChange={(e) => setEditWard(e.target.value)}
                  disabled={actionLoading}
                  required
                >
                  {villageWards.map((w) => (
                    <option key={w} value={w}>
                      Ward {w}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="submit"
                  className="btn btn-success"
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  disabled={actionLoading}
                >
                  <Save size={16} /> {actionLoading ? 'Saving...' : 'Save Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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

    </div>
  );
};

export default VillagersDirectory;
