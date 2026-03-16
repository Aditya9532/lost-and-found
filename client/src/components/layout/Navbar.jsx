import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🔍 LostFound</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Browse</Link>
        {user ? (
          <>
            <Link to="/post">+ Post Item</Link>
            <Link to="/dashboard">My Items</Link>
            <Link to="/messages">Messages</Link>
            <Link to="/profile">{user.name}</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
