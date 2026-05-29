import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const Login = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/citizen');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailOrPhone || !password) {
      return setError('Please enter both Email/Phone and Password');
    }

    setLoading(true);
    try {
      const data = await login(emailOrPhone, password);
      if (data.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/citizen');
      }
    } catch (err) {
      setError(err.message || 'Invalid email/phone or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6' }}>
      <Navbar />

      <div className="auth-container">
        <div className="auth-card">
          <h2>Official Portal Login</h2>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280', marginBottom: '20px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            National e-Governance Single Sign-On
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="emailOrPhone">Email or Phone Number</label>
              <input
                type="text"
                id="emailOrPhone"
                className="form-control"
                placeholder="Enter Registered Email / Phone"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px', height: '42px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Simple Demo Accounts Helper for Easy Testing! */}
          <div style={{ marginTop: '20px', padding: '12px', border: '1px solid #ff9933', borderRadius: '4px', backgroundColor: '#fffdf9', fontSize: '12px' }}>
            <strong style={{ color: '#ff9933', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
              ℹ MVP Demo Accounts:
            </strong>
            <p style={{ margin: '2px 0' }}><strong>Citizen Role:</strong> Register your own or log in after creating.</p>
            <p style={{ margin: '2px 0' }}><strong>Admin Role:</strong> Register an account with an email containing the word "admin" (e.g. <code>panchayat.admin@gov.in</code>) with role set to <strong>Admin</strong> in registration.</p>
          </div>

          <div className="auth-footer">
            New citizen? <Link to="/register" style={{ fontWeight: 'bold' }}>Register Here</Link>
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

export default Login;
