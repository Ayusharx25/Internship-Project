import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/DoctorModel.js'
import appointmentModel from '../models/AppointmentModel.js'
import razorpay from 'razorpay'

//API to register user
const registerUser = async (req,res) => {
    try {
        const{name, email, password} = req.body

        if (!name || !email || !password) {
            return res.json({success:false,message:"Missing Details"})
        }

        //validating email format
        if (!validator.isEmail(email)) {
            return res.json({success:false,message:"Enter a valid Email"})
        }

        //validating strong password
        if (password.length < 8) {
            return res.json({success:false,message:"Enter a strong Password"})
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const userData = {
            name,
            email,
            password : hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        
        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)

        res.json({success:true, token})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API for user login
const loginUser = async (req,res) => {
    try {
        const {email,password} = req.body
        const user = await userModel.findOne({email})

        if (!user) {
            return res.json({success:false,message:'User does not exist'})
        }
        const isMatch = await bcrypt.compare(password,user.password)

        if (isMatch) {
            const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
            res.json({success:true,token})
        } else {
            res.json({success:false,message:"Invalid Credentials"})
        }

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// API to get user profile data
const getProfile = async (req,res) =>{
    try {
        const {userId} = req.body
        const userData = await userModel.findById(userId).select('-password')
        res.json({success:true,userData})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// API to update user profile
const updateProfile = async (req,res) =>{
    try {
        const {userId, name, phone, address, dob, gender} = req.body
        const imageFile = req.file

        if (!name || !phone || !address || !dob || !gender) {
            return res.json({success:false,message:"Data Missing"})
        }
        await userModel.findByIdAndUpdate(userId, {name, phone, address:JSON.parse(address), dob, gender})

        if(imageFile){
            //Upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId,{image:imageURL})
        }
        res.json({success:true,message:"Profile Updated"})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API to book appointment
//API to book appointment
const bookAppointment = async (req, res) => {
    try {
      const { userId, docId, slotDate, slotTime } = req.body;
  
      // Log the received slot date and time
      console.log("Received Slot Date:", slotDate);
      console.log("Received Slot Time:", slotTime);
  
      // Validate the slotDate format (DD_MM_YYYY)
      if (!/^\d{2}_\d{2}_\d{4}$/.test(slotDate)) {
        return res.json({ success: false, message: 'Invalid date format. Expected DD_MM_YYYY' });
      }
  
      // Convert slotDate from DD_MM_YYYY to YYYY-MM-DD for consistency
      const formattedDate = slotDate.split('_').reverse().join('-');
      console.log("Formatted Slot Date:", formattedDate);
  
      // Fetch the doctor's data
      const docData = await doctorModel.findById(docId).select('-password');
      if (!docData.available) {
        return res.json({ success: false, message: 'Doctor not available' });
      }
  
      // Ensure slots_booked exists
      let slots_booked = docData.slot_booked || {};
  
      // Check if the slot is already booked
      if (slots_booked[formattedDate]) {
        if (slots_booked[formattedDate].includes(slotTime)) {
          return res.json({ success: false, message: 'Slot not available' });
        } else {
          // If the slot is available, push the new time to the array
          slots_booked[formattedDate].push(slotTime);
        }
      } else {
        // If no slots are booked for the day, initialize the array with the new slot time
        slots_booked[formattedDate] = [slotTime];
      }
  
      // Save the updated slot_booked back to the doctor's record
      await doctorModel.findByIdAndUpdate(docId, { slot_booked: slots_booked });
  
      // Fetch user data for appointment creation
      const userData = await userModel.findById(userId).select('-password');
  
      // Remove slots_booked before saving the doctor data to appointment (if you don't need it)
      delete docData.slot_booked;
  
      // Create appointment data
      const appointmentData = {
        userId,
        docId,
        userData,
        docData,
        amount: docData.fees,
        slotTime,
        slotDate: formattedDate,
        date: Date.now(),
      };
  
      // Save the appointment
      const newAppointment = new appointmentModel(appointmentData);
      await newAppointment.save();
  
      // Send success response
      res.json({ success: true, message: 'Appointment booked successfully' });
  
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  }       

  // API to get user appointments for frontend my-appointment page
  const listAppointment = async (req,res) =>{

    try {
        const {userId} = req.body
        const appointments = await appointmentModel.find({userId})

        res.json({success:true, appointments})

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
  }

  //API to cancl apppointment
  const cancelAppoinement = async (req,res) =>{
    try {
        const {userId, appointmentId} = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user
        if (appointmentData.userId !== userId) {
            return res.json({success:false,message:'Unauthorized action'})
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled:true})

        // releasing doctor slot

        const {docId, slotDate, slotTime} = appointmentData
        const doctorData = await doctorModel.findById(docId)

        let slot_booked = doctorData.slot_booked

        slot_booked[slotDate] = slot_booked[slotDate].filter(e => e !== slotTime) 
         
        await doctorModel.findByIdAndUpdate(docId,{slot_booked})

        res.json({success:true, message:'Appointment Cancelled'})
        

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
  }

  const razorpayInstance = new razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET
  })

  // API to make payment of appointment using razorpay
  const paymentRazorpay = async(req,res) =>{

    try {
        
        const {appointmentId} = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

     if (!appointmentData || appointmentData.cancelled) {
        return res.json({success:false, message:"Appointment Cancelled or not found"})
     }

     //creating options for razorpay payment
     const options = {
        amount: appointmentData.amount * 100,
        currency: process.env.CURRENCY,
        receipt: appointmentId,
     }

     // creation of an order
     const order = await razorpayInstance.orders.create(options)
     res.json({success:true,order})

  

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }


}

// API to verify payment of razorpay
const verifyRazorPay = async (req,res) =>{
    try {
        const {razorpay_order_id} = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        
        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment:true})
            res.json({success:true, message:"Payment Successfull"})
        }else{
            res.json({success:false, message:"Payment failed"})
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
  

  

export {registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppoinement, paymentRazorpay, verifyRazorPay}