import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Team Task Manager</h2>
      </div>
      
      <div className="sidebar-user">
        <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
        <div className="user-info">
          <p className="user-name">{user.name}</p>
          <p className="user-role">{user.email}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/projects">Projects</Link></li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-secondary btn-block" onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
};

export default Navbar;
