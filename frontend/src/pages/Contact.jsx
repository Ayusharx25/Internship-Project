import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-5 text-gray-500'>
        <p>CONTACT <span className='text-gray-700 font-semibold'>US</span></p>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm'>
        <img className='w-full md:max-w-[320px]' src={assets.contact_image} alt="" />

        <div className='flex flex-col justify-center items-start gap-6'>
        <p className='font-semibold text-lg text-gray-600'>Our OFFICE</p>
        <p className='text-gray-500'>1234 Maple Avenue, <br />Suite 200 Springfield, Illinois</p>
        <p className='text-gray-500'>Tel: (555)-324-6969 <br />Email: docbook@gmail.com</p>
        <p className='font-semibold text-lg text-gray-600'>Careers at DocBook</p>
        <p className='text-gray-500'>Learns more about our teams and job openings.</p>
        <button className='border border-black px-8 py-4 text-sm hover:bg-gray-800 hover:text-white transition-all duration-500'>Explore Jobs</button>
        </div>

      </div>

      
    </div>
  )
}

export default Contact