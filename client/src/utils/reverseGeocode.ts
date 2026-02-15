/**
 * Reverse geocodes coordinates to an address string.
 * Falls back to formatted coordinates if the API call fails.
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number,
): Promise<string> => {
  const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`,
    );

    if (!response.ok) {
      throw new Error("Geocoding API request failed");
    }

    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
  } catch (error) {
    console.error("Error getting address:", error);
  }

  // Fallback to coordinates
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
};
