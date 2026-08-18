import * as Location from 'expo-location';

export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  mapUrl: string;
  timestamp: number;
}

export class LocationService {
  private static instance: LocationService;

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Checks current permission status
   */
  async checkPermission(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Requests foreground location permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (e) {
      console.warn('[LocationService] Permission request failed:', e);
      return false;
    }
  }

  /**
   * Obtains current device GPS coordinates with graceful fallback to last known position
   */
  async getCurrentLocation(): Promise<LocationResult> {
    try {
      const hasPermission = await this.checkPermission();
      if (!hasPermission) {
        const granted = await this.requestPermission();
        if (!granted) {
          throw new Error('Location permission was not granted by user');
        }
      }

      // First try quick last known position
      const lastKnown = await Location.getLastKnownPositionAsync().catch(() => null);

      // Try current position with balanced accuracy for fast response
      let position: Location.LocationObject | null = null;
      try {
        position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      } catch {
        position = lastKnown;
      }

      if (!position && lastKnown) {
        position = lastKnown;
      }

      if (!position) {
        throw new Error('Device GPS position could not be acquired');
      }

      const { latitude, longitude, accuracy } = position.coords;
      const mapUrl = `https://maps.google.com/?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;

      return {
        latitude,
        longitude,
        accuracy,
        mapUrl,
        timestamp: position.timestamp,
      };
    } catch (e: any) {
      console.warn('[LocationService] Location fetch error:', e.message);
      throw new Error(`Location unavailable: ${e.message || 'GPS disabled'}`);
    }
  }
}

export const locationService = LocationService.getInstance();
export default locationService;
