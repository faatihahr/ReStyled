import { authService } from './authService';

export interface UserPreferences {
  id?: string;
  user_id: string;
  gender: string;
  style: string[];
  height: string;
  weight: string;
  skin_undertone: string;
  created_at?: string;
  updated_at?: string;
}

// Use NEXT_PUBLIC_API_URL when provided; otherwise use same-origin (relative) API routes.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

class PreferencesService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const token = await authService.getToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
    } catch (error) {
      throw error;
    }
  }

  async saveUserPreferences(preferences: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>): Promise<UserPreferences> {
    try {
      const response = await this.makeRequest('/api/preferences', {
        method: 'POST',
        body: JSON.stringify({
          gender: preferences.gender,
          style: preferences.style,
          height: preferences.height,
          weight: preferences.weight,
          skin_undertone: preferences.skin_undertone
        }),
      });

      return response.preferences;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to save preferences');
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const response = await this.makeRequest('/api/preferences');
      return response.preferences;
    } catch (error) {
      if (error instanceof Error && error.message.includes('User preferences not found')) {
        return null;
      }
      throw new Error(error instanceof Error ? error.message : 'Failed to get preferences');
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const response = await this.makeRequest('/api/preferences', {
        method: 'PATCH',
        body: JSON.stringify(preferences),
      });

      return response.preferences;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update preferences');
    }
  }

  async deleteUserPreferences(userId: string): Promise<void> {
    try {
      await this.makeRequest('/api/preferences', {
        method: 'DELETE',
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete preferences');
    }
  }
}

export const preferencesService = new PreferencesService();
