import { useState, useEffect, useRef } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { supabase } from "../utils/supabaseClient";
import { toast } from "react-hot-toast";
import { User, Car, MapPin, FileText, X, Navigation, Search } from "lucide-react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

// Define libraries array outside component to prevent recreation on each render
const libraries = ["places"];

export default function Instructor_Details({ instructorId, onStatusChange }) {
  const [aadharFile, setAadharFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [vehicleFile, setVehicleFile] = useState(null);
  const [status, setStatus] = useState('pending');

  const [aadharPreview, setAadharPreview] = useState("");
  const [licensePreview, setLicensePreview] = useState("");
  const [vehiclePreview, setVehiclePreview] = useState("");

  const [vehicleName, setVehicleName] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationCoords, setLocationCoords] = useState({ lat: 28.6333, lng: 77.2167 }); // Default to Delhi
  const searchInputRef = useRef(null);
  
  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });
  
  // State to track if data exists and if dialog is open
  const [hasData, setHasData] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch existing details from table automatically when component mounts
  useEffect(() => {
    if (instructorId) {
      fetchInstructorDetails();
    }
  }, [instructorId]);
  
  // Initialize Places Autocomplete when dialog opens
  useEffect(() => {
    if (isLoaded && dialogOpen && searchInputRef.current) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        initPlacesAutocomplete();
      }, 100);
    }
  }, [isLoaded, dialogOpen]);

  const fetchInstructorDetails = async () => {
    try {
      console.log('Fetching instructor details for ID:', instructorId);
      setLoading(true);
      
      // Fetch the instructor details
      const { data, error } = await supabase
        .from('instructor_table')
        .select('*')
        .eq('instructor_id', instructorId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors
        
      console.log('Fetch result:', { data, error });
      
      if (error && error.code !== '42P01') { // Ignore table not found error
        console.error('Error fetching instructor details:', error);
        throw error;
      }

      if (data && 
          (data.aadhar_img || data.license_img || data.vehicle_img || 
           data.vehicle_name || data.vehicle_no || data.d_school_location)) {
        // Data exists
        console.log('Found existing instructor data:', data);
        setVehicleName(data.vehicle_name || "");
        setVehicleNo(data.vehicle_no || "");
        setLocation(data.d_school_location || "");
        setAadharPreview(data.aadhar_img || "");
        setLicensePreview(data.license_img || "");
        setVehiclePreview(data.vehicle_img || "");
        setStatus(data.status || "pending");
        
        // Notify parent component about status change
        if (onStatusChange && typeof onStatusChange === 'function') {
          onStatusChange(data.status || "pending");
        }
        
        // Set location coordinates if available in the database
        if (data.latitude && data.longitude) {
          setLocationCoords({
            lat: data.latitude,
            lng: data.longitude
          });
        }
        
        setHasData(true);
        setDialogOpen(false); // Close dialog if it was open
      } else {
        // No data exists or empty data
        console.log('No existing data found for this instructor');
        setHasData(false);
        setDialogOpen(true); // Automatically open dialog to fill data
      }
    } catch (err) {
      console.error('Error in fetchInstructorDetails:', err);
      toast.error("Error loading instructor details");
      setHasData(false);
      setDialogOpen(true); // Open dialog on error as well
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      console.log('Starting upload process...');
      
      // Check if instructorId is null or undefined
      if (!instructorId) {
        console.error('Instructor ID is null or undefined');
        toast.error('Missing instructor ID. Please try again.');
        setLoading(false);
        return;
      }
      
      console.log('Instructor ID:', instructorId);
      setLoading(true);

      const uploadFile = async (folder, file) => {
        if (!file) {
          console.log(`No new ${folder} file to upload, using existing URL`);
          return null;
        }
        
        // Generate a safe filename to avoid special character issues
        const timestamp = new Date().getTime();
        const safeFileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        
        console.log(`Uploading ${folder} file:`, safeFileName);
        const filePath = `Instructors_Details/${instructorId}/${folder}/${safeFileName}`;
        
        try {
          const { error } = await supabase.storage
            .from("drivigo-web-data")
            .upload(filePath, file, { upsert: true });
            
          if (error) {
            console.error(`Error uploading ${folder}:`, error);
            throw error;
          }
          
          console.log(`Successfully uploaded ${folder}`);
          const { data: publicUrlData } = supabase.storage
            .from("drivigo-web-data")
            .getPublicUrl(filePath);
            
          console.log(`Public URL for ${folder}:`, publicUrlData.publicUrl);
          return publicUrlData.publicUrl;
        } catch (uploadError) {
          console.error(`Failed to upload ${folder}:`, uploadError);
          throw uploadError;
        }
      };

      // Process each file upload and log results
      console.log('Processing aadhar file...');
      const aadharUrl = await uploadFile("aadhar_img", aadharFile) || aadharPreview;
      console.log('Final aadhar URL:', aadharUrl);
      
      console.log('Processing license file...');
      const licenseUrl = await uploadFile("license_img", licenseFile) || licensePreview;
      console.log('Final license URL:', licenseUrl);
      
      console.log('Processing vehicle file...');
      const vehicleUrl = await uploadFile("vehicle_img", vehicleFile) || vehiclePreview;
      console.log('Final vehicle URL:', vehicleUrl);

      console.log('Preparing to update database with:', {
        instructor_id: instructorId,
        vehicle_name: vehicleName,
        vehicle_no: vehicleNo,
        location: location
      });
      
      // Now perform the upsert
      console.log('Performing upsert operation...');
      const { data: upsertData, error: insertError } = await supabase
        .from('instructor_table')
        .upsert(
          {
            instructor_id: instructorId,
            aadhar_img: aadharUrl,
            license_img: licenseUrl,
            vehicle_img: vehicleUrl,
            vehicle_name: vehicleName,
            vehicle_no: vehicleNo,
            d_school_location: location,
            latitude: locationCoords.lat,
            longitude: locationCoords.lng,
            status: status,
          },
          { onConflict: 'instructor_id', returning: true }
        );
      
      if (insertError) {
        console.error('Database upsert error:', insertError);
        throw insertError;
      }
      
      console.log('Database update successful:', upsertData);
      toast.success("Instructor details saved successfully!");
      
      // Update state to reflect that we now have data
      setHasData(true);
      setDialogOpen(false);
      
      // Update preview URLs with the new URLs
      setAadharPreview(aadharUrl);
      setLicensePreview(licenseUrl);
      setVehiclePreview(vehicleUrl);
      
      setLoading(false);
    } catch (err) {
      console.error('Error in handleUpload:', err);
      toast.error(err.message || "Error saving details");
      setLoading(false);
    }
  };

  // Function to open dialog for editing
  const openEditDialog = () => {
    setDialogOpen(true);
  };

  // Function to close dialog
  const closeDialog = () => {
    setDialogOpen(false);
    setShowLocationSearch(false);
  };
  
  // Function to get address from coordinates using Google Maps Geocoding API
  const getAddressFromCoordinates = async (lat, lng) => {
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
  };

  // Function to get user's current location
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        setLocationCoords(newLocation);
        
        // Get address from coordinates
        const address = await getAddressFromCoordinates(latitude, longitude);
        setLocation(address);
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Could not get your current location");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };
  
  // Initialize Places Autocomplete directly on the input field
  const initPlacesAutocomplete = () => {
    if (!isLoaded || !searchInputRef.current || !window.google) {
      console.log('Google Maps not loaded or input ref not available');
      return;
    }
    
    try {
      // Create new autocomplete instance with specific options
      const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
        fields: ["formatted_address", "geometry", "name"],
        types: ["establishment", "geocode"],
        componentRestrictions: { country: "in" } // Restrict to India for better results
      });
      
      // Focus the input to ensure dropdown appears
      searchInputRef.current.focus();
      
      // Add place_changed listener
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          console.log('No place geometry available');
          return;
        }
        
        console.log('Place selected:', place.formatted_address);
        
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        setLocationCoords(newLocation);
        setLocation(place.formatted_address);
      });
      
      console.log('Places Autocomplete initialized successfully');
    } catch (error) {
      console.error('Error initializing Places Autocomplete:', error);
    }
  };

  // Render the instructor details display when data exists
  const renderInstructorDetails = () => {
    return (
      <div className="bg-white rounded-lg lg:shadow-md overflow-hidden">
        <div className="lg:p-4 p-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-extrabold text-gray-800">Instructor Details</h2>
            <button
              onClick={openEditDialog}
              className="px-4 py-2 bg-primary-600 text-xs lg:text-base font-semibold text-white rounded-md hover:bg-primary-700 flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" /> Edit Details
            </button>
          </div>

          <div className=" gap-6">
            <div>
              <h3 className="text-lg font-bold text-gradient mb-4">Vehicle Information</h3>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 lg:gap-6 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Vehicle Name</p>
                  <p className="text-base font-medium flex items-center">
                    <Car className="w-4 h-4 mr-2 text-primary-600" />
                    {vehicleName || 'Not specified'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Vehicle Number</p>
                  <p className="text-base font-medium">{vehicleNo || 'Not specified'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Driving School Location</p>
                  <p className="text-base font-medium flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-primary-600" />
                    {location || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gradient mt-6 mb-1">Documents</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {aadharPreview ? (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Aadhar Card</p>
                    <img 
                      src={aadharPreview} 
                      alt="Aadhar Card" 
                      className="h-48 w-auto object-cover rounded-md border border-gray-200"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No Aadhar Card uploaded</p>
                )}
                
                {licensePreview ? (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Driving License</p>
                    <img 
                      src={licensePreview} 
                      alt="Driving License" 
                      className="h-48 w-auto object-cover rounded-md border border-gray-200"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No License uploaded</p>
                )}
                
                {vehiclePreview ? (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Vehicle Image</p>
                    <img 
                      src={vehiclePreview} 
                      alt="Vehicle" 
                      className="h-48 w-auto object-cover rounded-md border border-gray-200"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No Vehicle Image uploaded</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the dialog form
  const renderDialog = () => {
    return (
      <Dialog open={dialogOpen} onClose={closeDialog} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-white p-6 rounded-lg max-w-lg w-full space-y-4">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-lg font-semibold">Instructor Details</DialogTitle>
              <button onClick={closeDialog} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <p className="text-center py-8">Loading...</p>
            ) : (
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Vehicle Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Name
                    </label>
                    <input
                      type="text"
                      value={vehicleName}
                      onChange={(e) => setVehicleName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Vehicle Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Number
                    </label>
                    <input
                      type="text"
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Driving School Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driving School Location
                  </label>
                  <div className="mb-2 relative">
                    <div className="flex">
                      <input
                        ref={searchInputRef}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Search your driving school location"
                        autoComplete="off"
                        onClick={() => {
                          if (isLoaded && searchInputRef.current) {
                            initPlacesAutocomplete();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={isLocating}
                        className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 hover:bg-gray-200 rounded-r-md"
                        title="Use current location"
                      >
                        {isLocating ? (
                          <span className="flex items-center">
                            <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </span>
                        ) : (
                          <Navigation className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  {location && (
                    <div className="mt-2 text-sm text-gray-700 flex items-start bg-gray-50 p-2 rounded-md">
                      <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                      <span>{location}</span>
                    </div>
                  )}
                </div>

                {/* Aadhar Card Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aadhar Card
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      onChange={(e) => setAadharFile(e.target.files[0])}
                      className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    {aadharPreview && (
                      <img
                        src={aadharPreview}
                        alt="Aadhar Preview"
                        className="h-16 w-auto object-cover rounded-md"
                      />
                    )}
                  </div>
                </div>

                {/* License Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driving License
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      onChange={(e) => setLicenseFile(e.target.files[0])}
                      className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    {licensePreview && (
                      <img
                        src={licensePreview}
                        alt="License Preview"
                        className="h-16 w-auto object-cover rounded-md"
                      />
                    )}
                  </div>
                </div>

                {/* Vehicle Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      onChange={(e) => setVehicleFile(e.target.files[0])}
                      className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    {vehiclePreview && (
                      <img
                        src={vehiclePreview}
                        alt="Vehicle Preview"
                        className="h-16 w-auto object-cover rounded-md"
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Save Details
                  </button>
                </div>
              </form>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    );
  };

  // Main render method
  return (
    <div>
      {loading && !dialogOpen ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p>Loading instructor details...</p>
        </div>
      ) : hasData ? (
        renderInstructorDetails()
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">No instructor details found.</p>
          <button
            onClick={openEditDialog}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 inline-flex items-center"
          >
            <User className="w-4 h-4 mr-2" /> Add Instructor Details
          </button>
        </div>
      )}
      
      {/* Render dialog regardless of state, it will only show when dialogOpen is true */}
      {renderDialog()}
    </div>
  );
}
