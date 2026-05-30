import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, ShieldAlert, CheckCircle, Save, Key } from 'lucide-react';
import { restrictToNumeric, restrictToAlphabetic } from '../../utils/keyConstraints';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    village: user?.village || '',
    wardNumber: user?.wardNumber || '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { name, phone, village, wardNumber, password, confirmPassword } = formData;

    if (!name || !phone || !village || !wardNumber) {
      return setError('Name, Phone, Village, and Ward Number are required fields.');
    }

    if (password) {
      if (password.length < 4) {
        return setError('New password must be at least 4 characters long.');
      }
      if (password !== confirmPassword) {
        return setError('New passwords do not match.');
      }
    }

    setLoading(true);
    try {
      const updateData = {
        name,
        phone,
        village,
        wardNumber,
      };

      if (password) {
        updateData.password = password;
      }

      await updateProfile(updateData);
      setSuccess('Profile details updated successfully in the system database!');
      setFormData({
        ...formData,
        password: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="content-header">
        <h2>My Account & Profile</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        
        {/* Left Side: Display details */}
        <div className="gov-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="gov-card-header">
            Citizen Details
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: '#e5e7eb',
              border: '3px solid var(--primary-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-blue)',
            }}>
              <User size={50} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--light-text)', fontWeight: 'bold' }}>FULL NAME</span>
              <span style={{ fontWeight: 'bold' }}>{user?.name}</span>
            </div>
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--light-text)', fontWeight: 'bold' }}>EMAIL ADDRESS</span>
              <span>{user?.email}</span>
            </div>
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--light-text)', fontWeight: 'bold' }}>PHONE NUMBER</span>
              <span>{user?.phone}</span>
            </div>
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--light-text)', fontWeight: 'bold' }}>VILLAGE (GRAM)</span>
              <span style={{ fontWeight: 'bold' }}>{user?.village}</span>
            </div>
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--light-text)', fontWeight: 'bold' }}>WARD NUMBER</span>
              <span style={{ fontWeight: 'bold' }}>{user?.wardNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--light-text)', fontWeight: 'bold' }}>PORTAL ROLE</span>
              <span style={{ color: 'var(--saffron)', fontWeight: '800', textTransform: 'uppercase' }}>{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Update details */}
        <div className="gov-card">
          <div className="gov-card-header">
            Edit Profile Information
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="gov-form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  onKeyDown={restrictToAlphabetic}
                  maxLength={50}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="text"
                  id="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  onKeyDown={restrictToNumeric}
                  maxLength={10}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="gov-form-row">
              <div className="form-group">
                <label htmlFor="village">Village (Gram) *</label>
                <input
                  type="text"
                  id="village"
                  className="form-control"
                  value={formData.village}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="wardNumber">Ward Number *</label>
                <input
                  type="text"
                  id="wardNumber"
                  className="form-control"
                  value={formData.wardNumber}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <h3 style={{ fontSize: '13px', color: 'var(--primary-blue)', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginTop: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
              <Key size={14} /> Password Reset (Leave blank if keeping same)
            </h3>

            <div className="gov-form-row">
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-control"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%', marginTop: '10px', height: '42px' }}
              disabled={loading}
            >
              <Save size={16} />
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
