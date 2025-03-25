import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
  <div className="min-h-screen bg-fuchsia-50">
      <div className=" ">
        <div className="min-h-screen flex flex-col">
          <Navbar />
              <Outlet/>
            <Footer />
        </div>
      </div>
    </div>
    </>
  )
}


export default Layout