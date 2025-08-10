import React, { useState, useEffect } from 'react';
import { supabaseAdmin } from '../utils/supabaseAdmin';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);

  // Check if admin is already authenticated
  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = sessionStorage.getItem('adminAuth');
      if (adminAuth) {
        const { expiry } = JSON.parse(adminAuth);
        if (expiry > Date.now()) {
          setIsAuthenticated(true);
          fetchData(activeTab);
        } else {
          sessionStorage.removeItem('adminAuth');
        }
      }

      // Check if account is locked
      const lockData = localStorage.getItem('adminLockout');
      if (lockData) {
        const { until } = JSON.parse(lockData);
        if (until > Date.now()) {
          setIsLocked(true);
          setLockoutTime(until);
          const interval = setInterval(() => {
            if (Date.now() > until) {
              setIsLocked(false);
              localStorage.removeItem('adminLockout');
              clearInterval(interval);
            }
          }, 1000);
          return () => clearInterval(interval);
        } else {
          localStorage.removeItem('adminLockout');
        }
      }
    };

    checkAuth();
  }, [activeTab]);

  // Handle admin login
  const handleLogin = (e) => {
    e.preventDefault();
    
    if (isLocked) return;

    if (password === 'admin123') {
      // Set session storage with 2-hour expiry
      const expiry = Date.now() + (2 * 60 * 60 * 1000); // 2 hours
      sessionStorage.setItem('adminAuth', JSON.stringify({ expiry }));
      setIsAuthenticated(true);
      setLoginAttempts(0);
      fetchData(activeTab);
    } else {
      const attempts = loginAttempts + 1;
      setLoginAttempts(attempts);
      setLoginError('Invalid password');
      
      // Lock out after 5 failed attempts
      if (attempts >= 5) {
        const lockoutUntil = Date.now() + (15 * 60 * 1000); // 15 minutes
        localStorage.setItem('adminLockout', JSON.stringify({ until: lockoutUntil }));
        setIsLocked(true);
        setLockoutTime(lockoutUntil);
      }
    }
  };

  // Fetch data based on active tab
  const fetchData = async (tableName) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching data from ${tableName} table...`);
      const { data, error } = await supabaseAdmin
        .from(tableName)
        .select('*');
      
      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        throw error;
      }
      
      console.log(`Successfully fetched ${data.length} records from ${tableName}`);
      setData(data);
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(`Failed to fetch data: ${err.message}`);
      
      // Fallback to mock data if fetch fails
      setData(getMockData(tableName));
    } finally {
      setLoading(false);
    }
  };

  // Mock data for fallback
  const getMockData = (tableName) => {
    console.log(`Using mock data for ${tableName}`);
    const mockData = {
      users: [{ id: 'mock-id', name: 'Mock User', email: 'mock@example.com', role: 'learner' }],
      bookings: [{ booking_id: 'mock-id', learner_id: 'mock-user', start_date: '2025-08-10' }],
      blocked_slots: [{ block_id: 'mock-id', instructor_id: 'mock-instructor', start_date: '2025-08-10' }],
      instructor_availability: [{ availability_id: 'mock-id', instructor_id: 'mock-instructor', day_of_week: 1 }],
      instructor_table: [{ instructor_id: 'mock-id', vehicle_name: 'Mock Car' }],
      learner_table: [{ learner_id: 'mock-id', location: 'Mock Location' }]
    };
    
    return mockData[tableName] || [];
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchData(tab);
  };

  // Update instructor status
  const updateInstructorStatus = async (instructorId, newStatus) => {
    try {
      const { error } = await supabaseAdmin
        .from('instructor_table')
        .update({ status: newStatus })
        .eq('instructor_id', instructorId);
      
      if (error) throw error;
      
      // Update the data in the UI
      setData(prevData => 
        prevData.map(row => 
          row.instructor_id === instructorId ? { ...row, status: newStatus } : row
        )
      );
      
      toast.success(`Instructor status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating instructor status:', error);
      toast.error('Failed to update instructor status');
    }
  };

  // Format JSON fields for display
  const formatJsonField = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  // Render table columns based on data
  const renderTableColumns = () => {
    if (data.length === 0) return null;
    
    return Object.keys(data[0]).map((key) => {
      // Format column header text for better readability
      const formattedHeader = key
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Determine if this is a primary key or important column
      const isPrimaryKey = key.includes('_id') || key === 'id';
      const isImportant = ['name', 'email', 'phone', 'status', 'date'].some(term => key.includes(term));
      
      return (
        <th 
          key={key} 
          className={`px-4 py-3 text-left text-xs font-medium tracking-wider ${isPrimaryKey 
            ? 'bg-primary-50 text-black' 
            : isImportant 
              ? 'bg-gray-100 text-black' 
              : 'bg-gray-50 text-black'}`}
        >
          <div className="flex items-center">
            {isPrimaryKey && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary-900" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            )}
            {formattedHeader}
          </div>
        </th>
      );
    });
  };

  // Render table rows based on data
  const renderTableRows = () => {
    return data.map((row, rowIndex) => (
      <tr key={rowIndex} className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-primary-50 transition-colors duration-150`}>
        {Object.entries(row).map(([key, value], colIndex) => {
          // Check if this is an image column that should be displayed as an image
          const imageColumns = [
            { tab: 'users', column: 'profile_img', label: 'Profile' },
            { tab: 'instructor_table', column: 'aadhar_img', label: 'Aadhar' },
            { tab: 'instructor_table', column: 'license_img', label: 'License' },
            { tab: 'instructor_table', column: 'vehicle_img', label: 'Vehicle' }
          ];
          
          const imageColumn = imageColumns.find(img => img.tab === activeTab && img.column === key);
          const isImageColumn = imageColumn && value;
          
          // Check if this is a special column type
          const isPrimaryKey = key.includes('_id') || key === 'id';
          const isStatus = key.includes('status');
          const isDate = key.includes('date') || key.includes('created_at') || key.includes('updated_at');
          const isEmail = key.includes('email');
          const isPhone = key.includes('phone') || key.includes('mobile');
          
          // Format special column types
          let displayValue = value;
          let specialClass = '';
          
          if (isStatus && typeof value === 'string') {
            const statusMap = {
              active: 'bg-green-100 text-black',
              inactive: 'bg-gray-100 text-black',
              pending: 'bg-yellow-100 text-black',
              verified: 'bg-green-100 text-black',
              completed: 'bg-primary-100 text-black',
              cancelled: 'bg-red-100 text-black',
            };
            const status = value.toLowerCase();
            
            // Special handling for instructor_table status column to make it toggleable
            if (activeTab === 'instructor_table' && key === 'status') {
              const instructorId = row.instructor_id;
              const currentStatus = value.toLowerCase();
              const newStatus = currentStatus === 'verified' ? 'pending' : 'verified';
              
              displayValue = (
                <button
                  onClick={() => updateInstructorStatus(instructorId, newStatus)}
                  className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[status] || 'bg-gray-100 text-black'} hover:opacity-80 transition-opacity cursor-pointer`}
                  title={`Click to change status to ${newStatus}`}
                >
                  {value}
                  <span className="ml-1 text-xs opacity-70">↺</span>
                </button>
              );
            } else if (statusMap[status]) {
              displayValue = (
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[status]}`}>
                  {value}
                </span>
              );
            }
          } else if (isDate && value) {
            try {
              const date = new Date(value);
              if (!isNaN(date)) {
                displayValue = (
                  <div className="text-sm text-black">
                    <div>{date.toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{date.toLocaleTimeString()}</div>
                  </div>
                );
              }
            } catch (e) {
              // Keep original value if date parsing fails
            }
          } else if (isPrimaryKey) {
            specialClass = 'font-mono text-xs text-primary-900 bg-primary-50 px-1 py-0.5 rounded';
          } else if (isEmail && typeof value === 'string') {
            displayValue = (
              <a href={`mailto:${value}`} className="text-black hover:text-black hover:underline">
                {value}
              </a>
            );
          } else if (isPhone && typeof value === 'string') {
            displayValue = (
              <a href={`tel:${value}`} className="text-black hover:text-black hover:underline">
                {value}
              </a>
            );
          }
          
          return (
            <td key={colIndex} className="px-4 py-3 whitespace-nowrap text-sm">
              <div className="max-h-40 overflow-y-auto">
                {isImageColumn ? (
                  <div className="flex flex-col items-center">
                    <img 
                      src={value} 
                      alt={imageColumn.label}
                      className={`w-16 h-16 object-cover ${imageColumn.column === 'profile_img' ? 'rounded-full' : 'rounded'} border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/50?text=N/A';
                      }}
                    />
                    <a 
                      href={value} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary-500 hover:underline mt-1 truncate max-w-xs flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                      View {imageColumn.label}
                    </a>
                  </div>
                ) : typeof value === 'object' ? (
                  <pre className="text-xs bg-gray-50 p-2 rounded whitespace-pre-wrap overflow-x-auto">{formatJsonField(value)}</pre>
                ) : (
                  <span className={specialClass}>{displayValue || formatJsonField(value)}</span>
                )}
              </div>
            </td>
          );
        })}
      </tr>
    ));
  };

  // Render login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center text-black mb-6">Admin Login</h1>
          
          {isLocked ? (
            <div className="text-center text-red-600 mb-4">
              <p>Too many failed attempts. Account locked for 15 minutes.</p>
              <p>Try again at {new Date(lockoutTime).toLocaleTimeString()}</p>
            </div>
          ) : (
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-black text-sm font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              
              {loginError && (
                <p className="text-red-500 text-xs italic mb-4">{loginError}</p>
              )}
              
              <div className="flex items-center justify-center">
                <button
                  type="submit"
                  className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Drivigo Admin Panel</h1>
        <button
          onClick={() => {
            sessionStorage.removeItem('adminAuth');
            setIsAuthenticated(false);
          }}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>

      {/* Database Tables Navigation */}
      <div className="mb-6 overflow-x-auto bg-white shadow-md rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'users', label: 'Users' },
            { id: 'bookings', label: 'Bookings' },
            { id: 'blocked_slots', label: 'Blocked Slots' },
            { id: 'instructor_availability', label: 'Instructor Availability' },
            { id: 'instructor_table', label: 'Instructor Details' },
            { id: 'learner_table', label: 'Learner Details' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center ${activeTab === tab.id 
                ? 'bg-primary-500 text-white shadow-md' 
                : 'bg-gray-100 text-black hover:bg-gray-200'}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.id === 'users' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              )}
              {tab.id === 'bookings' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              )}
              {tab.id === 'blocked_slots' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                </svg>
              )}
              {tab.id === 'instructor_availability' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              )}
              {tab.id === 'instructor_table' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              )}
              {tab.id === 'learner_table' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              )}
              {tab.label}
              <span className="ml-1.5 bg-gray-200 text-black text-xs font-semibold px-2 py-0.5 rounded-full">
                {tab.id === activeTab && data.length > 0 ? data.length : ''}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary-50 to-gray-50 border-b">
          <h2 className="text-xl font-semibold text-black flex items-center">
            {activeTab === 'users' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            )}
            {activeTab === 'instructor_table' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            )}
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/_/g, ' ')}
            {!loading && data.length > 0 && (
              <span className="ml-2 bg-primary-100 text-black text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {data.length}
              </span>
            )}
          </h2>
          
          {!loading && data.length > 0 && (
            <div className="flex items-center space-x-2">
              <button className="text-black hover:text-primary-500 transition-colors p-1" title="Refresh data">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="text-black hover:text-primary-500 transition-colors p-1" title="Export data">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
            <p className="mt-3 text-black font-medium">Loading data...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border-l-4 border-red-500">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-black">{error}</p>
                <p className="text-sm text-red-600 mt-1">Showing mock data as fallback</p>
              </div>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
            </svg>
            <p className="text-gray-500 font-medium">No data found in this table</p>
            <p className="text-sm text-gray-400 mt-1">Data will appear here once available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {renderTableColumns()}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {renderTableRows()}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;