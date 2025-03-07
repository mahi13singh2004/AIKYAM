import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, LoadScript, DirectionsRenderer, Circle, Marker } from '@react-google-maps/api';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';

const defaultCenter = {
  lat: 10.7275, 
  lng: 76.2900
};

const UNSAFE_RADIUS = 50;
const BUFFER_DISTANCE = 50;

const libraries = ['places', 'geometry'];

const SafeRoute = () => {
  const [map, setMap] = useState(null);
  const [origin, setOrigin] = useState(''); // Keep this empty by default
  const [destination, setDestination] = useState('');
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [isMapLoading, setIsMapLoading] = useState(true);

  const { unsafeLocations, fetchUnsafeLocations } = useAuthStore();

  useEffect(() => {
    fetchUnsafeLocations();
    setCenter(defaultCenter);

    const fetchCurrentLocation = async () => {
      try {
        const response = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            considerIp: true,
            wifiAccessPoints: [],
            cellTowers: [],
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Failed to fetch location');

        const newLocation = {
          lat: data.location.lat,
          lng: data.location.lng,
        };
        const accuracy = data.accuracy || 100;

        console.log("Google Geolocation API update:", {
          lat: newLocation.lat,
          lng: newLocation.lng,
          accuracy: accuracy,
          source: "Google Geolocation API",
        });

        setCenter(newLocation);
     
        setError(null);
      } catch (err) {
        console.error("Google Geolocation API error:", err.message);
        setError(`Failed to get location with Geolocation API: ${err.message}`);

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const newLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              const accuracy = position.coords.accuracy;

              console.log("Navigator Geolocation update:", {
                lat: newLocation.lat,
                lng: newLocation.lng,
                accuracy: accuracy,
                source: "Navigator Geolocation",
              });

              setCenter(newLocation); 
              
              if (accuracy > 100) {
                setError(`Location accuracy low (${accuracy}m)`);
              } else {
                setError(null);
              }
            },
            (navError) => {
              console.error("Navigator Geolocation error:", navError.message);
              setError(`Failed to get location: ${navError.message} — using Shornur as default`);
              setCenter(defaultCenter); 
            },
            {
              enableHighAccuracy: true,
              timeout: 30000,
              maximumAge: 5000
            }
          );
        } else {
          console.error("Geolocation not supported by browser");
          setError("Geolocation not supported—using Shornur as default");
          setCenter(defaultCenter); // Fall back to Shornur
        }
      }
    };

    fetchCurrentLocation();
    const intervalId = setInterval(fetchCurrentLocation, 30000);

    return () => clearInterval(intervalId);
  }, [fetchUnsafeLocations]);

  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
    mapInstance.setZoom(15);
    mapInstance.setCenter(defaultCenter);
  };

  const handleScriptLoad = useCallback(() => {
    console.log("Script loaded successfully");
    setIsMapLoading(false);
  }, []);

  const handleScriptError = useCallback((error) => {
    console.error('Error loading Google Maps:', error);
    setError('Failed to load Google Maps. Please try refreshing the page.');
    setIsMapLoading(false);
  }, []);

  const calculateDistance = (point1, point2) => {
    const lat1 = typeof point1.lat === 'function' ? point1.lat() : point1.lat;
    const lng1 = typeof point1.lng === 'function' ? point1.lng() : point1.lng;
    const lat2 = typeof point2.lat === 'function' ? point2.lat() : point2.lat;
    const lng2 = typeof point2.lng === 'function' ? point2.lng() : point2.lng;

    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const isPointNearUnsafe = (point) => {
    if (!point) return false;
    const lat = typeof point.lat === 'function' ? point.lat() : point.lat;
    const lng = typeof point.lng === 'function' ? point.lng() : point.lng;

    for (const unsafe of unsafeLocations) {
      const unsafePoint = {
        lat: unsafe.lat,
        lng: unsafe.lng
      };
      const distance = calculateDistance({ lat, lng }, unsafePoint);
      if (distance <= (UNSAFE_RADIUS + BUFFER_DISTANCE)) {
        console.log('Unsafe point detected:', {
          point: { lat, lng },
          unsafe: unsafePoint,
          distance,
          threshold: UNSAFE_RADIUS + BUFFER_DISTANCE
        });
        return true;
      }
    }
    return false;
  };

  const isRouteSafe = (route) => {
    if (!route?.legs?.[0]?.steps || !window.google) {
      console.log("Route or steps missing, marking as unsafe");
      return false;
    }
    const steps = route.legs[0].steps;

    for (const step of steps) {
      if (isPointNearUnsafe(step.start_location) || isPointNearUnsafe(step.end_location)) {
        console.log('Unsafe point found at step boundary:', {
          start: step.start_location.toJSON(),
          end: step.end_location.toJSON()
        });
        return false;
      }

      try {
        if (!step.polyline?.points) {
          console.log("Step polyline points missing, skipping path check:", step);
          continue;
        }
        const path = window.google.maps.geometry.encoding.decodePath(step.polyline.points);
        for (let i = 0; i < path.length; i++) {
          if (isPointNearUnsafe(path[i])) {
            console.log('Unsafe point found in path:', path[i].toJSON());
            return false;
          }
        }
      } catch (error) {
        console.error('Error decoding path for safety check:', error);
      }
    }

    return true;
  };

  const findRoute = () => {
    if (!origin || !destination) {
      setError('Please enter both locations');
      return;
    }

    setLoading(true);
    setError(null);

    const directionsService = new window.google.maps.DirectionsService();

    const routingOptions = [
      { travelMode: 'DRIVING', avoidHighways: false },
      { travelMode: 'DRIVING', avoidHighways: true },
      { travelMode: 'TWO_WHEELER', avoidHighways: false },
      { travelMode: 'TWO_WHEELER', avoidHighways: true },
      { travelMode: 'WALKING', avoidHighways: false },
      { travelMode: 'BICYCLING', avoidHighways: false },
      { travelMode: 'TRANSIT', avoidHighways: false },
    ];

    let attemptCount = 0;

    const tryNextOption = () => {
      if (attemptCount >= routingOptions.length) {
        setLoading(false);
        setError('No safe route available. All routes pass through unsafe areas.');
        return;
      }

      const currentOption = routingOptions[attemptCount];

      const request = {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode[currentOption.travelMode],
        provideRouteAlternatives: true,
        optimizeWaypoints: true,
        avoidHighways: currentOption.avoidHighways,
        avoidTolls: false,
        unitSystem: window.google.maps.UnitSystem.METRIC
      };

      console.log(`Attempting route with mode: ${currentOption.travelMode}, avoidHighways: ${currentOption.avoidHighways}`);

      directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          console.log(`Found ${result.routes.length} alternative routes`);

          for (let i = 0; i < result.routes.length; i++) {
            const currentRoute = result.routes[i];
            console.log(`Checking route ${i + 1} of ${result.routes.length}`);

            const isSafe = isRouteSafe(currentRoute);
            console.log(`Route ${i + 1} safety check:`, isSafe ? 'SAFE' : 'UNSAFE');

            if (isSafe) {
              console.log('Found safe route using mode:', currentOption.travelMode);
              setLoading(false);
              setDirections({
                ...result,
                routes: [currentRoute]
              });

              const bounds = new window.google.maps.LatLngBounds();
              currentRoute.legs[0].steps.forEach((step) => {
                bounds.extend(step.start_location);
                bounds.extend(step.end_location);
              });
              map?.fitBounds(bounds);
              return;
            }
          }

          attemptCount++;
          tryNextOption();
        } else {
          console.error(`Direction service failed for ${currentOption.travelMode}:`, status);
          attemptCount++;
          tryNextOption();
        }
      });
    };

    tryNextOption();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-6 overflow-hidden">
        <div className="h-full bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
            <h1 className="text-2xl font-bold text-white">Safe Route Finder</h1>
            <p className="text-blue-100 mt-1">Find the safest route to your destination (Reload The page if map is not visible)</p>
          </div>

          <div className="flex flex-col lg:flex-row h-[calc(100%-4rem)]">
            <div className="lg:w-3/4 h-full">
              {isMapLoading ? (
                <div className="h-full flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                  <p className="ml-4 text-lg text-gray-600">Loading map...</p>
                </div>
              ) : null}
              <LoadScript
                googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                libraries={libraries}
                onLoad={handleScriptLoad}
                onError={handleScriptError}
              >
                {!isMapLoading && (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={center}
                    zoom={15}
                    onLoad={handleMapLoad}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: true,
                    }}
                  >
                    {directions && (
                      <DirectionsRenderer
                        directions={directions}
                        options={{
                          suppressMarkers: false,
                          preserveViewport: false,
                        }}
                      />
                    )}

                    {unsafeLocations.map((location, index) => (
                      <div key={index}>
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
                      </div>
                    ))}
                  </GoogleMap>
                )}
              </LoadScript>
            </div>

            <div className="lg:w-1/4 p-6 bg-gray-50 border-l border-gray-200 overflow-y-auto">
              <div className="space-y-6">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter start location"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />

                  <input
                    type="text"
                    placeholder="Enter destination"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />

                  <button
                    onClick={findRoute}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md disabled:bg-gray-400"
                  >
                    {loading ? 'Finding Route...' : 'Find Safe Route'}
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-3">Instructions</h3>
                  <ol className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <span className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-500 rounded-full mr-2 text-xs">1</span>
                      Enter your starting location
                    </li>
                    <li className="flex items-center">
                      <span className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-500 rounded-full mr-2 text-xs">2</span>
                      Enter your destination
                    </li>
                    <li className="flex items-center">
                      <span className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-500 rounded-full mr-2 text-xs">3</span>
                      Click Find Safe Route to get directions
                    </li>
                  </ol>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-3">Map Legend</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-gray-600">Route Start/End Points</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-gray-600">Unsafe Area</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-400 mr-2"></div>
                      <span className="text-gray-600">Route Path</span>
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

export default SafeRoute;