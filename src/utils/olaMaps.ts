  import axios from 'axios';

const OLA_MAPS_API_KEY = import.meta.env.VITE_OLA_MAPS_API_KEY || 'AbLgb9uuCk5EsknyN9nd1hol4dk85ehUH7izgU1e';

export interface OlaLocationResult {
  locality: string;
  city: string;
  state: string;
  stateCode?: string;
  area?: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

/**
 * Reverse geocodes coordinates (lat, lng) to human-readable locality/city/state using Ola Maps API
 * with fallback to BigDataCloud client API if Ola Maps fails.
 */
export async function reverseGeocodeOlaMaps(lat: number, lng: number): Promise<OlaLocationResult> {
  const url = `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${lat},${lng}&api_key=${OLA_MAPS_API_KEY}`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        'X-Request-Id': `req-${Date.now()}`
      },
      timeout: 10000
    });

    const data = response.data;
    let sublocality = '';
    let neighborhood = '';
    let localityComp = '';
    let adminArea2 = '';
    let adminArea1 = '';
    let formattedAddress = '';

    if (data && data.results && data.results.length > 0) {
      const primaryResult = data.results[0];
      formattedAddress = primaryResult.formatted_address || primaryResult.name || '';

      if (primaryResult.address_components && Array.isArray(primaryResult.address_components)) {
        for (const comp of primaryResult.address_components) {
          const types: string[] = comp.types || [];
          if (types.includes('sublocality') || types.includes('sublocality_level_1') || types.includes('sublocality_level_2')) {
            if (!sublocality) sublocality = comp.long_name || comp.short_name;
          } else if (types.includes('neighborhood') && !neighborhood) {
            neighborhood = comp.long_name || comp.short_name;
          }
          if (types.includes('locality') || types.includes('postal_town')) {
            if (!localityComp) localityComp = comp.long_name || comp.short_name;
          }
          if (types.includes('administrative_area_level_2')) {
            if (!adminArea2) adminArea2 = comp.long_name || comp.short_name;
          }
          if (types.includes('administrative_area_level_1')) {
            if (!adminArea1) adminArea1 = comp.long_name || comp.short_name;
          }
        }
      }

      // Fallback matching from formatted_address if components are sparse
      if (!localityComp && formattedAddress) {
        const parts = formattedAddress.split(',').map((p: string) => p.trim());
        if (parts.length >= 2) {
          localityComp = parts[parts.length - 3] || parts[parts.length - 2] || parts[0];
        }
      }
    }

    // Determine city & state first
    const city = (localityComp && localityComp.toLowerCase() !== sublocality.toLowerCase())
      ? localityComp
      : (adminArea2 || localityComp || '');
    const state = adminArea1 || '';

    // Parse true locality & landmark from formattedAddress
    let extractedLocality = '';
    if (formattedAddress) {
      const parts = formattedAddress.split(',').map((p: string) => p.trim()).filter(Boolean);
      let cityIdx = parts.findIndex((p: string) => 
        (city && p.toLowerCase() === city.toLowerCase()) || 
        (state && p.toLowerCase() === state.toLowerCase())
      );
      if (cityIdx === -1) cityIdx = parts.length;
      const localParts = parts.slice(0, cityIdx);

      // Match Chowk, Square, Circle, Junction, Cross, Gate
      const chowkPart = localParts.find((p: string) => /\b(chowk|circle|cross|square|junction|stand|gate)\b/i.test(p));
      // Match Para, Toli, Nagar, Colony, Sector, Vihar, Road, Marg, Bazar
      const areaPart = localParts.find((p: string) => /\b(para|toli|nagar|colony|sector|vihar|enclave|bazar|market|road|marg)\b/i.test(p));

      if (chowkPart) {
        extractedLocality = chowkPart;
      } else if (areaPart) {
        extractedLocality = areaPart;
      } else if (localParts.length > 1) {
        extractedLocality = localParts[1];
      } else if (localParts.length > 0) {
        extractedLocality = localParts[0];
      }
    }

    const locality = extractedLocality || neighborhood || sublocality || localityComp || adminArea2 || '';

    return {
      locality: locality || city,
      city: city || locality,
      state,
      area: extractedLocality || neighborhood || sublocality || locality,
      formattedAddress: formattedAddress || (city && state ? `${locality ? `${locality}, ` : ''}${city}, ${state}` : ''),
      latitude: lat,
      longitude: lng
    };
  } catch (err) {
    console.warn('Ola Maps reverse geocode failed, trying fallback API:', err);
  }

  // Resilient fallback to BigDataCloud client API
  try {
    const bdcRes = await axios.get(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { timeout: 5000 }
    );
    const bdcData = bdcRes.data;
    const bdcLocality = bdcData.locality || bdcData.principalSubdivisionDescription || '';
    const bdcCity = bdcData.city || bdcLocality || '';
    const bdcState = bdcData.principalSubdivision || '';
    return {
      locality: bdcLocality || bdcCity,
      city: bdcCity,
      state: bdcState,
      area: bdcLocality,
      formattedAddress: `${bdcLocality ? `${bdcLocality}, ` : ''}${bdcCity}${bdcState ? `, ${bdcState}` : ''}`,
      latitude: lat,
      longitude: lng
    };
  } catch (fallbackErr) {
    console.warn('Fallback reverse geocode also failed:', fallbackErr);
  }

  return {
    locality: '',
    city: '',
    state: '',
    area: '',
    formattedAddress: '',
    latitude: lat,
    longitude: lng
  };
}

/**
 * Gets user's current GPS location and reverse geocodes it using Ola Maps,
 * with automatic resilient IP fallback if GPS is denied or unavailable.
 */
export async function fetchCurrentLocationViaOlaMaps(): Promise<OlaLocationResult> {
  const fetchFromIP = async (): Promise<OlaLocationResult> => {
    try {
      const ipRes = await axios.get('https://ipwho.is/', { timeout: 4000 });
      if (ipRes.data && ipRes.data.success !== false && ipRes.data.latitude && ipRes.data.longitude) {
        const { latitude, longitude, city, region } = ipRes.data;
        try {
          const rev = await reverseGeocodeOlaMaps(latitude, longitude);
          return rev;
        } catch {
          return {
            locality: city || '',
            city: city || '',
            state: region || '',
            area: city || '',
            formattedAddress: city && region ? `${city}, ${region}, India` : (city || ''),
            latitude,
            longitude
          };
        }
      }
    } catch (ipErr) {
      console.warn('IP geolocation fallback error:', ipErr);
    }

    return {
      locality: '',
      city: '',
      state: '',
      area: '',
      formattedAddress: '',
      latitude: 0,
      longitude: 0
    };
  };

  if (!navigator.geolocation) {
    return fetchFromIP();
  }

  return new Promise<OlaLocationResult>((resolve) => {
    let resolved = false;

    // Fast 5-second timeout so user is not stuck waiting on desktop
    const timer = setTimeout(async () => {
      if (!resolved) {
        resolved = true;
        const res = await fetchFromIP();
        resolve(res);
      }
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        try {
          const { latitude, longitude } = position.coords;
          const result = await reverseGeocodeOlaMaps(latitude, longitude);
          resolve(result);
        } catch (error) {
          console.warn('Reverse geocode error after GPS, fallback to IP:', error);
          const res = await fetchFromIP();
          resolve(res);
        }
      },
      async (error) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        console.info('GPS permission denied or unavailable, falling back to IP geolocation:', error.message);
        const res = await fetchFromIP();
        resolve(res);
      },
      {
        enableHighAccuracy: true,
        timeout: 4500,
        maximumAge: 60000
      }
    );
  });
}
