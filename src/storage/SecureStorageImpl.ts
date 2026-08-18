import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ISecureStorageService } from './IStorageService';

export class SecureStorageImpl implements ISecureStorageService {
  private isAvailable: boolean = Platform.OS !== 'web';

  async getSecureItem(key: string): Promise<string | null> {
    try {
      if (this.isAvailable) {
        return await SecureStore.getItemAsync(key);
      }
      return await AsyncStorage.getItem(`__sec_${key}`);
    } catch (e) {
      console.warn(`[SecureStorageImpl] SecureStore unavailable, falling back for key "${key}":`, e);
      return await AsyncStorage.getItem(`__sec_${key}`);
    }
  }

  async setSecureItem(key: string, value: string): Promise<void> {
    try {
      if (this.isAvailable) {
        await SecureStore.setItemAsync(key, value);
        return;
      }
      await AsyncStorage.setItem(`__sec_${key}`, value);
    } catch (e) {
      console.warn(`[SecureStorageImpl] SecureStore unavailable, falling back for key "${key}":`, e);
      await AsyncStorage.setItem(`__sec_${key}`, value);
    }
  }

  async removeSecureItem(key: string): Promise<void> {
    try {
      if (this.isAvailable) {
        await SecureStore.deleteItemAsync(key);
        return;
      }
      await AsyncStorage.removeItem(`__sec_${key}`);
    } catch (e) {
      console.warn(`[SecureStorageImpl] Error removing secure key "${key}":`, e);
      await AsyncStorage.removeItem(`__sec_${key}`);
    }
  }
}
