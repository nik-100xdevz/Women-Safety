import React, { useState, useEffect } from 'react'
import Logo from '../assets/logo.png'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { currentUser, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  // Check auth status on component mount and when token changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token in Navbar:', token);
    console.log('Current user in Navbar:', currentUser);
  }, [currentUser]);

  const handleSignOut = () => {
    console.log('Sign out clicked');
    logout();
    navigate('/signin');
  };

  // If still loading, show a simplified navbar
  if (loading) {
    return (
      <nav className='w-full bg-white shadow-md fixed top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex-shrink-0'>
              <Link to='/' className='flex items-center'>
                <img className='h-12 w-auto' src={Logo} alt="We Safe" />
                <span className='ml-2 text-xl font-semibold text-pink-600'>We Safe</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className='w-full bg-white shadow-md fixed top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex-shrink-0'>
            <Link to='/' className='flex items-center'>
              <img className='h-12 w-auto' src={Logo} alt="We Safe" />
              <span className='ml-2 text-xl font-semibold text-pink-600'>We Safe</span>
            </Link>
          </div>

          <div className='hidden md:block'>
            <div className='ml-10 flex items-center space-x-4'>
              <NavLink to="/" className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-pink-600 bg-pink-50' : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'}`
              }>
                Home
              </NavLink>
              <NavLink to="/emergency" className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-pink-600 bg-pink-50' : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'}`
              }>
                Emergency
              </NavLink>
              <NavLink to="/resources" className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-pink-600 bg-pink-50' : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'}`
              }>
                Resources
              </NavLink>
              <NavLink to="/community" className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-pink-600 bg-pink-50' : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'}`
              }>
                Community
              </NavLink>
              <NavLink to="/about" className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-pink-600 bg-pink-50' : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'}`
              }>
                About
              </NavLink>
              <NavLink to="/contact" className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-pink-600 bg-pink-50' : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'}`
              }>
                Contact
              </NavLink>
              {isAuthenticated() && currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-pink-600"
                  >
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                      <span className="text-pink-600 font-medium">
                        {currentUser?.username.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                      <span className="text-sm px-4 py-2 font-medium text-gray-700 text-center">{currentUser.username}</span>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/profile/reports"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        My Reports
                      </Link>
                      <Link
                        to="/profile/comments"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        My Comments
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsProfileMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/signin" className='px-4 py-2 rounded-md text-sm font-medium text-white bg-pink-600 hover:bg-pink-700'>
                  Sign In
                </Link>
              )}
            </div>
          </div>

          <div className='md:hidden'>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-pink-600 hover:bg-pink-50'
            >
              <svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                {isMenuOpen ? (
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                ) : (
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className='md:hidden'>
          <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
            <NavLink to="/" className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50'>
              Home
            </NavLink>
            <NavLink to="/emergency" className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50'>
              Emergency
            </NavLink>
            <NavLink to="/resources" className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50'>
              Resources
            </NavLink>
            <NavLink to="/community" className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50'>
              Community
            </NavLink>
            <NavLink to="/about" className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50'>
              About
            </NavLink>
            <NavLink to="/contact" className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50'>
              Contact
            </NavLink>
            {isAuthenticated() && currentUser ? (
              <>
                <Link to="/profile" className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50'>
                  My Profile
                </Link>
                <Link to="/profile/reports" className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50'>
                  My Reports
                </Link>
                <Link to="/profile/comments" className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50'>
                  My Comments
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsProfileMenuOpen(false);
                  }}
                  className='block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50'
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/signin" className='block px-3 py-2 rounded-md text-base font-medium text-white bg-pink-600 hover:bg-pink-700'>
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar