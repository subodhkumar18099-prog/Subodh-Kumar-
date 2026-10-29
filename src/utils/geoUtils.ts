/**
 * Geolocation Utility for Sunvault Expenses Manager
 */

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  timestamp: string;
  error?: string;
}

export const captureCurrentLocation = (): Promise<GeolocationResult> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        latitude: 0,
        longitude: 0,
        timestamp: new Date().toISOString(),
        error: 'Geolocation is not supported by your browser or device.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
          accuracyMeters: Math.round(position.coords.accuracy),
          timestamp: new Date(position.timestamp).toISOString(),
        });
      },
      (err) => {
        let msg = 'Unable to retrieve location';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can continue submitting the expense without GPS.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        resolve({
          latitude: 0,
          longitude: 0,
          timestamp: new Date().toISOString(),
          error: msg,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};

export const getGoogleMapsUrl = (lat: number, lng: number): string => {
  return `https://www.google.com/maps?q=${lat},${lng}`;
};
