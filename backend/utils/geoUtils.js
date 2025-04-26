import axios from 'axios';

// Calculate distance between two points using Haversine formula
export const calculateDistance = (coord1, coord2) => {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const distance = R * c; // in metres

    return distance;
};

// Get coordinates from address using Nominatim (OpenStreetMap)
export const getCoordinatesFromAddress = async (address) => {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'SGH_CLEANBAG/1.0' }
        });

        if (response.data && response.data.length > 0) {
            const { lon, lat } = response.data[0];
            return [parseFloat(lon), parseFloat(lat)]; // GeoJSON format: [longitude, latitude]
        }

        throw new Error('Address not found');
    } catch (error) {
        console.error('Geocoding error:', error.message);
        throw error;
    }
};

// Get address from coordinates using Nominatim (OpenStreetMap)
export const getAddressFromCoordinates = async (coordinates) => {
    try {
        const [longitude, latitude] = coordinates;
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'SGH_CLEANBAG/1.0' }
        });

        if (response.data && response.data.address) {
            const addr = response.data.address;
            const addressObj = {
                street: addr.road || addr.street || '',
                area: addr.suburb || addr.neighbourhood || '',
                city: addr.city || addr.town || addr.village || '',
                state: addr.state || '',
                country: addr.country || '',
                postalCode: addr.postcode || ''
            };

            return {
                formattedAddress: response.data.display_name,
                components: addressObj
            };
        }

        throw new Error('Address not found');
    } catch (error) {
        console.error('Reverse geocoding error:', error.message);
        throw error;
    }
};

// Calculate optimized route for collection using OpenRouteService
export const optimizeRoute = async (origin, destination, waypoints = []) => {
    try {
        // You need to get a free API key from https://openrouteservice.org/dev/#/signup
        const ORS_API_KEY = process.env.ORS_API_KEY;
        if (!ORS_API_KEY) throw new Error('OpenRouteService API key not set');

        // Build coordinates array: [origin, ...waypoints, destination]
        const coords = [origin, ...waypoints, destination];

        const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
        const response = await axios.post(
            url,
            { coordinates: coords },
            {
                headers: {
                    'Authorization': ORS_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data && response.data.features && response.data.features.length > 0) {
            const route = response.data.features[0];
            // Extract distance and duration from properties
            const { segments } = route.properties;
            const totalDistance = segments.reduce((sum, seg) => sum + seg.distance, 0); // meters
            const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0); // seconds

            return {
                totalDistance,
                totalDuration: Math.ceil(totalDuration / 60), // in minutes
                geometry: route.geometry,
                segments
            };
        }

        throw new Error('Route optimization failed');
    } catch (error) {
        console.error('Route optimization error:', error.message);
        throw error;
    }
};