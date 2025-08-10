import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';
import { Calendar, Edit, Save, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

function Dashboard() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [editingAvailability, setEditingAvailability] = useState(false);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loadingUpcomingSessions, setLoadingUpcomingSessions] = useState(false);
  const [instructorPastSessions, setInstructorPastSessions] = useState([]);
  const [instructorTodaySessions, setInstructorTodaySessions] = useState([]);
  const [instructorUpcomingSessions, setInstructorUpcomingSessions] = useState([]);
  const [instructorSessions, setInstructorSessions] = useState([]);
  const [loadingInstructorSessions, setLoadingInstructorSessions] = useState(false);
  const navigate = useNavigate();

  // Pagination state
  const [currentPastPage, setCurrentPastPage] = useState(1);
  const [currentUpcomingPage, setCurrentUpcomingPage] = useState(1);
  const [currentInstructorPastPage, setCurrentInstructorPastPage] = useState(1);
  const [currentInstructorUpcomingPage, setCurrentInstructorUpcomingPage] = useState(1);
  const tableItemsPerPage = 5;
  const cardItemsPerPage = 2;

  // console.log(user)

  // Define fetchUpcomingSessions before it's used
  const fetchUpcomingSessions = async () => {
    if (!user) return;
    
    try {
      setLoadingUpcomingSessions(true);
      
      // Step 1: Get all active bookings for this learner
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*') // Get all booking fields
        .eq('learner_id', user.id)
        .gte('end_date', currentDate) // Only get bookings that haven't ended yet
        .order('start_date', { ascending: true });
        
      if (bookingsError) throw bookingsError;
      console.log(bookingsData)
      if (!bookingsData || bookingsData.length === 0) {
        setUpcomingSessions([]);
        setLoadingUpcomingSessions(false);
        return;
      }
      
      // Step 2: For each booking, get instructor details and availability
      const sessionsPromises = bookingsData.map(async (booking) => {
        // Get instructor details
        const { data: instructorData, error: instructorError } = await supabase
          .from('users')
          .select('name, phone')
          .eq('id', booking.instructor_id)
          .single();
          
        if (instructorError) throw instructorError;
        
        // Get learner's pickup location from learner_table
        let pickupLocation = 'Not specified';
        
        // Try to get location from learner_table
        const { data: locationData, error: locationError } = await supabase
          .from('learner_table')
          .select('location')
          .eq('learner_id', user.id)
          .single();
        
        if (!locationError && locationData && locationData.location) {
          pickupLocation = locationData.location;
          console.log('Found location in learner_table:', pickupLocation);
        } else {
          console.log('Location not found in learner_table, using default');
        }
          
        // Get instructor availability
        const { data: availabilityData, error: availabilityError } = await supabase
          .from('instructor_availability')
          .select('*')
          .eq('instructor_id', booking.instructor_id)
          .eq('is_active', true);
          
        if (availabilityError) throw availabilityError;
        
        // Calculate upcoming sessions based on booking dates, instructor availability, and learner plan
        const sessions = [];
        
        // Convert booking time_slots from jsonb to array
        const bookingTimeSlots = booking.time_slots || [];
        
        // Create a map of day_of_week -> available time_slots
        const availabilityMap = {};
        availabilityData.forEach(slot => {
          availabilityMap[slot.day_of_week] = slot.time_slots || [];
        });
        
        // Calculate all session dates between start_date and end_date
        const startDate = new Date(booking.start_date);
        const endDate = new Date(booking.end_date);
        
        // Determine number of sessions based on learner_plan
        let maxSessions = 100; // Default to a high number
        if (booking.learner_plan === '7-day') {
          maxSessions = 7;
        } else if (booking.learner_plan === '15-day') {
          maxSessions = 15;
        } else if (booking.learner_plan === '30-day') {
          maxSessions = 30;
        }
        
        console.log(`Plan: ${booking.learner_plan}, Max sessions: ${maxSessions}`);
        
        // Loop through each day between start and end date
        let sessionCount = 0;
        for (let date = new Date(startDate); date <= endDate && sessionCount < maxSessions; date.setDate(date.getDate() + 1)) {
          const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
          
          // Check if instructor is available on this day
          if (availabilityMap[dayOfWeek]) {
            // Find matching time slots between booking and instructor availability
            const matchingTimeSlots = bookingTimeSlots.filter(timeSlot => 
              availabilityMap[dayOfWeek].includes(timeSlot)
            );
            
            // Add a session for each matching time slot (respecting max sessions)
            for (const timeSlot of matchingTimeSlots) {
              if (sessionCount < maxSessions) {
                sessions.push({
                  date: new Date(date),
                  timeSlot,
                  instructorName: instructorData?.name || 'Unknown',
                  instructorContact: instructorData?.phone || 'N/A',
                  pickupLocation: pickupLocation
                });
                sessionCount++;
              } else {
                break;
              }
            }
          }
        }
        
        console.log(`Generated ${sessions.length} sessions for booking ID: ${booking.booking_id}`);
        
        
        return sessions;
      });
      
      // Flatten all sessions into a single array
      const allSessions = (await Promise.all(sessionsPromises)).flat();
      
      // Sort sessions by date and time
      const sortedSessions = allSessions.sort((a, b) => {
        if (a.date.getTime() !== b.date.getTime()) {
          return a.date.getTime() - b.date.getTime();
        }
        return a.timeSlot.localeCompare(b.timeSlot);
      });
      
      // Categorize sessions into past, today, and upcoming
      const now = new Date();
      const todayDate = new Date(now);
      todayDate.setHours(0, 0, 0, 0);
      const tomorrow = new Date(todayDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Past sessions (before today)
      const pastSessionsList = sortedSessions.filter(session => session.date < todayDate);
      
      // Today's sessions
      const todaySessionsList = sortedSessions.filter(
        session => session.date >= todayDate && session.date < tomorrow
      );
      
      // Upcoming sessions (after today)
      const upcomingSessionsList = sortedSessions.filter(session => session.date >= tomorrow);
      
      setPastSessions(pastSessionsList);
      setTodaySessions(todaySessionsList);
      setUpcomingSessions(upcomingSessionsList);
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
      toast.error('Failed to load upcoming sessions');
    } finally {
      setLoadingUpcomingSessions(false);
    }
  };

  // Fetch instructor's upcoming sessions
  const fetchInstructorSessions = async () => {
    if (!user) return;
    try {
      setLoadingInstructorSessions(true);
      
      // Step 1: Get all active bookings where this user is the instructor
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, learner_id')
        .eq('instructor_id', user.id)
        .gte('end_date', currentDate)
        .order('start_date', { ascending: true });
        
      if (bookingsError) throw bookingsError;
      
      if (!bookingsData || bookingsData.length === 0) {
        setInstructorSessions([]);
        setLoadingInstructorSessions(false);
        return;
      }
      
      // Step 2: For each booking, get learner details and calculate sessions
      const sessionsPromises = bookingsData.map(async (booking) => {
        // Get learner details
        const { data: learnerData, error: learnerError } = await supabase
          .from('users')
          .select('name, phone')
          .eq('id', booking.learner_id)
          .single();
          
        if (learnerError) throw learnerError;
        
        // Get learner's pickup location from learner_table
        let pickupLocation = 'Not specified';
        
        // Try to get location from learner_table
        const { data: locationData, error: locationError } = await supabase
          .from('learner_table')
          .select('location')
          .eq('learner_id', booking.learner_id)
          .single();
        
        if (!locationError && locationData && locationData.location) {
          pickupLocation = locationData.location;
        }
          
        // Get instructor availability
        const { data: availabilityData, error: availabilityError } = await supabase
          .from('instructor_availability')
          .select('*')
          .eq('instructor_id', user.id)
          .eq('is_active', true);
          
        if (availabilityError) throw availabilityError;
        
        // Calculate upcoming sessions based on booking dates and instructor availability
        const sessions = [];
        
        // Convert booking time_slots from jsonb to array
        const bookingTimeSlots = booking.time_slots || [];
        
        // Create a map of day_of_week -> available time_slots
        const availabilityMap = {};
        availabilityData.forEach(slot => {
          availabilityMap[slot.day_of_week] = slot.time_slots || [];
        });
        
        // Calculate all session dates between start_date and end_date
        const startDate = new Date(booking.start_date);
        const endDate = new Date(booking.end_date);
        
        // Loop through each day between start and end date
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
          
          // Check if instructor is available on this day
          if (availabilityMap[dayOfWeek]) {
            // Find matching time slots between booking and instructor availability
            const matchingTimeSlots = bookingTimeSlots.filter(timeSlot => 
              availabilityMap[dayOfWeek].includes(timeSlot)
            );
            
            // Add a session for each matching time slot
            for (const timeSlot of matchingTimeSlots) {
              sessions.push({
                date: new Date(date),
                timeSlot,
                learnerName: learnerData?.name || 'Unknown',
                learnerContact: learnerData?.phone || 'N/A',
                pickupLocation: pickupLocation
              });
            }
          }
        }
        
        return sessions;
      });
      
      // Flatten all sessions into a single array
      const allSessions = (await Promise.all(sessionsPromises)).flat();
      
      // Sort sessions by date and time
      const sortedSessions = allSessions.sort((a, b) => {
        if (a.date.getTime() !== b.date.getTime()) {
          return a.date.getTime() - b.date.getTime();
        }
        return a.timeSlot.localeCompare(b.timeSlot);
      });
      
      // Categorize sessions into past, today, and upcoming
      const now = new Date();
      const todayDate = new Date(now);
      todayDate.setHours(0, 0, 0, 0);
      const tomorrow = new Date(todayDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Past sessions (before today)
      const pastSessionsList = sortedSessions.filter(session => session.date < todayDate);
      
      // Today's sessions
      const todaySessionsList = sortedSessions.filter(
        session => session.date >= todayDate && session.date < tomorrow
      );
      
      // Upcoming sessions (after today)
      const upcomingSessionsList = sortedSessions.filter(session => session.date >= tomorrow);
      
      setInstructorPastSessions(pastSessionsList);
      setInstructorTodaySessions(todaySessionsList);
      setInstructorUpcomingSessions(upcomingSessionsList);
      setInstructorSessions(sortedSessions); // Set all sessions for use in renderInstructorDashboard
    } catch (error) {
      console.error('Error fetching instructor sessions:', error);
      toast.error('Failed to load upcoming classes');
    } finally {
      setLoadingInstructorSessions(false);
    }
  };

  useEffect(() => {
    if (user) {
      const loadDashboardData = async () => {
        try {
          // Fetch user role
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (userError) throw userError;
          
          setUserRole(userData.role);
          
          // If user is an instructor, fetch their availability and sessions
          if (userData.role === 'instructor') {
            await fetchInstructorAvailability();
            await fetchInstructorSessions();
          } else if (userData.role === 'learner') {
            // If user is a learner, fetch upcoming sessions
            await fetchUpcomingSessions();
          }
        } catch (error) {
          console.error('Error loading dashboard data:', error);
          toast.error('Failed to load dashboard data');
        } finally {
          setLoading(false);
        }
      };
      
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchInstructorAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('instructor_availability')
        .select('*')
        .eq('instructor_id', user.id);
        
      if (error) throw error;
      
      setAvailabilityData(data || []);
      
      // Extract unique days and time slots from active slots
      const activeData = data?.filter(slot => slot.is_active) || [];
      const uniqueDays = [...new Set(activeData.map(slot => slot.day_of_week))];
      
      // Collect all unique time slots from the jsonb arrays
      let allTimeSlots = [];
      activeData.forEach(slot => {
        if (Array.isArray(slot.time_slots)) {
          allTimeSlots = [...allTimeSlots, ...slot.time_slots];
        }
      });
      const uniqueTimeSlots = [...new Set(allTimeSlots)];
      
      setSelectedDays(uniqueDays);
      setSelectedTimeSlots(uniqueTimeSlots);
      
      console.log('Fetched availability data:', data);
    } catch (error) {
      console.error('Error fetching instructor availability:', error);
      toast.error('Failed to load availability data');
    }
  };
  
  const toggleDay = (dayIndex) => {
    setSelectedDays(prev => {
      if (prev.includes(dayIndex)) {
        return prev.filter(day => day !== dayIndex);
      } else {
        return [...prev, dayIndex];
      }
    });
  };
  
  const toggleTimeSlot = (timeSlot) => {
    setSelectedTimeSlots(prev => {
      if (prev.includes(timeSlot)) {
        return prev.filter(slot => slot !== timeSlot);
      } else {
        return [...prev, timeSlot];
      }
    });
  };
  
  const saveAvailability = async () => {
    try {
      setLoading(true);
      
      // First, get all existing slots by day
      const existingSlotsByDay = {};
      availabilityData.forEach(slot => {
        existingSlotsByDay[slot.day_of_week] = slot;
      });
      
      // Create arrays for slots to update and slots to insert
      const updates = [];
      const inserts = [];
      
      // Process all selected days
      selectedDays.forEach(day => {
        if (existingSlotsByDay[day]) {
          // Update existing day entry
          updates.push({
            availability_id: existingSlotsByDay[day].availability_id,
            instructor_id: user.id,
            day_of_week: day,
            time_slots: selectedTimeSlots,
            is_active: true
          });
        } else {
          // Insert new day entry
          inserts.push({
            instructor_id: user.id,
            day_of_week: day,
            time_slots: selectedTimeSlots,
            is_active: true
          });
        }
      });
      
      // For days that were previously selected but now unselected,
      // either update them to inactive or remove their time slots
      Object.keys(existingSlotsByDay).forEach(dayStr => {
        const day = parseInt(dayStr, 10);
        if (!selectedDays.includes(day) && existingSlotsByDay[day].is_active) {
          updates.push({
            availability_id: existingSlotsByDay[day].availability_id,
            is_active: false
          });
        }
      });
      
      // Perform updates
      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from('instructor_availability')
          .upsert(updates);
          
        if (updateError) throw updateError;
      }
      
      // Perform inserts
      if (inserts.length > 0) {
        const { error: insertError } = await supabase
          .from('instructor_availability')
          .insert(inserts);
          
        if (insertError) throw insertError;
      }
      
      toast.success('Availability updated successfully');
      setEditingAvailability(false);
      await fetchInstructorAvailability(); // Refresh data
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Failed to update availability');
    } finally {
      setLoading(false);
    }
  };



  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to log out');
    }
  };

  if (loading) {
    return <Loader />;
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your dashboard.
          </p>
          <Link to="/signin" className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors inline-block">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }



  // Pagination component
  const Pagination = ({ currentPage, setCurrentPage, totalItems, itemsPerPage }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center items-center mt-4 space-x-2">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary-100 text-primary-700 hover:bg-primary-200'}`}
        >
          &lt;
        </button>
        
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary-100 text-primary-700 hover:bg-primary-200'}`}
        >
          &gt;
        </button>
      </div>
    );
  };

  // Helper function to render session tables/cards for learner view
  const renderSessionTable = (sessions, emptyMessage, isPastOrUpcoming = false, currentPage = 1, setCurrentPage = null) => {
    if (sessions.length === 0) {
      return (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      );
    }
    
    // Apply pagination if this is past or upcoming sessions
    let displaySessions = sessions;
    if (isPastOrUpcoming) {
      const tableStart = (currentPage - 1) * tableItemsPerPage;
      const cardStart = (currentPage - 1) * cardItemsPerPage;
      const tableEnd = tableStart + tableItemsPerPage;
      const cardEnd = cardStart + cardItemsPerPage;
      
      // We'll use different pagination for desktop and mobile views
      const tableDisplaySessions = sessions.slice(tableStart, tableEnd);
      const cardDisplaySessions = sessions.slice(cardStart, cardEnd);
      
      return (
        <>
          {/* Desktop view - Table with pagination */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Slot
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instructor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pickup Location
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableDisplaySessions.map((session, index) => (
                    <tr 
                      key={index} 
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {session.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {session.timeSlot}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {session.instructorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {session.instructorContact}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(session.pickupLocation)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 hover:underline flex items-center"
                        >
                          <span className="truncate max-w-xs block">{session.pickupLocation.substring(0, 20)}...</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Table pagination */}
            <Pagination 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
              totalItems={sessions.length} 
              itemsPerPage={tableItemsPerPage} 
            />
          </div>

          {/* Mobile view - Cards with pagination */}
          <div className="md:hidden">
            <div className="grid grid-cols-1 gap-4">
              {cardDisplaySessions.map((session, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-primary-500">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-bold text-gray-900">
                      {session.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm font-medium">
                      {session.timeSlot}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-gray-500 w-24">Instructor:</span>
                      <span className="font-medium">{session.instructorName}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-gray-500 w-24">Contact:</span>
                      <span>{session.instructorContact}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <span className="text-gray-500 w-24">Pickup:</span>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(session.pickupLocation)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-800 hover:underline flex items-center"
                      >
                        <span className="truncate max-w-xs block">{session.pickupLocation.substring(0, 20)}...</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Card pagination */}
            <Pagination 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
              totalItems={sessions.length} 
              itemsPerPage={cardItemsPerPage} 
            />
          </div>
        </>
      );
    }
    
    // For Today's sessions, no pagination needed
    return (
      <>
        {/* Desktop view - Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Slot
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pickup Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session, index) => (
                <tr 
                  key={index} 
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {session.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.timeSlot}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.instructorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.instructorContact}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(session.pickupLocation)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800 hover:underline flex items-center"
                    >
                      <span className="truncate max-w-xs block">{session.pickupLocation.substring(0, 20)}...</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile view - Cards */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {sessions.map((session, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-primary-500">
              <div className="flex justify-between items-start mb-3">
                <div className="font-bold text-gray-900">
                  {session.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
                <div className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm font-medium">
                  {session.timeSlot}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-gray-500 w-24">Instructor:</span>
                  <span className="font-medium">{session.instructorName}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-gray-500 w-24">Contact:</span>
                  <span>{session.instructorContact}</span>
                </div>
                
                <div className="flex items-start">
                  <span className="text-gray-500 w-24">Pickup:</span>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(session.pickupLocation)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-800 hover:underline flex items-center"
                  >
                    <span className="truncate max-w-xs block">{session.pickupLocation.substring(0, 20)}...</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderLearnerDashboard = () => (
    <div className="space-y-8">
      {loadingUpcomingSessions ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (pastSessions.length === 0 && todaySessions.length === 0 && upcomingSessions.length === 0) ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-4">No lessons scheduled</p>
            <Link to="/booking" className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors inline-block">
              Book Your First Lesson
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Today's Lessons */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-6">
              <Clock className="w-6 h-6 text-primary-600 mr-2" />
              <h3 className="text-xl font-bold text-gray-800">
                Today's Lessons
              </h3>
            </div>
            {renderSessionTable(todaySessions, "No lessons scheduled for today.")}  
          </div>

          {/* Upcoming Lessons */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-6">
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-xl font-bold text-gray-800">
                Upcoming Lessons
              </h3>
            </div>
            {renderSessionTable(
              upcomingSessions, 
              "No upcoming lessons scheduled.",
              true,
              currentUpcomingPage,
              setCurrentUpcomingPage
            )}  
          </div>

          {/* Past Lessons */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-6">
              <AlertCircle className="w-6 h-6 text-gray-600 mr-2" />
              <h3 className="text-xl font-bold text-gray-800">
                Past Lessons
              </h3>
            </div>
            {renderSessionTable(
              pastSessions, 
              "No past lessons found.",
              true,
              currentPastPage,
              setCurrentPastPage
            )}  
          </div>
        </>
      )}
    </div>
  );

  // Helper function to render session tables/cards for instructor view
  const renderInstructorSessionTable = (sessions, emptyMessage, isPastOrUpcoming = false, currentPage = 1, setCurrentPage = null) => {
    if (sessions.length === 0) {
      return (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      );
    }
    
    // Apply pagination if this is past or upcoming sessions
    if (isPastOrUpcoming) {
      const tableStart = (currentPage - 1) * tableItemsPerPage;
      const cardStart = (currentPage - 1) * cardItemsPerPage;
      const tableEnd = tableStart + tableItemsPerPage;
      const cardEnd = cardStart + cardItemsPerPage;
      
      // We'll use different pagination for desktop and mobile views
      const tableDisplaySessions = sessions.slice(tableStart, tableEnd);
      const cardDisplaySessions = sessions.slice(cardStart, cardEnd);
      
      return (
        <>
          {/* Desktop view - Table with pagination */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Slot
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Learner
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pickup Location
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableDisplaySessions.map((session, index) => (
                    <tr 
                      key={index} 
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {session.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {session.timeSlot}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {session.learnerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {session.learnerContact}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(session.pickupLocation)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 hover:underline flex items-center"
                        >
                          <span className="truncate max-w-xs block">{session.pickupLocation.substring(0, 20)}...</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Table pagination */}
            <Pagination 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
              totalItems={sessions.length} 
              itemsPerPage={tableItemsPerPage} 
            />
          </div>

          {/* Mobile view - Cards with pagination */}
          <div className="md:hidden">
            <div className="grid grid-cols-1 gap-4">
              {cardDisplaySessions.map((session, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-primary-500">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-bold text-gray-900">
                      {session.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm font-medium">
                      {session.timeSlot}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-gray-500 w-24">Learner:</span>
                      <span className="font-medium">{session.learnerName}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-gray-500 w-24">Contact:</span>
                      <span>{session.learnerContact}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <span className="text-gray-500 w-24">Pickup:</span>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(session.pickupLocation)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-800 hover:underline flex items-center"
                      >
                        <span className="truncate max-w-xs block">{session.pickupLocation.substring(0, 20)}...</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Card pagination */}
            <Pagination 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
              totalItems={sessions.length} 
              itemsPerPage={cardItemsPerPage} 
            />
          </div>
        </>
      );
    }
    
    // For Today's sessions, no pagination needed
    return (
      <>
        {/* Desktop view - Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Slot
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Learner
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pickup Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session, index) => (
                <tr 
                  key={index} 
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {session.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.timeSlot}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.learnerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.learnerContact}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(session.pickupLocation)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800 hover:underline flex items-center"
                    >
                      <span className="truncate max-w-xs block">{session.pickupLocation.substring(0, 20)}...</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile view - Cards */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {sessions.map((session, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-primary-500">
              <div className="flex justify-between items-start mb-3">
                <div className="font-bold text-gray-900">
                  {session.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
                <div className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm font-medium">
                  {session.timeSlot}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-gray-500 w-24">Learner:</span>
                  <span className="font-medium">{session.learnerName}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-gray-500 w-24">Contact:</span>
                  <span>{session.learnerContact}</span>
                </div>
                
                <div className="flex items-start">
                  <span className="text-gray-500 w-24">Pickup:</span>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(session.pickupLocation)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-800 hover:underline flex items-center"
                  >
                    <span className="truncate max-w-xs block">{session.pickupLocation.substring(0, 20)}...</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  // Render the instructor dashboard with pagination for past and upcoming sessions
  const renderInstructorDashboard = () => {
    // Create today's date for filtering sessions
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    return (
      <div className="space-y-4">
        {/* Quick Actions */}
        <div className="flex justify-between items-end">
          <h2 className="text-xl lg:text-3xl font-bold text-gray-800 ">
          Weekly Availability
          </h2>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => editingAvailability ? saveAvailability() : setEditingAvailability(true)}
              className={`${editingAvailability ? 'bg-green-600 hover:bg-green-700' : 'bg-primary-600 hover:bg-primary-700'} text-white lg:px-4 px-2 py-2 text-[12px] font-semibold lg:text-lg rounded-md transition-colors inline-flex items-center`}
            >
              {editingAvailability ? (
                <>
                  <Save className="lg:w-5 lg:h-5 w-4 h-4 mr-2" />
                  Save Availability
                </>
              ) : (
                <>
                  <Edit className="lg:w-5 lg:h-5 w-4 h-4 mr-2" />
                  Edit Availability
                </>
              )}
            </button>
          </div>
        </div>

      {/* Availability Grid */}
      <div className="">
        <div className="flex flex-col gap-6">
          {editingAvailability ? (
            <>
              {/* Days selection - Edit Mode */}
              <div className="w-full">
                <h4 className="font-bold text-gray-700 mb-3">Select Days</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { index: 0, name: 'Sunday' },
                    { index: 1, name: 'Monday' },
                    { index: 2, name: 'Tuesday' },
                    { index: 3, name: 'Wednesday' },
                    { index: 4, name: 'Thursday' },
                    { index: 5, name: 'Friday' },
                    { index: 6, name: 'Saturday' }
                  ].map(day => (
                    <button
                      key={day.index}
                      onClick={() => toggleDay(day.index)}
                      className={`px-4 py-2 rounded-md ${selectedDays.includes(day.index) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'} transition-colors`}
                    >
                      {day.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Time slots selection - Edit Mode */}
              <div className="w-full">
                <h4 className="font-extrabold text-lg lg:text-xl text-gray-700 mb-">Select Time Slots</h4>
                <div className="grid grid-cols-3 md:grid-cols-3 gap-0 lg:gap-4">
                  {/* Morning slots */}
                  <div className="bg-gray-50 lg:p-4 p-2 rounded-lg">
                    <h5 className="font-semibold text-gray-700 mb-3 text-center">Morning</h5>
                    <div className="grid grid-cols-1 gap-2">
                      {['6AM-7AM', '7AM-8AM', '8AM-9AM', '9AM-10AM', '10AM-11AM'].map(timeSlot => {
                        const isSelected = selectedTimeSlots.includes(timeSlot);
                        return (
                          <button
                            key={timeSlot}
                            onClick={() => toggleTimeSlot(timeSlot)}
                            className={`px-3 py-2 rounded-md text-sm ${isSelected ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'} transition-colors`}
                          >
                            {timeSlot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Afternoon slots */}
                  <div className="bg-gray-50 lg:p-4 p-2 rounded-lg">
                    <h5 className="font-semibold text-gray-700 mb-3 text-center">Afternoon</h5>
                    <div className="grid grid-cols-1 gap-2">
                      {['11AM-12PM', '12PM-1PM', '1PM-2PM', '2PM-3PM', '3PM-4PM'].map(timeSlot => {
                        const isSelected = selectedTimeSlots.includes(timeSlot);
                        return (
                          <button
                            key={timeSlot}
                            onClick={() => toggleTimeSlot(timeSlot)}
                            className={`px-3 py-2 rounded-md text-sm ${isSelected ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'} transition-colors`}
                          >
                            {timeSlot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Evening slots */}
                  <div className="bg-gray-50 lg:p-4 p-2 rounded-lg">
                    <h5 className="font-semibold text-gray-700 mb-3 text-center">Evening</h5>
                    <div className="grid grid-cols-1 gap-2">
                      {['4PM-5PM', '5PM-6PM', '6PM-7PM', '7PM-8PM', '8PM-9PM'].map(timeSlot => {
                        const isSelected = selectedTimeSlots.includes(timeSlot);
                        return (
                          <button
                            key={timeSlot}
                            onClick={() => toggleTimeSlot(timeSlot)}
                            className={`px-3 py-2 rounded-md text-sm ${isSelected ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'} transition-colors`}
                          >
                            {timeSlot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* View Mode - Display current availability */}
              <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Days with availability */}
                  <div className="bg-gray-100 p-4 rounded-lg shadow-lg">
                    <h5 className="font-semibold text-slate-700 text-xl mb-3">Available Days</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedDays.length > 0 ? (
                        selectedDays.map(dayIndex => (
                          <span key={dayIndex} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm lg:text-base">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex]}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No days selected</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Time slots */}
                  <div className="bg-gray-100 p-4 rounded-lg shadow-lg">
                    <h5 className="font-semibold text-gray-700 mb-3">Available Time Slots</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedTimeSlots.length > 0 ? (
                        selectedTimeSlots.map(timeSlot => (
                          <span key={timeSlot} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm lg:text-base">
                            {timeSlot}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No time slots selected</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                  <p className="text-red-500">
                    <span className="font-medium">Note:</span> Your availability is set for all selected time slots on all selected days.
                    Click "Edit Availability" to make changes.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Instructor Session Tables */}
      <div className="space-y-8">
        {/* Today's Sessions */}
        <div>
          <h2 className="text-xl font-bold mb-4">Today's Sessions</h2>
          {loadingInstructorSessions ? (
            <Loader />
          ) : (
            renderInstructorSessionTable(
              instructorSessions.filter(session => {
                const sessionDate = new Date(session.date);
                return (
                  sessionDate.toDateString() === todayDate.toDateString()
                );
              }),
              "No sessions scheduled for today."
            )
          )}
        </div>
        
        {/* Upcoming Sessions with Pagination */}
        <div>
          <h2 className="text-xl font-bold mb-4">Upcoming Sessions</h2>
          {loadingInstructorSessions ? (
            <Loader />
          ) : (
            renderInstructorSessionTable(
              instructorSessions.filter(session => {
                const sessionDate = new Date(session.date);
                return (
                  sessionDate > todayDate && 
                  sessionDate.toDateString() !== todayDate.toDateString()
                );
              }),
              "No upcoming sessions scheduled.",
              true,
              currentInstructorUpcomingPage,
              setCurrentInstructorUpcomingPage
            )
          )}
        </div>
        
        {/* Past Sessions with Pagination */}
        <div>
          <h2 className="text-xl font-bold mb-4">Past Sessions</h2>
          {loadingInstructorSessions ? (
            <Loader />
          ) : (
            renderInstructorSessionTable(
              instructorSessions.filter(session => {
                const sessionDate = new Date(session.date);
                return sessionDate < todayDate;
              }),
              "No past sessions found.",
              true,
              currentInstructorPastPage,
              setCurrentInstructorPastPage
            )
          )}
        </div>



      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          Teaching Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            {/* <div className="text-3xl font-bold text-blue-600 mb-2">{lessons.length}</div> */}
            <div className="text-gray-600">Upcoming Classes</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            {/* <div className="text-3xl font-bold text-green-600 mb-2">{achievements.length}</div> */}
            <div className="text-gray-600">Student Achievements</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">4.9</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
        </div>
      </div>
      </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:py-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4 mt-0 sm:mt-0">
            <p className="text-gray-600 mt-1">
                Welcome back, <span className="font-semibold text-primary-600 text-lg capitalize">{user?.user_metadata?.name}</span>!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {userRole === 'instructor' ? renderInstructorDashboard() : renderLearnerDashboard()}
      </div>
    </div>
  );
}

export default Dashboard;
