import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  AlertTriangle,
  ClipboardList,
  Baby,
  Activity,
  FileText,
  User,
  Inbox,
  FileCheck,
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const citizenLinks = [
    { path: '/citizen', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/citizen/complaint/new', label: 'New Complaint', icon: <AlertTriangle size={18} /> },
    { path: '/citizen/complaints', label: 'My Complaints', icon: <ClipboardList size={18} /> },
    { path: '/citizen/birth-apply', label: 'Birth Certificate', icon: <Baby size={18} /> },
    { path: '/citizen/death-apply', label: 'Death Certificate', icon: <Activity size={18} /> },
    { path: '/citizen/applications', label: 'My Applications', icon: <FileCheck size={18} /> },
    { path: '/citizen/profile', label: 'My Profile', icon: <User size={18} /> },
  ];

  const adminLinks = [
    { path: '/admin', label: 'Admin Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/admin/complaints', label: 'Complaints Management', icon: <Inbox size={18} /> },
    { path: '/admin/birth-requests', label: 'Birth Requests', icon: <Baby size={18} /> },
    { path: '/admin/death-requests', label: 'Death Requests', icon: <Activity size={18} /> },
  ];

  const links = user.role === 'Admin' ? adminLinks : citizenLinks;

  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        {links.map((link) => (
          <li key={link.path} className={`sidebar-item ${isActive(link.path)}`}>
            <Link to={link.path}>
              {link.icon}
              <span>{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Official Government Disclaimer text bottom of sidebar */}
      <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', fontSize: '11px', color: '#888888', textAlign: 'center' }}>
        <strong>GraamSahayak v1.0</strong>
        <br />
        Ministry of Panchayati Raj
        <br />
        Govt. of India
      </div>
    </aside>
  );
};

export default Sidebar;
