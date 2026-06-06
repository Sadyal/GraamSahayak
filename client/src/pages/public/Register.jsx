import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { restrictToNumeric, restrictToAlphabetic } from '../../utils/keyConstraints';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    village: '',
    wardNumber: '',
    password: '',
    role: 'Citizen', // default to citizen
  });
  
  const [villagesList, setVillagesList] = useState([]);
  const [wardsList, setWardsList] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch official villages on component mount
  useEffect(() => {
    const fetchVillages = async () => {
      try {
        const res = await fetch('/api/villages');
        const data = await res.json();
        if (res.ok && data.success) {
          setVillagesList(data.data || []);
        }
      } catch (err) {
        console.error('Failed to load official village directory', err);
      }
    };
    fetchVillages();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'Admin' || user.role === 'SuperAdmin') {
        navigate('/admin');
      } else {
        navigate('/citizen');
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const fieldId = e.target.id;
    const value = e.target.value;

    if (fieldId === 'village') {
      // Find selected village and set its wards
      const selectedVillageObj = villagesList.find(v => v.name === value);
      const wards = selectedVillageObj ? selectedVillageObj.wards : [];
      setWardsList(wards);
      
      setFormData({
        ...formData,
        village: value,
        wardNumber: '', // Reset selected ward
      });
    } else {
      setFormData({
        ...formData,
        [fieldId]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, email, phone, village, wardNumber, password } = formData;

    if (!name || !email || !phone || !village || !wardNumber || !password) {
      return setError('Please fill in all required fields');
    }

    setLoading(true);
    try {
      const data = await register(formData);
      if (data.role === 'Admin') {
        logout(); // Clear auto-login for pending admin
        setSuccess('Administrator account registered successfully! Your account is now pending review and approval by the Super Admin. You will be able to log in using this portal once approved.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          village: '',
          wardNumber: '',
          password: '',
          role: 'Citizen',
        });
      } else {
        navigate('/citizen');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Check details or duplicate accounts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6' }}>
      <Navbar />

      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '550px' }}>
          <h2>Citizen & Admin Registration</h2>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280', marginBottom: '20px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            Panchayat National e-Governance Registration
          </p>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="gov-form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  onKeyDown={restrictToAlphabetic}
                  maxLength={50}
                  disabled={loading}
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="gov-form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="text"
                  id="phone"
                  className="form-control"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  onKeyDown={restrictToNumeric}
                  maxLength={10}
                  disabled={loading}
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Portal Role</label>
                <select
                  id="role"
                  className="form-control"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="Citizen">Citizen (Grievances & Certificates)</option>
                  <option value="Admin">Admin (Panchayat Administration)</option>
                </select>
              </div>
            </div>

             <div className="gov-form-row">
              <div className="form-group">
                <label htmlFor="village">Village (Gram Panchayat) *</label>
                <select
                  id="village"
                  className="form-control"
                  value={formData.village}
                  onChange={handleChange}
                  disabled={loading || villagesList.length === 0}
                >
                  <option value="">Select Village</option>
                  {villagesList.map((v) => (
                    <option key={v._id} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="wardNumber">Ward Number *</label>
                <select
                  id="wardNumber"
                  className="form-control"
                  value={formData.wardNumber}
                  onChange={handleChange}
                  disabled={loading || !formData.village || wardsList.length === 0}
                >
                  <option value="">Select Ward</option>
                  {wardsList.map((ward) => (
                    <option key={ward} value={ward}>
                      Ward {ward}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Security Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Choose a strong password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              className="btn btn-success"
              style={{ width: '100%', marginTop: '10px', height: '42px', backgroundColor: 'var(--green)' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Submit Registration'}
            </button>
          </form>

          <div className="auth-footer">
            Already registered? <Link to="/login" style={{ fontWeight: 'bold' }}>Sign In Here</Link>
            <br />
            <Link to="/" style={{ display: 'inline-block', marginTop: '10px', fontSize: '13px' }}>
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
