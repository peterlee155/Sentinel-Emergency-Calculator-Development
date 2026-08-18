import AsyncStorage from '@react-native-async-storage/async-storage';
import { IStorageService } from './IStorageService';

export class AsyncStorageImpl implements IStorageService {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? (JSON.parse(jsonValue) as T) : null;
    } catch (e) {
      console.error(`[AsyncStorageImpl] Error reading key "${key}":`, e);
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error(`[AsyncStorageImpl] Error setting key "${key}":`, e);
      throw e;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(`[AsyncStorageImpl] Error removing key "${key}":`, e);
      throw e;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error('[AsyncStorageImpl] Error clearing storage:', e);
      throw e;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return (await AsyncStorage.getAllKeys()) as string[];
    } catch (e) {
      console.error('[AsyncStorageImpl] Error retrieving keys:', e);
      return [];
    }
  }
}
