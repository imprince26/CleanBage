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

// Get coordinates from address using geocoding API
export const getCoordinatesFromAddress = async (address) => {
    try {
        const encodedAddress = encodeURIComponent(address);
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
        
        const response = await axios.get(url);
        
        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry.location;
            return [lng, lat]; // GeoJSON format is [longitude, latitude]
        }
        
        throw new Error('Address not found');
    } catch (error) {
        console.error('Geocoding error:', error.message);
        throw error;
    }
};

// Get address from coordinates using reverse geocoding API
export const getAddressFromCoordinates = async (coordinates) => {
    try {
        const [longitude, latitude] = coordinates;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
        
        const response = await axios.get(url);
        
        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const address = response.data.results[0].formatted_address;
            
            // Parse address components
            const components = response.data.results[0].address_components;
            const addressObj = {
                street: '',
                area: '',
                city: '',
                state: '',
                country: '',
                postalCode: ''
            };
            
            for (const component of components) {
                const types = component.types;
                
                if (types.includes('street_number')) {
                    addressObj.street += component.long_name;
                } else if (types.includes('route')) {
                    addressObj.street += (addressObj.street ? ' ' : '') + component.long_name;
                } else if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
                    addressObj.area = component.long_name;
                } else if (types.includes('locality')) {
                    addressObj.city = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                    addressObj.state = component.long_name;
                } else if (types.includes('country')) {
                    addressObj.country = component.long_name;
                } else if (types.includes('postal_code')) {
                    addressObj.postalCode = component.long_name;
                }
            }
            
            return {
                formattedAddress: address,
                components: addressObj
            };
        }
        
        throw new Error('Address not found');
    } catch (error) {
        console.error('Reverse geocoding error:', error.message);
        throw error;
    }
};

// Calculate optimized route for collection
export const optimizeRoute = async (origin, destination, waypoints) => {
    try {
        const originStr = origin.join(',');
        const destinationStr = destination.join(',');
        
        let waypointsStr = '';
        if (waypoints && waypoints.length > 0) {
            waypointsStr = '&waypoints=optimize:true|' + waypoints.map(wp => wp.join(',')).join('|');
        }
        
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}${waypointsStr}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
        
        const response = await axios.get(url);
        
        if (response.data.status === 'OK' && response.data.routes.length > 0) {
            const route = response.data.routes[0];
            
            // Extract optimized waypoints order
            const waypointOrder = route.waypoint_order || [];
            
            // Extract route distance and duration
            const distance = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0);
            const duration = route.legs.reduce((sum, leg) => sum + leg.duration.value, 0);
            
            return {
                optimizedWaypointOrder: waypointOrder,
                totalDistance: distance, // in meters
                totalDuration: Math.ceil(duration / 60), // in minutes
                polyline: route.overview_polyline.points,
                legs: route.legs
            };
        }
        
        throw new Error('Route optimization failed');
    } catch (error) {
        console.error('Route optimization error:', error.message);
        throw error;
    }
};