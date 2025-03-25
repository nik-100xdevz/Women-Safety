import React from 'react'
import LogoWithout from '../assets/logo.png'
import { Link } from 'react-router-dom'


const Footer = () => {
  return (
    <div className='w-full mt-auto  flex flex-col justify-center bg-pink-300'>
    <div className='flex flex-row  mx-auto mt-4 w-[1140px] justify-between'>
      <div className=''><Link to='/'><img className='w-[180px] h-40' src={LogoWithout} alt="" /></Link></div>
      <div >
        <ul className='flex flex-col gap-1'>
          <li className='font-semibold'>NGOs</li>
          <li><a className='text-sm' href="https://aksharacentre.org/" target='_blank'>Akshara</a></li>
          <li><a className='text-sm' href="https://www.aartiforgirls.org/" target='_blank'>Aarti for girls</a></li>
          <li><a className='text-sm' href="https://mahilaektasangh.in/" target='_blank'>Mahila Ekata Sangh</a></li>
          <li><a className='text-sm' href="https://sayodhya.org/" target='_blank'>Sayodhya</a></li>
        </ul>
      </div>
      <div >
        <ul className='flex flex-col gap-1'>
          <li className='font-semibold'>Report</li>
          <li><a className='text-sm' href="https://dial112.mahapolice.gov.in/CitizenPortal-Maharashtra/women-safety" target='_blank'>Mumbai Police Women safety</a></li>
          <li><a className='text-sm' href="https://services.india.gov.in/service/detail/lodge-your-complaint-with-national-commission-for-women" target='_blank'>National Women Commision</a></li>
          <li><a className='text-sm' href="https://www.aartiforgirls.org/" target='_blank'>Sexual harassment at workplace</a></li>
          <li><a className='text-sm' href="https://dst.gov.in/internal-complaints-committee-icc-women" target='_blank'>Internal Complaint Committe</a></li>
        </ul>
      </div>
      <div>
        <ul className='flex flex-col gap-1'>
        <li className='font-semibold'>Organisation</li>
        <li><a className='text-sm' href="https://www.mha.gov.in/en/divisionofmha/women-safety-division" target='_blank'>Ministry of home affairs Women</a></li>
        <li><a className='text-sm' href="https://www.unwomen.org/en" target='_blank'>United Nations Women</a></li>
        </ul>
        
        </div>
    </div>
    <div className='flex flex-row  mx-auto  w-[1140px] justify-center' >
    © 2025 We Safe™. All Rights Reserved.
    </div>
    </div>
  )
}

export default Footer