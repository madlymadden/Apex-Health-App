import AsyncStorage from '@react-native-async-storage/async-storage';
import bcrypt from 'bcryptjs';
import * as Crypto from 'expo-crypto';
import { z } from 'zod';
import { userService, activityLogsService } from './database.native';
import type { User as DbUser } from '../shared/schema';

export type User = Omit<DbUser, 'passwordHash'>;

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

const LoginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const RegisterCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

class AuthService {
  private static instance: AuthService;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      // Validate input
      const validated = LoginCredentialsSchema.parse(credentials);
      
      // Find user in database
      const user = await userService.getUserByEmail(validated.email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(validated.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      const token = await this.generateToken(user.id);

      // Store auth data
      await AsyncStorage.setItem(this.TOKEN_KEY, token);
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      // Log activity
      await activityLogsService.logActivity({
        userId: user.id,
        action: 'login',
        metadata: JSON.stringify({ timestamp: new Date().toISOString() }),
      });

      // Remove password hash from user object
      const { passwordHash, ...userWithoutPassword } = user;
      
      return { user: userWithoutPassword, token };
    } catch (error) {
      throw new Error('Login failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async register(credentials: RegisterCredentials): Promise<{ user: User; token: string }> {
    try {
      // Validate input
      const validated = RegisterCredentialsSchema.parse(credentials);
      
      // Check if user already exists
      const existingUser = await userService.getUserByEmail(validated.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(validated.password, 10);

      // Create user in database
      const newUser = await userService.createUser({
        email: validated.email,
        passwordHash,
        name: validated.name,
      });

      const token = await this.generateToken(newUser.id);

      // Store auth data
      await AsyncStorage.setItem(this.TOKEN_KEY, token);
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      }));

      // Log activity
      await activityLogsService.logActivity({
        userId: newUser.id,
        action: 'register',
        metadata: JSON.stringify({ timestamp: new Date().toISOString() }),
      });

      // Remove password hash from user object
      const { passwordHash: _, ...userWithoutPassword } = newUser;
      
      return { user: userWithoutPassword, token };
    } catch (error) {
      throw new Error('Registration failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async logout(): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      if (user) {
        // Log activity
        await activityLogsService.logActivity({
          userId: user.id,
          action: 'logout',
          metadata: JSON.stringify({ timestamp: new Date().toISOString() }),
        });
      }

      await AsyncStorage.removeItem(this.TOKEN_KEY);
      await AsyncStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem(this.USER_KEY);
      if (!userStr) return null;
      
      const user = JSON.parse(userStr) as User;
      
      // Verify user still exists in database
      const dbUser = await userService.getUserById(user.id);
      if (!dbUser) {
        // User deleted from database, clear local storage
        await this.logout();
        return null;
      }

      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    const user = await this.getCurrentUser();
    return !!(token && user);
  }

  async refreshToken(): Promise<string | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      const newToken = await this.generateToken(user.id);
      
      // Store new token
      await AsyncStorage.setItem(this.TOKEN_KEY, newToken);
      
      return newToken;
    } catch (error) {
      console.error('Refresh token error:', error);
      return null;
    }
  }

  async updateProfile(updates: Partial<Pick<User, 'name' | 'avatar'>>): Promise<User | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      // Update user in database
      const updatedUser = await userService.updateUser(user.id, updates);
      if (!updatedUser) return null;

      // Remove password hash and update local storage
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(userWithoutPassword));

      return userWithoutPassword;
    } catch (error) {
      console.error('Update profile error:', error);
      return null;
    }
  }

  private async generateToken(userId: string): Promise<string> {
    const payload = {
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
    };

    const payloadString = JSON.stringify(payload);
    const signature = await this.createTokenSignature(payloadString);
    return `${payloadString}|${signature}`;
  }

  private async createTokenSignature(payloadString: string): Promise<string> {
    const secret = typeof process !== 'undefined' && process.env?.JWT_SECRET
      ? process.env.JWT_SECRET
      : 'vitality-demo-secret-change-in-production';

    return Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${payloadString}.${secret}`
    );
  }

  private async verifyToken(token: string): Promise<{ userId: string } | null> {
    try {
      if (!token) {
        return null;
      }

      const separatorIndex = token.lastIndexOf('|');
      if (separatorIndex <= 0 || separatorIndex >= token.length - 1) {
        return null;
      }

      const payloadString = token.slice(0, separatorIndex);
      const signature = token.slice(separatorIndex + 1);

      const expectedSignature = await this.createTokenSignature(payloadString);
      if (expectedSignature !== signature) {
        return null;
      }

      const payload = JSON.parse(payloadString) as {
        userId?: string;
        exp?: number;
      };

      if (!payload.userId || typeof payload.exp !== 'number') {
        return null;
      }

      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return { userId: payload.userId };
    } catch (error) {
      return null;
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      const payload = await this.verifyToken(token);
      if (!payload) return false;

      const user = await userService.getUserById(payload.userId);
      return !!user;
    } catch (error) {
      return false;
    }
  }
}

export const authService = AuthService.getInstance();
