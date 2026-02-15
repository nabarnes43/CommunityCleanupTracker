export const reverseGeocode = async (
  latitude: number,
  longitude: number,
): Promise<string> => {
  const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      return `API status: ${data.status} | ${data.error_message || "no error message"}`;
    }

    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }

    return `No results for ${latitude}, ${longitude}`;
  } catch (error: any) {
    return `Fetch error: ${error.message}`;
  }
};
