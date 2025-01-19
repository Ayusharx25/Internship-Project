import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import RelatedDoctors from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
import axios from 'axios';

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext);
  const daysofWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [loading, setLoading] = useState(true); // Loading state

  // Function to fetch doctor info
  const fetchDocInfo = async () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
  };

  // Function to get available slots for the doctor
  const getAvailableSlots = async () => {
    setLoading(true);
    setDocSlots([]);

    let today = new Date();

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      

        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime,
        });

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      setDocSlots((prev) => [...prev, timeSlots]);
    }

    setLoading(false);
  };

  // Function to book appointment
  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book Appointment');
      return navigate('/login');
    }
  
    // Check if docSlots is populated and slotIndex is valid
    console.log("Current docSlots:", docSlots);
  
    if (!docSlots || docSlots.length === 0) {
      toast.error('No available slots');
      console.log("docSlots is empty or undefined:", docSlots);
      return;
    }
  
    // Validate that slotIndex is within bounds
    if (slotIndex < 0 || slotIndex >= docSlots.length) {
      toast.error('Invalid slot index');
      console.log("Invalid slot index:", slotIndex);
      return;
    }
  
    // Ensure the selected slotIndex contains valid slots
    const selectedDaySlots = docSlots[slotIndex];
    console.log("Selected Day Slots:", selectedDaySlots);  // Logs the slots for the selected day
  
    if (!selectedDaySlots || selectedDaySlots.length === 0) {
      toast.error('No slots available for the selected day');
      console.log("No slots available for this day:", selectedDaySlots);
      return;
    }
  
    // Validate slotTime is selected and valid
    if (!slotTime) {
      toast.error('Please select a time slot');
      console.log("No time slot selected:", slotTime);
      return;
    }
  
    // Check if the selected time slot exists in the selectedDaySlots
    const selectedSlot = selectedDaySlots.find((slot) => slot.time === slotTime);
    if (!selectedSlot) {
      toast.error('Invalid slot time selected');
      console.log("No matching time slot found:", slotTime);
      return;
    }
  
    // If we have a valid selectedSlot, proceed with the date formatting and API call
    try {
      const date = selectedSlot.datetime;
      const day = date.getDate();
      const month = date.getMonth() + 1; // Months are 0-indexed
      const year = date.getFullYear();
  
      // Format date as 'DD_MM_YYYY'
      const slotDate = `${day < 10 ? '0' + day : day}_${month < 10 ? '0' + month : month}_${year}`;
      
      console.log("Formatted Slot Date (before sending):", slotDate); // Log formatted date
      console.log("Selected Slot Time:", slotTime); // Log selected slot time
  
      // Payload being sent to the backend
      const payload = { docId, slotDate, slotTime };
      console.log("Payload being sent to backend:", payload);
  
      // Send the booking request
      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        payload,
        { headers: { token } }
      );
  
      if (data.success) {
        toast.success(data.message);
        getDoctorsData(); // Refresh doctor data after booking
        navigate('/my-appointment');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log('Error during booking:', error); // Log the error for deeper inspection
      toast.error(error.message || 'An error occurred while booking the appointment');
    }
  };
  

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo]);

  useEffect(() => {
    console.log('Current docSlots:', docSlots); // Log the docSlots array
    console.log('Selected Slot Time:', slotTime); // Log the selected slotTime
  }, [docSlots, slotTime]);

  return docInfo && (
    <div>
      {/* Doctor Details */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>

        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          {/* Doc Info: name, degree, experience */}
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>
              {docInfo.experience}
            </button>
          </div>

          {/* Doctor About */}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>About <img src={assets.info_icon} alt="" /></p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>

      {/* Booking Slots */}
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking Slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.length > 0 && !loading && docSlots.map((item, index) => (
              <div
                onClick={() => setSlotIndex(index)}
                className={`text-center py-4 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200'}`}
                key={index}
              >
                <p>{item[0] && daysofWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))
          }
        </div>

        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {docSlots.length > 0 && !loading && docSlots[slotIndex] && docSlots[slotIndex].map((item, index) => (
            <p onClick={() => setSlotTime(item.time)} className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'}`} key={index}>
              {item.time.toLowerCase()}
            </p>
          ))}
        </div>
        <button onClick={bookAppointment} className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6' disabled={loading}>
          Book an appointment
        </button>
      </div>

      {/* Listing related Doctors */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  );
};

export default Appointment;
