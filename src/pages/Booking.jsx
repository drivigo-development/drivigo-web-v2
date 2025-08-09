import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { MapPinHouse, Calendar, Clock, Car, MapPin, CheckCircle, X } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// Define API URL
const apiUrl = import.meta.env.VITE_API_URL || "https://drivigo-server-v2.vercel.app";

// Libraries for Google Maps - defined outside component to prevent reloading
const libraries = ["places"];

// Distance function
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function BookingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Enhanced booking details state
  const [bookingDetails, setBookingDetails] = useState({
    startDate: "",
    timeSlot: "",
    location: { lat: 28.6333, lng: 77.2167 }, // Default to Delhi
    sessionPlan: "",
    address: "", // To store the formatted address
    endDate: "", // Will be calculated based on plan and instructor availability
    selectedTimeSlots: [], // Array of selected time slots
  });

  // State for instructors and payment
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showInstructorDetails, setShowInstructorDetails] = useState(false);
  
  // Payment details
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("INR");

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });
  
  const [map, setMap] = useState(null);
  
  // Calculate amount based on session plan
  useEffect(() => {
    if (bookingDetails.sessionPlan === "7-day") {
      setAmount(5000);
    } else if (bookingDetails.sessionPlan === "14-day") {
      setAmount(7000);
    }
  }, [bookingDetails.sessionPlan]);
  
  // Check login status
  useEffect(() => {
    // Only show a console message instead of redirecting
    if (!user) {
      console.log("No user detected in initial load");
    } else {
      console.log("User authenticated:", user.email);
    }
  }, [user]);

  // Function to get address from coordinates using Google Maps Geocoding API
  const getAddressFromCoordinates = useCallback(async (lat, lng) => {
    try {
      if (!window.google) return "Address not available";

      const geocoder = new window.google.maps.Geocoder();
      const response = await new Promise((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject("Could not get address from this location.");
          }
        });
      });
      return response;
    } catch (error) {
      console.error("Error getting address:", error);
      return "Address not found";
    }
  }, []);

  const onLoad = useCallback(
    (map) => {
      setMap(map);
      // Get initial address when map loads
      if (window.google && bookingDetails.location) {
        getAddressFromCoordinates(
          bookingDetails.location.lat,
          bookingDetails.location.lng
        )
          .then((address) => {
            setBookingDetails((prevState) => ({
              ...prevState,
              address,
            }));
          })
          .catch((error) =>
            console.error("Failed to get initial address:", error)
          );
      }
    },
    [bookingDetails.location, getAddressFromCoordinates]
  );

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prevState) => ({ ...prevState, [name]: value }));
  };

  // Function to get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Update location
        setBookingDetails((prevState) => ({
          ...prevState,
          location: { lat, lng },
        }));

        // Get and update address
        if (isLoaded && window.google) {
          try {
            const address = await getAddressFromCoordinates(lat, lng);
            setBookingDetails((prevState) => ({
              ...prevState,
              address,
            }));
          } catch (error) {
            console.error("Failed to get address:", error);
          }
        }

        // Center the map on the new location
        if (map) {
          map.panTo({ lat, lng });
        }

        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting current location:", error);
        alert(`Error getting your location: ${error.message}`);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleLocationChange = async (event) => {
    const newPosition = event.latLng;
    const lat = newPosition.lat();
    const lng = newPosition.lng();
    // Update location immediately
    setBookingDetails((prevState) => ({
      ...prevState,
      location: { lat, lng },
    }));

    // Get and update address
    if (isLoaded && window.google) {
      try {
        const address = await getAddressFromCoordinates(lat, lng);
        setBookingDetails((prevState) => ({
          ...prevState,
          address,
        }));
      } catch (error) {
        console.error("Failed to get address:", error);
      }
    }
  };

  // Function to find instructors within 5km radius of learner's location
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSearching(true);
    
    try {
      if (!user) {
        toast.error("Please log in to search for instructors");
        setIsLoading(false);
        setIsSearching(false);
        return;
      }
      
      if (!bookingDetails.startDate || !bookingDetails.location) {
        toast.error("Please select a start date and location");
        setIsLoading(false);
        setIsSearching(false);
        return;
      }
      
      // Fetch all instructors with their location data
      const { data: allInstructors, error: instructorError } = await supabase
        .from('users')
        .select(`
          id,
          name,
          profile_img,
          instructor_table!inner(instructor_id, vehicle_name, vehicle_no, d_school_location, latitude, longitude)
        `)
        .eq('role', 'instructor');
      
      if (instructorError) {
        console.error("Error finding instructors:", instructorError);
        toast.error("Failed to find instructors");
        setIsLoading(false);
        setIsSearching(false);
        return;
      }
      
      // Format instructor data and calculate distances
      const instructorsWithDistance = allInstructors.map(instructor => {
        // Extract instructor_table data
        const instructorData = {
          instructor_id: instructor.id,
          name: instructor.name,
          profile_image: instructor.profile_img,
          vehicle_model: instructor.instructor_table.vehicle_name,
          car_model: instructor.instructor_table.vehicle_no,
          d_school_location: instructor.instructor_table.d_school_location,
          latitude: instructor.instructor_table.latitude,
          longitude: instructor.instructor_table.longitude
        };
        
        // Calculate distance if coordinates are available
        let distance = null;
        if (instructorData.latitude && instructorData.longitude && 
            bookingDetails.location.lat && bookingDetails.location.lng) {
          distance = getDistanceFromLatLonInKm(
            bookingDetails.location.lat,
            bookingDetails.location.lng,
            instructorData.latitude,
            instructorData.longitude
          );
          // Round to 1 decimal place
          distance = Math.round(distance * 10) / 10;
        }
        
        return {
          ...instructorData,
          distance: distance
        };
      });
      
      // Filter instructors within 5km radius
      const nearbyInstructors = instructorsWithDistance.filter(instructor => 
        instructor.distance !== null && instructor.distance <= 5
      );
      
      if (nearbyInstructors.length === 0) {
        toast.error("No instructors found within 5km of your location");
        setInstructors([]);
        setIsLoading(false);
        setIsSearching(false);
        return;
      }
      
      // For each instructor, fetch their availability and filter out blocked slots
      const instructorsWithAvailability = await Promise.all(
        nearbyInstructors.map(async (instructor) => {
          // Get instructor's weekly availability
          const { data: availability, error: availabilityError } = await supabase
            .from('instructor_availability')
            .select('*')
            .eq('instructor_id', instructor.instructor_id)
            .eq('is_active', true);
            
          if (availabilityError) {
            console.error("Error fetching availability:", availabilityError);
            return { ...instructor, available_slots: [] };
          }
          
          // Get instructor's blocked slots
          const startDate = new Date(bookingDetails.startDate);
          const { data: blockedSlots, error: blockedError } = await supabase
            .from('blocked_slots')
            .select('*')
            .eq('instructor_id', instructor.instructor_id)
            .gte('start_date', startDate.toISOString().split('T')[0]);
            
          if (blockedError) {
            console.error("Error fetching blocked slots:", blockedError);
            return { ...instructor, available_slots: [] };
          }
          
          // Process availability and blocked slots to determine available time slots
          const { availableSlots, blockedSlots: instructorBlockedSlots } = processAvailability(availability, blockedSlots, startDate);
          
          return {
            ...instructor,
            available_slots: availableSlots,
            blocked_slots: instructorBlockedSlots
          };
        })
      );
      
      // Filter out instructors with no available slots
      const availableInstructors = instructorsWithAvailability.filter(
        instructor => instructor.available_slots && instructor.available_slots.length > 0
      );
      
      setInstructors(availableInstructors);
      setIsSearching(false);
      
      if (availableInstructors.length === 0) {
        toast.error("No instructors with available slots found");
      } else {
        toast.success(`Found ${availableInstructors.length} instructors nearby`);
      }
      
    } catch (error) {
      console.error("Instructor search error:", error);
      toast.error("An error occurred while searching for instructors");
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };
  
  // Helper function to process availability and blocked slots
  const processAvailability = (availability, blockedSlots, startDate) => {
    if (!availability || availability.length === 0) return { availableSlots: [], blockedSlots: [] };
    
    // Map day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = startDate.getDay();
    
    // Find availability for the selected day
    const dayAvailability = availability.find(slot => slot.day_of_week === dayOfWeek);
    if (!dayAvailability || !dayAvailability.time_slots) return { availableSlots: [], blockedSlots: [] };
    
    // Get all time slots for that day
    const allTimeSlots = dayAvailability.time_slots;
    
    // Filter out blocked slots for the selected date
    const blockedForDate = blockedSlots.filter(block => {
      const blockStart = new Date(block.start_date);
      const blockEnd = new Date(block.end_date);
      return startDate >= blockStart && startDate <= blockEnd;
    });
    
    // Get all blocked time slots for that date
    const blockedTimeSlots = blockedForDate.flatMap(block => block.time_slots || []);
    
    // Return both available and blocked slots
    return {
      availableSlots: allTimeSlots.filter(slot => !blockedTimeSlots.includes(slot)),
      blockedSlots: blockedTimeSlots
    };
  };

  // Handle instructor selection and show available time slots
  const handleSelectInstructor = (instructor) => {
    setSelectedInstructor(instructor);
    setShowInstructorDetails(true);
    setAvailableSlots(instructor.available_slots || []);
    setBlockedSlots(instructor.blocked_slots || []);
    calculateEndDate(instructor);
  };
  // Handle time slot selection
  const handleTimeSlotSelection = (slot) => {
    // Check if this slot is already selected
    const isSelected = bookingDetails.selectedTimeSlots.includes(slot);
    
    if (isSelected) {
      // Remove the slot if it's already selected
      setBookingDetails(prev => ({
        ...prev,
        selectedTimeSlots: []
      }));
    } else {
      // Replace any existing selection with just this slot
      setBookingDetails(prev => ({
        ...prev,
        selectedTimeSlots: [slot]
      }));
      
      // Show feedback to the user
      toast.success("Time slot selected");
    }
  };
  
  // Calculate end date based on session plan and instructor availability
  const calculateEndDate = async (instructor) => {
    try {
      // Show loading state
      setIsLoading(true);
      
      const startDate = new Date(bookingDetails.startDate);
      const sessionCount = bookingDetails.sessionPlan === "7-day" ? 7 : 14;
      
      // Get instructor's weekly availability
      const { data: availability, error } = await supabase
        .from('instructor_availability')
        .select('*')
        .eq('instructor_id', instructor.instructor_id)
        .eq('is_active', true);
        
      if (error) {
        console.error("Error fetching availability for end date calculation:", error);
        toast.error("Error calculating end date");
        setIsLoading(false);
        return;
      }
      
      if (!availability || availability.length === 0) {
        toast.error("Instructor has no availability set");
        setIsLoading(false);
        return;
      }
      
      // Pre-fetch all blocked slots for efficiency
      const { data: allBlockedSlots, error: blockedError } = await supabase
        .from('blocked_slots')
        .select('*')
        .eq('instructor_id', instructor.instructor_id)
        .gte('start_date', startDate.toISOString().split('T')[0]);
        
      if (blockedError) {
        console.error("Error fetching blocked slots:", blockedError);
        toast.error("Error calculating end date");
        setIsLoading(false);
        return;
      }
      
      // Calculate end date based on instructor availability and session count
      let currentDate = new Date(startDate);
      let sessionsScheduled = 0;
      let maxDaysToCheck = 60; // Safety limit to prevent infinite loops
      let daysChecked = 0;
      
      while (sessionsScheduled < sessionCount && daysChecked < maxDaysToCheck) {
        daysChecked++;
        
        // Check if instructor is available on this day of week
        const dayOfWeek = currentDate.getDay();
        const dayAvailability = availability.find(slot => slot.day_of_week === dayOfWeek);
        
        if (dayAvailability && dayAvailability.time_slots && dayAvailability.time_slots.length > 0) {
          // Check if this date is not blocked
          const dateString = currentDate.toISOString().split('T')[0];
          
          // Check if date is blocked using the pre-fetched data
          const isBlocked = allBlockedSlots?.some(slot => 
            new Date(slot.start_date) <= new Date(dateString) && 
            new Date(slot.end_date) >= new Date(dateString)
          );
          
          if (!isBlocked) {
            sessionsScheduled++;
          }
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Set the calculated end date
      if (daysChecked >= maxDaysToCheck) {
        toast.warning("Could not calculate exact end date due to limited availability");
      }
      
      // Go back one day since the loop advances one day too far
      currentDate.setDate(currentDate.getDate() - 1);
      
      // Update end date in booking details
      setBookingDetails(prev => ({
        ...prev,
        endDate: currentDate.toISOString().split('T')[0]
      }));
      
    } catch (error) {
      console.error("Error in calculateEndDate:", error);
      toast.error("Error calculating end date");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process payment and create booking
  const handlePayment = async () => {
    try {
      setIsLoading(true);
      
      // Validate user authentication
      if (!user) {
        toast.error('Please log in to book a session');
        setIsLoading(false);
        return;
      }
      
      // Validate instructor selection
      if (!selectedInstructor) {
        toast.error('Please select an instructor');
        setIsLoading(false);
        return;
      }
      
      // Validate time slot selection
      if (bookingDetails.selectedTimeSlots.length === 0) {
        toast.error('Please select at least one time slot');
        setIsLoading(false);
        return;
      }
      
      // Calculate amount in paise (smallest currency unit)
      const amount = bookingDetails.sessionPlan === "7-day" ? 5000 : 7000;
      const paiseAmount = amount * 100;
      const currency = "INR";
      
      // Create order via backend API
      const { data } = await axios.post(
        `${apiUrl}/create-order`,
        {
          amount,
          currency,
          receipt: `booking-${Date.now()}`,
          notes: {
            user_id: user.id,
            instructor_id: selectedInstructor.instructor_id,
            session_plan: bookingDetails.sessionPlan,
            start_date: bookingDetails.startDate,
            end_date: bookingDetails.endDate,
            time_slots: bookingDetails.selectedTimeSlots.join(','),
            pickup_location: bookingDetails.address,
            pickup_coordinates: `${bookingDetails.location.lat},${bookingDetails.location.lng}`
          }
        }
      );
      
      const { order_id } = data;
      console.log("Razorpay data",data);
      // Configure Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: paiseAmount,
        currency,
        name: 'Drivigo',
        description: `${bookingDetails.sessionPlan} Driving Course`,
        order_id,
        prefill: {
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
          contact: user.user_metadata?.phone || ''
        },
        theme: { color: '#ffbd40' },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
            toast.error('Payment cancelled');
          }
        },
        handler: async function(response) {
          try {
            setIsVerifying(true);
            
            // Log payment details for debugging
            console.log("Payment details:", {
              payment_id: response.razorpay_payment_id,
              order_id: order_id, // Using the order_id from order creation
              signature: response.razorpay_signature
            });
            
            // Verify payment and create booking
            // Using the exact parameter names expected by the backend
            const verifyResponse = await axios.post(`${apiUrl}/verify-payment`, {
              payment_id: response.razorpay_payment_id,
              order_id: order_id, // Using the order_id from order creation
              signature: response.razorpay_signature
            });
            
            // Backend returns plain text response, not JSON
            if (verifyResponse.data === 'Payment verification successful') {
              console.log('Payment verification successful, proceeding with booking creation');
              
              // Step 1: Insert into bookings table
              const paymentId = response.razorpay_payment_id || response.payment_id;
              console.log('Inserting booking with payment ID:', paymentId);
              
              try {
                console.log('Database insertion attempt with user ID:', user.id);
                console.log('Booking details:', {
                  learner_id: user.id,
                  instructor_id: selectedInstructor.instructor_id,
                  learner_plan: bookingDetails.sessionPlan,
                  start_date: bookingDetails.startDate,
                  end_date: bookingDetails.endDate
                });
                
                // Insert into bookings table with proper schema
                const { data: bookingData, error: bookingError } = await supabase
                  .from('bookings')
                  .insert([
                    {
                      learner_id: user.id,
                      instructor_id: selectedInstructor.instructor_id,
                      learner_plan: bookingDetails.sessionPlan,
                      start_date: bookingDetails.startDate,
                      end_date: bookingDetails.endDate,
                      time_slots: bookingDetails.selectedTimeSlots, // This will be converted to JSONB
                      razorpay_payment_id: paymentId,
                      amount: amount // Include the booking amount
                      // purchased_date will use DEFAULT current_date
                      // booking_id will use DEFAULT uuid_generate_v4()
                    }
                  ])
                  .select()
                  .single();
                  
                console.log('Booking created successfully:', bookingData);
              
                if (bookingError) {
                  console.error('Booking creation error:', bookingError);
                  toast.error('Booking creation failed. Please contact support.');
                  return;
                }
                
                // Update or insert learner's location in learner_table
                if (bookingDetails.address) {
                  console.log('Updating learner location:', bookingDetails.address);
                  
                  // First check if entry exists
                  const { data: existingLocation } = await supabase
                    .from('learner_table')
                    .select('location_id')
                    .eq('learner_id', user.id)
                    .single();
                    
                  if (existingLocation) {
                    // Update existing location
                    const { error: locationUpdateError } = await supabase
                      .from('learner_table')
                      .update({ 
                        location: bookingDetails.address,
                        latitude: bookingDetails.lat || null,
                        longitude: bookingDetails.lng || null
                      })
                      .eq('learner_id', user.id);
                      
                    if (locationUpdateError) {
                      console.error('Error updating learner location:', locationUpdateError);
                    } else {
                      console.log('Learner location updated successfully');
                    }
                  } else {
                    // Insert new location
                    const { error: locationInsertError } = await supabase
                      .from('learner_table')
                      .insert([
                        {
                          learner_id: user.id,
                          location: bookingDetails.address,
                          latitude: bookingDetails.lat || null,
                          longitude: bookingDetails.lng || null
                        }
                      ]);
                      
                    if (locationInsertError) {
                      console.error('Error inserting learner location:', locationInsertError);
                    } else {
                      console.log('Learner location inserted successfully');
                    }
                  }
                }
                
                // Step 2: Insert into blocked_slots table
                console.log('Creating blocked slots for instructor');
                
                // Insert into blocked_slots table with proper schema
                const { error: blockError } = await supabase
                  .from('blocked_slots')
                  .insert([
                    {
                      instructor_id: selectedInstructor.instructor_id,
                      start_date: bookingDetails.startDate,
                      end_date: bookingDetails.endDate,
                      time_slots: bookingDetails.selectedTimeSlots, // This will be converted to JSONB
                      booking_id: bookingData.booking_id
                      // block_id will use DEFAULT uuid_generate_v4()
                    }
                  ]);
                  
                if (blockError) {
                  console.error('Blocking slots error:', blockError);
                  toast.error('Failed to block instructor slots. Please contact support.');
                  return;
                }
                
                console.log('Slots blocked successfully, sending confirmation email');
                
                // Send confirmation email
                console.log('Attempting to send confirmation email');
                
                try {
                  // Log the email endpoint and payload
                  const emailEndpoint = `${apiUrl}/payment-success-email`;
                  const emailPayload = {
                    email: user.email,
                    name: user.user_metadata?.full_name || '',
                    booking_details: {
                      instructor_name: selectedInstructor.name,
                      session_plan: bookingDetails.sessionPlan,
                      start_date: bookingDetails.startDate,
                      time_slots: bookingDetails.selectedTimeSlots,
                      pickup_location: bookingDetails.address
                    }
                  };
                  
                  console.log('Email endpoint:', emailEndpoint);
                  console.log('Email payload:', emailPayload);
                  
                  // Send the confirmation email
                  try {
                    await axios.post(emailEndpoint, emailPayload);
                    console.log('Email sent successfully');
                  } catch (innerEmailError) {
                    console.error('Email API error:', innerEmailError);
                    // Continue with success flow even if email fails
                  }
                  
                  console.log('Confirmation email process completed');
                } catch (emailError) {
                  console.error('Email sending error:', emailError);
                  // Continue with success flow even if email fails
                }
                
                console.log('Booking process completed successfully');
                toast.success('Booking confirmed! Check your email for details.');
                navigate('/dashboard');
              } catch (dbError) {
                console.error('Database operation error:', dbError);
                toast.error('Booking process failed. Please contact support.');
              }
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          } finally {
            setIsVerifying(false);
            setIsLoading(false);
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Payment initialization error:', err);
      setIsLoading(false);
      toast.error('Could not start payment. Please try again.');
    }
  };

return (
  <div className="animate-fade-in">
    {/* Header Section */}
    <div className="bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl lg:text-5xl font-display font-bold text-secondary-900 mb-4">
          Book Your <span className="text-gradient">Driving Session</span>
        </h1>
        <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
          Fill out the details below to find an available instructor in your
          area.
        </p>
      </div>
    </div>

    {/* Booking Form Section */}
    <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date and Time Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-bold text-secondary-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={bookingDetails.startDate}
                    onChange={handleChange}
                    required
                    className="input-field"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="block text-base font-bold text-secondary-700 mb-2">
                    Preferred Time Slot
                  </label>
                  <select
                    name="timeSlot"
                    value={bookingDetails.timeSlot}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select a time</option>
                    <option value="07:00-08:00">7:00 AM - 8:00 AM</option>
                    <option value="08:00-09:00">8:00 AM - 9:00 AM</option>
                    <option value="09:00-10:00">9:00 AM - 10:00 AM</option>
                    <option value="16:00-17:00">4:00 PM - 5:00 PM</option>
                    <option value="17:00-18:00">5:00 PM - 6:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Location Selection */}
              <div>
                <div className="flex justify-between items-center">
                  <label className=" text-base font-bold text-secondary-700 mb-2">
                    Pickup/Drop Location
                  </label>
                  <p className="text-base font-semibold text-error-500  mb-1 ">
                    Drag the pin to set your exact location for pickup and drop.
                  </p>
                </div>

                {/* Display the selected address */}
                <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-md">
                  <div className="lg:flex justify-between items-center">
                    <p className="text-sm font-medium text-primary-800">
                      <span className="font-semibold">Selected Location:</span>{" "}
                      {bookingDetails.address || "Loading address..."}
                    </p>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isLocating}
                      className="w-[12rem] mt-2 lg:mt-0 flex items-center justify-center gap-2 py-2 text-xs bg-primary-600 hover:bg-primary-700 text-white px-2 rounded transition-colors"
                    >
                      {isLocating ? (
                        <>
                          <div className="w-3 h-3 border-t-2 border-white border-solid rounded-full animate-spin mr-1"></div>
                          <span>Locating...</span>
                        </>
                      ) : (
                        <>
                          <MapPinHouse size={24} />
                          <span className="text-[15px]">Use My Location</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="border border-secondary-200 rounded-lg overflow-hidden">
                  <div style={{ height: "400px", width: "100%" }}>
                    {isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        center={bookingDetails.location}
                        zoom={11}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                        options={{
                          streetViewControl: false,
                          mapTypeControl: false,
                          fullscreenControl: true,
                        }}
                      >
                        <Marker
                          position={bookingDetails.location}
                          draggable={true}
                          onDragEnd={handleLocationChange}
                        />
                      </GoogleMap>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Session Plan Selection */}
              <div>
                <label className="block text-base font-bold text-secondary-700 mb-2">
                  Session Plan
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="relative">
                    <input
                      type="radio"
                      name="sessionPlan"
                      value="7-day"
                      checked={bookingDetails.sessionPlan === "7-day"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        bookingDetails.sessionPlan === "7-day"
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-secondary-200 bg-white text-secondary-700 hover:border-secondary-300"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-display font-bold mb-2">
                          7 Days
                        </div>
                        <div className="text-sm">1 hour per day</div>
                        <div className="text-lg font-semibold mt-2">₹5,000</div>
                      </div>
                    </div>
                  </label>

                  <label className="relative">
                    <input
                      type="radio"
                      name="sessionPlan"
                      value="14-day"
                      checked={bookingDetails.sessionPlan === "14-day"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        bookingDetails.sessionPlan === "14-day"
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-secondary-200 bg-white text-secondary-700 hover:border-secondary-300"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-display font-bold mb-2">
                          14 Days
                        </div>
                        <div className="text-sm">30 minutes per day</div>
                        <div className="text-lg font-semibold mt-2">₹7,000</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Find Instructors Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary text-lg px-12 py-4 flex items-center justify-center mx-auto"
                >
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Finding Instructors...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-6 h-6 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Find Instructors
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

    {/* Available Instructors Section */}
    {instructors.length > 0 && !showInstructorDetails && (
        <section className="py-12 bg-secondary-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-secondary-900 mb-4">
                Available Instructors
              </h2>
              <p className="text-xl text-secondary-600">
                Choose from our verified instructors in your area
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {instructors.map((instructor) => (
                <div key={instructor.instructor_id} className="card-hover">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                      {instructor.profile_image ? (
                        <img 
                          src={instructor.profile_image} 
                          alt={instructor.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-xl">
                          {instructor.name?.charAt(0) || "I"}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-display font-semibold text-secondary-900 mb-2">
                      {instructor.name || "Instructor"}
                    </h3>
                    <p className="text-secondary-600 mb-2">
                      {instructor.school_name || "Drivigo Driving School"}
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-sm text-secondary-500">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span>{instructor.vehicle_model || instructor.car_model || "Standard Training Car"}</span>
                    </div>
                    
                    {/* Distance information */}
                    {instructor.distance !== null && (
                      <div className="mt-2 flex items-center justify-center space-x-2 text-sm text-primary-600 font-medium">
                        <MapPin className="w-4 h-4" />
                        <span>{instructor.distance} km away</span>
                      </div>
                    )}
                    
                    {/* Show available slots count */}
                    <div className="mt-3 flex items-center justify-center space-x-2 text-sm text-secondary-500">
                      <Calendar className="w-4 h-4" />
                      <span>{instructor.available_slots?.length || 0} available slots</span>
                    </div>
                  </div>
                  
                  {/* Preview of available time slots */}
                  {instructor.available_slots && instructor.available_slots.length > 0 && (
                    <div className="mt-4 mb-4 px-2">
                      <h4 className="text-xs font-semibold mb-2 text-secondary-700">Available Times:</h4>
                      <div className="flex flex-wrap gap-1">
                        {instructor.available_slots.slice(0, 3).map((slot, idx) => (
                          <span key={idx} className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded">
                            {slot}
                          </span>
                        ))}
                        {instructor.available_slots.length > 3 && (
                          <span className="text-xs bg-secondary-50 text-secondary-700 px-2 py-1 rounded">
                            +{instructor.available_slots.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleSelectInstructor(instructor)}
                    disabled={isVerifying || !instructor.available_slots || instructor.available_slots.length === 0}
                    className="btn-success w-full flex items-center justify-center"
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : !instructor.available_slots || instructor.available_slots.length === 0 ? (
                      <>No Available Slots</>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        Select & Continue
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    {/* Instructor Details and Time Slot Selection Section */}
    {showInstructorDetails && selectedInstructor && (
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-display font-bold text-secondary-900">
                Select Time Slots
              </h2>
              <button 
                onClick={() => setShowInstructorDetails(false)}
                className="text-primary-600 hover:text-primary-800 flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to instructors
              </button>
            </div>
            
            <div className="card mb-8">
              {/* Instructor Profile */}
              <div className="flex items-center p-6 bg-secondary-50 rounded-t-lg">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mr-6 overflow-hidden">
                  {selectedInstructor.profile_image ? (
                    <img 
                      src={selectedInstructor.profile_image} 
                      alt={selectedInstructor.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-2xl">
                      {selectedInstructor.name?.charAt(0) || "I"}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-display font-semibold text-secondary-900 mb-1">
                    {selectedInstructor.name}
                  </h3>
                  <p className="text-secondary-600 mb-1">
                    {selectedInstructor.school_name || "Drivigo Driving School"}
                  </p>
                  <p className="text-secondary-600">
                    {selectedInstructor.vehicle_model || selectedInstructor.car_model || "Standard Training Car"}
                  </p>
                </div>
              </div>
              
              {/* Session Details */}
              <div className="p-6 border-b border-secondary-100">
                <h3 className="text-xl font-semibold mb-4">Session Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-primary-50 p-4 rounded-md">
                    <p className="text-sm font-medium text-primary-800">Start Date</p>
                    <p className="text-lg">{bookingDetails.startDate}</p>
                  </div>
                  <div className="bg-primary-50 p-4 rounded-md">
                    <p className="text-sm font-medium text-primary-800">End Date</p>
                    <p className="text-lg">{bookingDetails.endDate || "Calculating..."}</p>
                  </div>
                  <div className="bg-primary-50 p-4 rounded-md">
                    <p className="text-sm font-medium text-primary-800">Session Plan</p>
                    <p className="text-lg">{bookingDetails.sessionPlan}</p>
                  </div>
                </div>
              </div>
              
              {/* Time Slots */}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Time Slots</h3>
                <p className="text-secondary-600 mb-6">
                  Select your preferred time slots for your driving lessons. <span className="text-red-600 font-medium">Red slots</span> are already booked.
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                  {/* Display all time slots - both available and blocked */}
                  {[...availableSlots, ...blockedSlots].length > 0 ? (
                    [...availableSlots, ...blockedSlots].sort().map((slot, index) => {
                      const isSelected = bookingDetails.selectedTimeSlots.includes(slot);
                      const isBooked = blockedSlots.includes(slot);
                      return (
                        <button
                          key={index}
                          onClick={isBooked ? undefined : () => handleTimeSlotSelection(slot)}
                          disabled={isBooked}
                          className={`p-3 rounded-md border text-center transition-colors ${
                            isSelected 
                              ? 'bg-primary-600 text-white border-primary-600' 
                              : isBooked
                                ? 'bg-red-100 text-red-600 border-red-300 cursor-not-allowed'
                                : 'bg-white text-secondary-800 border-secondary-200 hover:bg-secondary-50'
                          }`}
                        >
                          {slot}{isBooked && <span className="block text-xs mt-1 font-medium">Booked</span>}
                        </button>
                      );
                    })
                  ) : (
                    <p className="col-span-full text-secondary-500">No time slots available for the selected date.</p>
                  )}
                </div>
                
                {/* Selected Time Slots */}
                {bookingDetails.selectedTimeSlots.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Selected Time Slots</h4>
                    <div className="flex flex-wrap gap-2">
                      {bookingDetails.selectedTimeSlots.map((slot, index) => (
                        <div key={index} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full flex items-center">
                          <span>{slot}</span>
                          <button 
                            onClick={() => handleTimeSlotSelection(slot)}
                            className="ml-2 text-primary-600 hover:text-primary-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Payment Button */}
                <div className="mt-8 border-t border-secondary-100 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-lg font-semibold">Total Amount</p>
                      <p className="text-2xl font-display font-bold text-primary-600">
                        {bookingDetails.sessionPlan === "7-day" ? "₹5,000" : "₹7,000"}
                      </p>
                    </div>
                    <button
                      onClick={handlePayment}
                      disabled={isLoading || isVerifying || bookingDetails.selectedTimeSlots.length === 0 || !bookingDetails.endDate}
                      className="btn-primary px-8 py-3 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading || isVerifying ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Proceed to Payment
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-secondary-500">
                    By proceeding, you agree to our terms and conditions. Your booking will be confirmed after successful payment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      
    {/* No Results Message */}
    {instructors.length === 0 && (
      <section className="py-12 bg-secondary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="card">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-display font-bold text-secondary-900 mb-4">
              No Instructors Found
            </h3>
            <p className="text-secondary-600 mb-6">
              No instructors are available for the selected criteria. Please
              try different options or contact us for assistance.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary"
            >
              Try Different Options
            </button>
          </div>
        </div>
        </section>
      )}
    </div>
  );
}

export default BookingPage;
