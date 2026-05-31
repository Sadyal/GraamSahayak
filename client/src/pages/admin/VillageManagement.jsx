import React, { useState, useEffect } from 'react';
import apiRequest from '../../services/axiosInstance';
import Loader from '../../components/Loader';
import {
  Building,
  Plus,
  Trash2,
  ListFilter,
  CheckCircle,
  RefreshCw,
  Layers,
  MapPin,
} from 'lucide-react';

const VillageManagement = () => {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [wardsString, setWardsString] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Himachal Pradesh');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchVillages();
  }, []);

  const fetchVillages = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiRequest('/api/villages');
      setVillages(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch village registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVillage = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !wardsString) {
      return setError('Please enter both the Village Name and at least one Ward Number');
    }

    // Split and parse wards string (e.g. "01, 02, 03" -> ["01", "02", "03"])
    const parsedWards = wardsString
      .split(',')
      .map((w) => w.trim())
      .filter((w) => w !== '');

    if (parsedWards.length === 0) {
      return setError('Please configure a valid comma-separated list of ward numbers.');
    }

    setFormLoading(true);
    try {
      const res = await apiRequest('/api/villages', {
        method: 'POST',
        body: {
          name: name.trim(),
          wards: parsedWards,
          district: district.trim(),
          state: state.trim(),
        },
      });

      setSuccess(`Village "${res.data.name}" added successfully to official system records!`);
      setVillages([...villages, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      
      // Reset form
      setName('');
      setWardsString('');
      setDistrict('');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create village profile.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteVillage = async (id, villageName) => {
    if (!window.confirm(`Are you absolutely sure you want to delete the village profile for "${villageName}"? This will wipe the village and all registration dropdown mappings. This action cannot be undone.`)) {
      return;
    }

    setError('');
    setSuccess('');

    const previousVillages = [...villages];
    
    // Optimistic UI Update: instantly remove from UI
    setVillages(villages.filter((v) => v._id !== id));

    try {
      await apiRequest(`/api/villages/${id}`, {
        method: 'DELETE',
      });
      setSuccess(`Village "${villageName}" deleted successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Rollback on failure
      setVillages(previousVillages);
      setError(err.message || 'Failed to delete village profile.');
    }
  };

  // Compile metrics
  const totalVillages = villages.length;
  const totalWards = villages.reduce((acc, v) => acc + (v.wards ? v.wards.length : 0), 0);

  return (
    <div>
      <div className="content-header">
        <h2>Gram Panchayat Village Directory</h2>
        <button
          onClick={fetchVillages}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh List
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Metrics Row */}
      <div className="dashboard-grid" style={{ marginBottom: '25px' }}>
        <div className="stats-card blue">
          <div className="stats-info">
            <h3>Total Active Villages</h3>
            <p>{totalVillages}</p>
            <span style={{ fontSize: '11px', color: 'var(--light-text)' }}>Officially recognized GPs</span>
          </div>
          <div className="stats-icon" style={{ color: 'var(--primary-blue)' }}>
            <Building size={28} />
          </div>
        </div>

        <div className="stats-card green">
          <div className="stats-info">
            <h3>Total Configured Wards</h3>
            <p>{totalWards}</p>
            <span style={{ fontSize: '11px', color: 'var(--light-text)' }}>Active local constituency wards</span>
          </div>
          <div className="stats-icon" style={{ color: 'var(--green)' }}>
            <Layers size={28} />
          </div>
        </div>
      </div>

      <div className="village-mgmt-grid">
        
        {/* Create Village Form Card */}
        <div className="gov-card" style={{ borderTop: '4px solid var(--saffron)' }}>
          <div className="gov-card-header" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
            <Plus size={16} /> Register New GP
          </div>
          
          <form onSubmit={handleAddVillage} style={{ marginTop: '15px' }}>
            <div className="form-group">
              <label htmlFor="name">Village Name (Gram Panchayat) *</label>
              <input
                type="text"
                id="name"
                className="form-control"
                placeholder="e.g. Rampur"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={formLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="wards">Configured Ward Numbers *</label>
              <input
                type="text"
                id="wards"
                className="form-control"
                placeholder="Comma-separated e.g. 01,02,03,04"
                value={wardsString}
                onChange={(e) => setWardsString(e.target.value)}
                disabled={formLoading}
                required
              />
              <span style={{ fontSize: '10px', color: 'var(--light-text)', display: 'block', marginTop: '3px' }}>
                Separate multiple ward digits with commas.
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="district">District / Block</label>
              <input
                type="text"
                id="district"
                className="form-control"
                placeholder="e.g. Kangra"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={formLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">State / Province</label>
              <input
                type="text"
                id="state"
                className="form-control"
                value={state}
                onChange={(e) => setState(e.target.value)}
                disabled={formLoading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-success"
              style={{ width: '100%', marginTop: '10px', height: '40px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              disabled={formLoading}
            >
              <Plus size={16} />
              {formLoading ? 'Registering...' : 'Add Village Profile'}
            </button>
          </form>
        </div>

        {/* Existing Villages List Card */}
        <div className="gov-card" style={{ padding: '0px', overflowX: 'auto', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '16px 20px', fontWeight: 'bold', fontSize: '15px', color: 'var(--secondary-blue)', borderBottom: '1px solid var(--border-color)', display: 'inline-flex', width: '100%', alignItems: 'center', gap: '8px' }}>
            <Building size={16} /> Active Village Registries
          </div>

          {loading ? (
            <div style={{ padding: '40px' }}><Loader message="Loading village databases..." /></div>
          ) : villages.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--light-text)' }}>
              No village registries are currently configured. Use the form to add the first one.
            </div>
          ) : (
            <table className="gov-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', textAlign: 'left' }}>
                  <th style={{ padding: '12px 15px' }}>Village Name</th>
                  <th style={{ padding: '12px 15px' }}>Location Details</th>
                  <th style={{ padding: '12px 15px' }}>Configured Wards</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center' }}>Total Wards</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {villages.map((v) => (
                  <tr key={v._id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
                    
                    {/* Name */}
                    <td style={{ padding: '14px 15px', fontWeight: 'bold', color: 'var(--secondary-blue)', textTransform: 'uppercase' }}>
                      {v.name}
                    </td>

                    {/* Location */}
                    <td style={{ padding: '14px 15px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                        <MapPin size={12} style={{ color: 'var(--saffron)' }} />
                        <span>{v.district || 'N/A'}, {v.state || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Wards list badges */}
                    <td style={{ padding: '14px 15px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {v.wards && v.wards.map((ward) => (
                          <span
                            key={ward}
                            style={{
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #dbeafe',
                              padding: '2px 6px',
                              borderRadius: '3px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                            }}
                          >
                            W-{ward}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Total count */}
                    <td style={{ padding: '14px 15px', textAlign: 'center', fontWeight: 'bold' }}>
                      {v.wards ? v.wards.length : 0}
                    </td>

                    {/* Delete Action */}
                    <td style={{ padding: '14px 15px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteVillage(v._id, v.name)}
                        className="btn"
                        style={{
                          padding: '6px 8px',
                          backgroundColor: '#fee2e2',
                          borderColor: '#fecaca',
                          color: '#dc2626',
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                        title="Delete Village Profile"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default VillageManagement;
