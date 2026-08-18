import * as LocalAuthentication from 'expo-local-authentication';
import storage from '../../storage';

export class SecurityService {
  private static instance: SecurityService;

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Check if the device hardware supports biometrics
   */
  async isBiometricHardwareAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch {
      return false;
    }
  }

  /**
   * Authenticate the user with FaceID / TouchID / Biometrics
   */
  async authenticateBiometrics(
    promptMessage: string = 'Authenticate to access Sentinel Security'
  ): Promise<boolean> {
    try {
      const isAvailable = await this.isBiometricHardwareAvailable();
      if (!isAvailable) return false;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (e) {
      console.warn('[SecurityService] Biometric auth error:', e);
      return false;
    }
  }

  /**
   * Validate master PIN
   */
  async verifyPin(inputPin: string): Promise<boolean> {
    const savedPin = await storage.getSecurityPin();
    if (!savedPin) return true; // no PIN set yet
    return savedPin === inputPin;
  }

  /**
   * Set or change PIN
   */
  async setPin(newPin: string): Promise<void> {
    await storage.setSecurityPin(newPin);
  }

  /**
   * Check if PIN is currently set
   */
  async hasPin(): Promise<boolean> {
    const pin = await storage.getSecurityPin();
    return pin !== null && pin.length > 0;
  }

  /**
   * Remove PIN protection
   */
  async removePin(): Promise<void> {
    await storage.removeSecurityPin();
  }
}

export const securityService = SecurityService.getInstance();
export default securityService;
