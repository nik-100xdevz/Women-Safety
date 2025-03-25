import React from 'react'
import Logo from '../assets/logo.png'
import { Link, NavLink } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className='w-full  h-24 flex flex-col justify-center bg-pink-300 '>
      <div className='flex flex-row justify-between items-center mx-auto w-[1140px]'>
        <div><Link to='/'> <img className='w-20 h-20' src={Logo} alt="We safe" /></Link></div>
        <div className=''>
          <ul className='flex flex-row gap-2.5'>
            <li><NavLink className='font-medium' to="/">Home</NavLink></li>
            <li><NavLink className='font-medium' to="/">SOS</NavLink></li>
            <li><NavLink className='font-medium' to="/about-us">About</NavLink></li>
            <li><NavLink className='font-medium' to="/contact-us">Contact</NavLink></li>
          </ul>
        </div>
        <div className='flex flex-row gap-2'>
          <span>Dark</span>
          <Link to="/sign-in">Signin</Link>
        </div>
      </div>
      </div>
  )
}

export default Navbar