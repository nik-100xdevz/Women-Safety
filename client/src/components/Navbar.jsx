import React, { useState } from 'react'
import Logo from '../assets/logo.png'
import { Link, NavLink } from 'react-router-dom'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

          {/* Desktop Navigation */}
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
              <Link to="/signin" className='px-4 py-2 rounded-md text-sm font-medium text-white bg-pink-600 hover:bg-pink-700'>
                Sign In
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
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

      {/* Mobile Navigation */}
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
            <Link to="/signin" className='block px-3 py-2 rounded-md text-base font-medium text-white bg-pink-600 hover:bg-pink-700'>
              Sign In
            </Link>
      </div>
      </div>
      )}
    </nav>
  )
}

export default Navbar