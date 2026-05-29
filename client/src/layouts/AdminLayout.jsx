import React, { useContext, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { ShieldAlert, Clock, Building, LogOut, RefreshCw } from 'lucide-react';

const AdminPendingScreen = ({ user, logout }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    setError('');
    try {
      const storedUser = JSON.parse(localStorage.getItem('userInfo'));
      if (!storedUser || !storedUser.token) {
        return logout();
      }

      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${storedUser.token}`,
        },
      });
      const responseData = await res.json();

      if (res.ok && responseData.success) {
        const updatedUser = { ...storedUser, ...responseData.data };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));

        // If approved, reload to grant active dashboard access!
        if (updatedUser.status === 'Approved') {
          window.location.reload();
        } else {
          alert(`Your status is currently '${updatedUser.status}'. Awaiting Super Admin review.`);
        }
      } else {
        setError(responseData.message || 'Failed to refresh accreditation status.');
      }
    } catch (err) {
      setError('Connection error. Could not reach server.');
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const isPending = user.status === 'Pending';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6' }}>
      {/* Mini Gov Header */}
      <header style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', padding: '15px 20px', borderBottom: '4px solid var(--saffron)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building size={24} style={{ color: 'var(--saffron)' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Ministry of Panchayati Raj
            </h1>
            <span style={{ fontSize: '11px', color: '#cbd5e1' }}>National e-Governance Framework</span>
          </div>
        </div>
        <span style={{ fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '4px 8px', borderRadius: '3px', fontWeight: 'bold' }}>
          GOVT. OF INDIA
        </span>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div className="gov-card" style={{ maxWidth: '580px', width: '100%', padding: '30px', borderTop: `6px solid ${isPending ? 'var(--saffron)' : '#dc2626'}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            {isPending ? (
              <Clock size={48} style={{ color: 'var(--saffron)', marginBottom: '15px' }} />
            ) : (
              <ShieldAlert size={48} style={{ color: '#dc2626', marginBottom: '15px' }} />
            )}
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--secondary-blue)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '5px 0' }}>
              {isPending ? 'Accreditation Pending Approval' : 'Accreditation Request Rejected'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--light-text)', margin: '5px 0' }}>
              {isPending 
                ? 'Your administrator credentials have been securely registered and are currently awaiting vetting.' 
                : 'Your registration request as a Gram Panchayat Administrator has been denied.'}
            </p>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

          {/* Details Box */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '18px', marginBottom: '25px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--secondary-blue)', textTransform: 'uppercase', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px' }}>
              Accreditation Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--light-text)', fontWeight: 'bold', display: 'block' }}>FULL NAME</span>
                <strong style={{ color: '#1e293b' }}>{user.name}</strong>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--light-text)', fontWeight: 'bold', display: 'block' }}>REQUESTED ROLE</span>
                <strong style={{ color: '#1e293b' }}>Village Administrator (Admin)</strong>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--light-text)', fontWeight: 'bold', display: 'block' }}>GRAM PANCHAYAT</span>
                <strong style={{ color: '#1e293b' }}>{user.village} (Ward {user.wardNumber})</strong>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--light-text)', fontWeight: 'bold', display: 'block' }}>CONTACT EMAIL</span>
                <strong style={{ color: '#1e293b' }}>{user.email}</strong>
              </div>
            </div>
          </div>

          {/* Progress Tracker */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '12px', color: 'var(--secondary-blue)', textTransform: 'uppercase', fontWeight: 'bold', textAlign: 'center' }}>
              Vetting Progress Status
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', padding: '0 10px' }}>
              
              <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '3px', backgroundColor: '#e2e8f0', zIndex: 1 }}>
                <div style={{ width: '50%', height: '100%', backgroundColor: isPending ? 'var(--saffron)' : '#dc2626' }}></div>
              </div>

              {/* Step 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '30%' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dcfce7', border: '2px solid #22c55e', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#22c55e', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>
                  ✓
                </div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', textAlign: 'center', color: '#1e293b' }}>Registered</span>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '30%' }}>
                {isPending ? (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fef3c7', border: '2px solid var(--saffron)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--saffron)', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>
                    ⌛
                  </div>
                ) : (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fee2e2', border: '2px solid #dc2626', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#dc2626', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>
                    ✕
                  </div>
                )}
                <span style={{ fontSize: '11px', fontWeight: 'bold', textAlign: 'center', color: '#1e293b' }}>
                  {isPending ? 'Verification' : 'Denied'}
                </span>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '30%' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', border: '2px solid #cbd5e1', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>
                  🔒
                </div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', textAlign: 'center', color: '#64748b' }}>Activated</span>
              </div>

            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#64748b', backgroundColor: '#f8fafc', borderLeft: '4px solid #94a3b8', padding: '10px 12px', borderRadius: '3px', marginBottom: '25px', lineHeight: '1.5' }}>
            {isPending ? (
              <strong>Important Notice:</strong>
            ) : (
              <strong style={{ color: '#dc2626' }}>Accreditation Denied:</strong>
            )}{' '}
            {isPending 
              ? 'Only recognized Gram Panchayat representatives will be authorized. If you are an official officer, please notify your Super Admin to approve your registration in the System Approvals console.'
              : 'Your application credentials did not match official government datasets. If this is a mistake, please contact the main block administration desk.'}
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            {isPending && (
              <button
                onClick={handleRefreshStatus}
                className="btn btn-primary"
                style={{ flex: 2, height: '42px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                disabled={refreshing}
              >
                <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
                {refreshing ? 'Refreshing Database...' : 'Check Approval Status'}
              </button>
            )}
            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{ flex: 1, height: '42px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#dc2626', borderColor: '#fecaca' }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>

        </div>
      </main>

      <footer style={{ backgroundColor: '#cbd5e1', padding: '12px 20px', textAlign: 'center', fontSize: '11px', color: '#475569', borderTop: '1px solid #94a3b8' }}>
        <strong>GraamSahayak National Rural Governance Initiative</strong> | Ministry of Panchayati Raj, Govt. of India
      </footer>
    </div>
  );
};

const AdminLayout = () => {
  const { user, loading, logout } = useContext(AuthContext);

  if (loading) {
    return <Loader message="Verifying admin credentials..." />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to citizen if user is a citizen
  if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
    return <Navigate to="/citizen" replace />;
  }

  // Intercept and show pending screen for unapproved village admins
  if (user.role === 'Admin' && user.status !== 'Approved') {
    return <AdminPendingScreen user={user} logout={logout} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="layout-wrapper">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
