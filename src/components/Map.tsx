import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Navigation } from 'lucide-react';
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const Map = ({ isMatchingDriver, driverLocation, pickupLocation, dropoffLocation, onLocationSelect, isChatOpen = false }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markers = useRef({});
    const driverRouteAnimation = useRef(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);
    const [driverRoute, setDriverRoute] = useState(null);
    const [driverPosition, setDriverPosition] = useState(0);
    const formatDistance = (meters) => {
        const miles = meters / 1609.34;
        return `${miles.toFixed(1)} mi`;
    };
    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.round((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };
    useEffect(() => {
        if (!mapContainer.current || map.current)
            return;
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/navigation-night-v1',
            center: [0, 20],
            zoom: 1.5
        });
        map.current.on('load', () => {
            map.current?.addSource('route', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: []
                    }
                }
            });
            map.current?.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#0072E5',
                    'line-width': 4,
                    'line-opacity': 0.8
                }
            });
        });
        // Get user's location
        navigator.geolocation.getCurrentPosition((position) => {
            const { longitude, latitude } = position.coords;
            setCurrentLocation({ lng: longitude, lat: latitude });
            // Set pickup location to current location
            if (onLocationSelect) {
                onLocationSelect({
                    lng: longitude,
                    lat: latitude,
                    address: 'Current Location'
                });
            }
            // Animate zoom to user's location
            map.current?.flyTo({
                center: [longitude, latitude],
                zoom: 14,
                duration: 3000,
                essential: true,
                curve: 1.2,
                padding: {
                    top: 150,
                    bottom: 250,
                    left: 100,
                    right: 100
                }
            });
        }, (error) => {
            console.error('Error getting location:', error);
        });
        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);
    useEffect(() => {
        if (!map.current || !pickupLocation || !dropoffLocation)
            return;
        const getRoute = async () => {
            try {
                const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${pickupLocation.lng},${pickupLocation.lat};${dropoffLocation.lng},${dropoffLocation.lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`);
                const data = await response.json();
                if (data.routes && data.routes[0]) {
                    const route = data.routes[0];
                    const routeGeoJSON = {
                        type: 'Feature',
                        properties: {},
                        geometry: route.geometry
                    };
                    if (map.current?.getSource('route')) {
                        map.current.getSource('route').setData(routeGeoJSON);
                    }
                    setRouteInfo({
                        distance: formatDistance(route.distance),
                        duration: formatDuration(route.duration)
                    });
                    // Create bounds that include both pickup and dropoff with padding
                    const bounds = new mapboxgl.LngLatBounds()
                        .extend([pickupLocation.lng, pickupLocation.lat])
                        .extend([dropoffLocation.lng, dropoffLocation.lat]);
                    // Extend bounds to include all route coordinates
                    route.geometry.coordinates.forEach((coord) => {
                        bounds.extend(coord);
                    });
                    // Fit map to bounds with more generous padding
                    map.current?.fitBounds(bounds, {
                        padding: {
                            top: 100,
                            bottom: 400,
                            left: 50,
                            right: 50
                        },
                        maxZoom: 14,
                        duration: 1500,
                        essential: true
                    });
                }
            }
            catch (error) {
                console.error('Error fetching route:', error);
            }
        };
        getRoute();
    }, [pickupLocation, dropoffLocation]);
    useEffect(() => {
        if (!map.current)
            return;
        // Clear existing markers
        Object.values(markers.current).forEach(marker => marker.remove());
        markers.current = {};
        // Add pickup marker (blue dot with pulse)
        if (pickupLocation) {
            const el = document.createElement('div');
            el.className = 'current-location-marker';
            el.innerHTML = `
        <div class="current-location-dot"></div>
        <div class="current-location-pulse"></div>
      `;
            markers.current.pickup = new mapboxgl.Marker(el)
                .setLngLat([pickupLocation.lng, pickupLocation.lat])
                .addTo(map.current);
        }
        // Add dropoff marker (green dot)
        if (dropoffLocation) {
            const el = document.createElement('div');
            el.className = 'destination-marker';
            el.style.width = '14px';
            el.style.height = '14px';
            el.style.backgroundColor = '#00E5A0';
            el.style.border = '2px solid white';
            el.style.borderRadius = '50%';
            markers.current.dropoff = new mapboxgl.Marker(el)
                .setLngLat([dropoffLocation.lng, dropoffLocation.lat])
                .addTo(map.current);
        }
        // Add driver marker if in matching state
        if (isMatchingDriver && driverLocation) {
            const el = document.createElement('div');
            el.className = 'driver-marker';
            markers.current.driver = new mapboxgl.Marker(el)
                .setLngLat([driverLocation.lng, driverLocation.lat])
                .addTo(map.current);
        }
    }, [pickupLocation, dropoffLocation, isMatchingDriver, driverLocation]);
    return (<div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full"/>
      
      {/* Route Info Pill */}
      {routeInfo && !isMatchingDriver && (<div className="absolute left-2 z-50" style={{
                top: window.matchMedia('(display-mode: standalone)').matches ? '72px' : '90px'
            }}>
          <div className="inline-flex items-center space-x-1.5 bg-white rounded-full px-2.5 py-1.5 shadow-lg">
            <Navigation className="w-3.5 h-3.5 text-[#0072E5]"/>
            <span className="text-gray-900 text-sm font-medium">
              {routeInfo.distance} • {routeInfo.duration}
            </span>
          </div>
        </div>)}
      
      {/* Route Info - Adjusted top position */}
      {isMatchingDriver && !isChatOpen && (<div className="fixed left-0 right-0 flex justify-start px-2" style={{
                top: 'calc(var(--sat) + 60px)',
                zIndex: 10
            }}>
          <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
            <div className="w-2 h-2 bg-[#00E5A0] rounded-full animate-pulse"/>
            <span className="text-gray-900 text-sm font-medium">Driver is 3 min away</span>
          </div>
        </div>)}
    </div>);
};
export default Map;
