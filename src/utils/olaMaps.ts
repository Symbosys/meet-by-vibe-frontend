import axios from 'axios';

const OLA_MAPS_API_KEY = import.meta.env.VITE_OLA_MAPS_API_KEY || 'AbLgb9uuCk5EsknyN9nd1hol4dk85ehUH7izgU1e';

export interface OlaLocationResult {
  city: string;
  state: string;
  area?: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

/**
 * Reverse geocodes coordinates (lat, lng) to human-readable address/city using Ola Maps API
 */
export async function reverseGeocodeOlaMaps(lat: number, lng: number): Promise<OlaLocationResult> {
  const url = `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${lat},${lng}&api_key=${OLA_MAPS_API_KEY}`;
  
  const response = await axios.get(url, {
    headers: {
      'X-Request-Id': `req-${Date.now()}`
    },
    timeout: 10000
  });

  const data = response.data;
  let city = '';
  let state = '';
  let area = '';
  let formattedAddress = '';

  if (data && data.results && data.results.length > 0) {
    const primaryResult = data.results[0];
    formattedAddress = primaryResult.formatted_address || primaryResult.name || '';

    if (primaryResult.address_components && Array.isArray(primaryResult.address_components)) {
      for (const comp of primaryResult.address_components) {
        const types: string[] = comp.types || [];
        if (types.includes('locality') || types.includes('postal_town')) {
          city = comp.long_name || comp.short_name;
        } else if (!city && (types.includes('administrative_area_level_2') || types.includes('administrative_area_level_3'))) {
          city = comp.long_name || comp.short_name;
        }
        if (types.includes('administrative_area_level_1')) {
          state = comp.long_name || comp.short_name;
        }
        if (types.includes('sublocality') || types.includes('sublocality_level_1') || types.includes('neighborhood')) {
          area = comp.long_name || comp.short_name;
        }
      }
    }

    // If city is still not parsed from components, try fallback matching from formatted_address
    if (!city && formattedAddress) {
      const parts = formattedAddress.split(',').map((p: string) => p.trim());
      if (parts.length >= 2) {
        city = parts[parts.length - 3] || parts[parts.length - 2] || parts[0];
      }
    }
  }

  return {
    city: city || 'Ahmedabad',
    state: state || 'Gujarat',
    area,
    formattedAddress,
    latitude: lat,
    longitude: lng
  };
}

/**
 * Gets user's current GPS location and reverse geocodes it using Ola Maps
 */
export function fetchCurrentLocationViaOlaMaps(): Promise<OlaLocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const result = await reverseGeocodeOlaMaps(latitude, longitude);
          resolve(result);
        } catch (error) {
          console.error('Ola Maps reverse geocoding failed:', error);
          reject(error);
        }
      },
      (error) => {
        console.warn('Geolocation permission denied or error:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}
