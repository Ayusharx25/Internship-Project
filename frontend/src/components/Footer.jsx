import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>
        <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-10 text-sm'>
            {/*---------Left Section--------- */}
            <div>
                <img className='mb-0 w-32 ' src={assets.docbook} alt=""/>
                <p className='w-full md:w-4/5 text-gray-600 leading-6'>DocBook is a Doctor Appointment Booking System Software is a digital platform designed to streamline the process of scheduling, managing, and tracking medical appointments. It serves as a bridge between patients and healthcare providers, offering a user-friendly interface to book appointments while providing healthcare professionals with tools to manage their schedules effectively. </p>

            </div>

            {/*----------Center Section-------- */}
            <div>
                <p className='text-xl font-medium mb-4 mt-20'>COMPANY</p>
                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li>Home</li>
                    <li>About Us</li>
                    <li>Contact Us</li>
                    <li>Privacy Policy</li>
                </ul>

            </div>

            {/*----------Right Section-------- */}
            <div>
                <p className='text-xl font-medium mb-4 mt-20' >GET IN TOUCH</p>
                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li>(555)-324-6969</li>
                    <li>docbook@gmail.com</li>
                </ul>
            </div>
        </div>

        {/*Copyright Text */}
        <div>
            <hr/>
            <p className='py-5 text-sm text-center'>Copyright © 2025 DocBook - All Right Reserved.</p>
        </div>
    </div>
  )
}

export default Footer