import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt, FaGamepad, FaTrophy, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-blue-600 flex items-center">
            <FaGamepad className="mr-2" />
            Simon Says IoT
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-700 focus:outline-none"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/" className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
            }>
              Home
            </NavLink>
            <NavLink to="/game" className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
            }>
              Play Game
            </NavLink>
            <NavLink to="/leaderboard" className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
            }>
              <FaTrophy className="inline mr-1" />
              Leaderboard
            </NavLink>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <NavLink to="/profile" className={({ isActive }) => 
                  `nav-link flex items-center ${isActive ? 'active' : ''}`
                }>
                  <FaUser className="mr-1" />
                  {currentUser?.name || 'Profile'}
                </NavLink>
                <button 
                  onClick={handleLogout}
                  className="nav-link flex items-center text-red-600"
                >
                  <FaSignOutAlt className="mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <NavLink to="/login" className="btn btn-primary">
                  Login
                </NavLink>
                <NavLink to="/register" className="btn btn-secondary">
                  Register
                </NavLink>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink 
                to="/game" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Play Game
              </NavLink>
              <NavLink 
                to="/leaderboard" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaTrophy className="inline mr-1" />
                Leaderboard
              </NavLink>

              {isAuthenticated ? (
                <>
                  <NavLink 
                    to="/profile" 
                    className={({ isActive }) => 
                      `nav-link flex items-center ${isActive ? 'active' : ''}`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaUser className="mr-1" />
                    {currentUser?.name || 'Profile'}
                  </NavLink>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="nav-link flex items-center text-red-600"
                  >
                    <FaSignOutAlt className="mr-1" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <NavLink 
                    to="/login" 
                    className="btn btn-primary text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </NavLink>
                  <NavLink 
                    to="/register" 
                    className="btn btn-secondary text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 