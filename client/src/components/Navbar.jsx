import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User as UserIcon, Landmark } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      {/* Flag Tricolor Top Bar */}
      <div className="tricolor-bar">
        <div className="tricolor-saffron"></div>
        <div className="tricolor-white"></div>
        <div className="tricolor-green"></div>
      </div>

      {/* Main Gov Banner Header */}
      <header className="gov-banner">
        <div className="gov-logo-section">
          <Link to={user ? (user.role === 'Admin' ? '/admin' : '/citizen') : '/'} style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'inherit' }}>
            <div className="gov-emblem">
              <Landmark size={24} strokeWidth={2.5} />
            </div>
            <div className="gov-titles">
              <h1>GraamSahayak</h1>
              <p>Gram Panchayat e-Governance Portal</p>
            </div>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {user ? (
            <>
              <div className="nav-user-info">
                <span style={{ fontSize: '14px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <UserIcon size={14} />
                  {user.name}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--saffron)', fontWeight: '700', textTransform: 'uppercase' }}>
                  {user.role === 'Admin' ? 'Admin Dashboard' : `WARD NO: ${user.wardNumber}`}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{
                  color: '#ffffff',
                  borderColor: '#ffffff',
                  padding: '6px 12px',
                  fontSize: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <LogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login" className="btn btn-outline" style={{ color: '#ffffff', borderColor: '#ffffff', fontSize: '13px', padding: '6px 14px' }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ backgroundColor: 'var(--saffron)', color: '#ffffff', fontSize: '13px', padding: '6px 14px' }}>
                Register
              </Link>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

export default Navbar;
