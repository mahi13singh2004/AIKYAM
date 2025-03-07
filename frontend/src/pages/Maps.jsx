import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, Circle } from '@react-google-maps/api';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';

const Maps = () => {
  const { unsafeLocations, fetchUnsafeLocations, markLocationAsUnsafe } = useAuthStore();
  const [center, setCenter] = useState({ lat: 10.7275, lng: 76.2900 });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isNearUnsafe, setIsNearUnsafe] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapMode, setMapMode] = useState('unsafe');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);


  const UNSAFE_RADIUS = 50;
  const ALERT_THRESHOLD = 100;

  useEffect(() => {
    fetchUnsafeLocations();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCenter(newLocation);
          setCurrentLocation(newLocation);
          checkProximityToUnsafeAreas(newLocation);
        },
        (error) => {
          console.error(error);
          const defaultLocation = { lat: 10.7275, lng: 76.2900 };
          setCenter(defaultLocation);
          setCurrentLocation(defaultLocation);
        }
      );
    } else {
      const defaultLocation = { lat: 10.7275, lng: 76.2900 };
      setCenter(defaultLocation);
      setCurrentLocation(defaultLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMapClick = (event) => {
    const newLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };

    if (mapMode === 'unsafe') {
      setSelectedLocation(newLocation);
    } else if (mapMode === 'location') {
      setSelectedLocation(newLocation);
    }
  };

  const markAsUnsafe = async () => {
    if (selectedLocation) {
      try {
        await markLocationAsUnsafe(selectedLocation.lat, selectedLocation.lng);
        setSelectedLocation(null);
      } catch (error) {
        console.error('Failed to mark location:', error);
      }
    }
  };

  const checkProximityToUnsafeAreas = useCallback((location) => {
    const isNear = unsafeLocations.some(unsafeLocation => {
      const distance = getDistance(
        location.lat,
        location.lng,
        unsafeLocation.lat,
        unsafeLocation.lng
      );
      return distance <= ALERT_THRESHOLD;
    });
    setIsNearUnsafe(isNear);
  }, [unsafeLocations]);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const onLoad = useCallback(() => {
    setIsLoaded(true);
    setGoogleMapsLoaded(true);
  }, []);

  const getMapOptions = useCallback(() => {
    if (!googleMapsLoaded) return {};

    return {
      streetViewControl: false,
      mapTypeControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_BOTTOM
      },
      fullscreenControl: false,
      locationButton: true,
      locationButtonOptions: {
        position: window.google.maps.ControlPosition.RIGHT_BOTTOM
      }
    };
  }, [googleMapsLoaded]);

  const toggleMapMode = (mode) => {
    setMapMode(mode);
    setSelectedLocation(null);
  };

  const confirmLocationSet = () => {
    if (selectedLocation && mapMode === 'location') {
      setCurrentLocation(selectedLocation);
      setCenter(selectedLocation);
      checkProximityToUnsafeAreas(selectedLocation);
      setSelectedLocation(null);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCenter(newLocation);
          setCurrentLocation(newLocation);
          checkProximityToUnsafeAreas(newLocation);
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-6 overflow-hidden">
        <div className="h-full bg-white rounded-lg shadow-lg overflow-hidden">

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
            <h1 className="text-2xl font-bold text-white">Safety Map</h1>
            <p className="text-blue-100 mt-1">Mark and view unsafe areas in your vicinity (Reload The page if map is not visible)</p>
          </div>

          <div className="flex flex-col lg:flex-row h-[calc(100%-4rem)]">
            <div className="lg:w-3/4 h-full">
              <LoadScript
                googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                onLoad={onLoad}
              >
                <GoogleMap
                  center={center}
                  zoom={13}
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  onClick={handleMapClick}
                  options={getMapOptions()}
                >
                  {isLoaded && googleMapsLoaded && (
                    <>
                      <div
                        style={{
                          position: 'absolute',
                          right: '10px',
                          bottom: '120px',
                          backgroundColor: '#fff',
                          padding: '8px',
                          borderRadius: '2px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                          cursor: 'pointer'
                        }}
                        onClick={getCurrentLocation}
                        title="Center to current location"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="6" strokeWidth="2" />
                          <circle cx="12" cy="12" r="2" fill="currentColor" />
                        </svg>
                      </div>

                      <Marker
                        position={currentLocation}
                        icon={{
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 10,
                          fillColor: "#4285F4",
                          fillOpacity: 1,
                          strokeColor: "#FFFFFF",
                          strokeWeight: 2,
                        }}
                      />

                      {selectedLocation && mapMode === 'location' && (
                        <Marker
                          position={selectedLocation}
                          icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: "#00FF00",
                            fillOpacity: 0.7,
                            strokeColor: "#FFFFFF",
                            strokeWeight: 2,
                          }}
                        />
                      )}

                      {selectedLocation && mapMode === 'unsafe' && (
                        <>
                          <Marker
                            position={selectedLocation}
                            icon={{
                              path: window.google.maps.SymbolPath.CIRCLE,
                              scale: 8,
                              fillColor: "#FFA500",
                              fillOpacity: 0.7,
                              strokeColor: "#FFFFFF",
                              strokeWeight: 2,
                            }}
                          />
                          <Circle
                            center={selectedLocation}
                            radius={UNSAFE_RADIUS}
                            options={{
                              fillColor: '#FFA50080',
                              fillOpacity: 0.2,
                              strokeColor: '#FFA500',
                              strokeOpacity: 0.5,
                              strokeWeight: 1,
                            }}
                          />
                        </>
                      )}

                      {unsafeLocations.map((location, index) => (
                        <React.Fragment key={index}>
                          <Marker
                            position={{ lat: location.lat, lng: location.lng }}
                            icon={{
                              path: window.google.maps.SymbolPath.CIRCLE,
                              scale: 8,
                              fillColor: "#FF0000",
                              fillOpacity: 0.7,
                              strokeColor: "#FFFFFF",
                              strokeWeight: 2,
                            }}
                          />
                          <Circle
                            center={{ lat: location.lat, lng: location.lng }}
                            radius={UNSAFE_RADIUS}
                            options={{
                              fillColor: '#FF000080',
                              fillOpacity: 0.1,
                              strokeColor: '#FF4444',
                              strokeOpacity: 0.5,
                              strokeWeight: 1,
                            }}
                          />
                        </React.Fragment>
                      ))}
                    </>
                  )}
                </GoogleMap>
              </LoadScript>
            </div>

            <div className="lg:w-1/4 p-6 bg-gray-50 border-l border-gray-200 overflow-y-auto">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Map Mode</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleMapMode('location')}
                      className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 ${mapMode === 'location'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      Set Location
                    </button>
                    <button
                      onClick={() => toggleMapMode('unsafe')}
                      className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 ${mapMode === 'unsafe'
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      Mark Unsafe
                    </button>
                  </div>
                </div>

                {mapMode === 'unsafe' && selectedLocation && (
                  <button
                    onClick={markAsUnsafe}
                    className="w-full py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md"
                  >
                    Mark Selected Area as Unsafe
                  </button>
                )}

                {mapMode === 'location' && selectedLocation && (
                  <button
                    onClick={confirmLocationSet}
                    className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md"
                  >
                    Confirm New Location
                  </button>
                )}

                {isNearUnsafe && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">
                          Warning: You are near an unsafe area!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-3">Instructions</h3>
                  <ol className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <span className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-500 rounded-full mr-2 text-xs">1</span>
                      Select mode: Set Location or Mark Unsafe
                    </li>
                    <li className="flex items-center">
                      <span className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-500 rounded-full mr-2 text-xs">2</span>
                      Click on the map to {mapMode === 'unsafe' ? 'select an unsafe area' : 'select your new location'}
                    </li>
                    <li className="flex items-center">
                      <span className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-500 rounded-full mr-2 text-xs">3</span>
                      Click confirm to save your selection
                    </li>
                  </ol>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-3">Map Legend</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-gray-600">Current Location</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-gray-600">Selected Location</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-gray-600">Unsafe Area</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maps;