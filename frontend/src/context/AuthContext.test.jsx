import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as userService from '../services/user';

// Mock user service API methods
vi.mock('../services/user', () => ({
  login: vi.fn(),
  register: vi.fn(),
  updateCurrentUser: vi.fn(),
  getCurrentUser: vi.fn()
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  test('initial state is unauthenticated when no persisted user exists', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.currentUser).toBeNull();
  });

  test('restores authenticated state from localStorage on mount', () => {
    const mockUser = {
      email: 'test@example.com',
      username: 'testuser',
      token: 'valid-jwt-token-123',
      bio: 'Test bio',
      image: 'https://example.com/avatar.png'
    };
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'conduit_user') return JSON.stringify(mockUser);
      return null;
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.currentUser).toEqual(mockUser);
  });

  test('gracefully falls back to unauthenticated state when persisted user data is invalid JSON', () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'conduit_user') return 'invalid-json-content';
      return null;
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.currentUser).toBeNull();
  });

  test('login method correctly updates auth state and persists user data', async () => {
    const mockCredentials = { email: 'login@test.com', password: 'testpass123' };
    const mockResponseUser = {
      email: 'login@test.com',
      username: 'newuser',
      token: 'new-jwt-token-456',
      bio: '',
      image: ''
    };
    userService.login.mockResolvedValue({ user: mockResponseUser });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login(mockCredentials);
    });

    expect(userService.login).toHaveBeenCalledWith(mockCredentials);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.currentUser).toEqual(mockResponseUser);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('conduit_user', JSON.stringify(mockResponseUser));
  });

  test('register method correctly updates auth state and persists new user data', async () => {
    const mockRegisterData = { username: 'newregistered', email: 'register@test.com', password: 'securepass' };
    const mockResponseUser = {
      email: 'register@test.com',
      username: 'newregistered',
      token: 'register-jwt-token-789',
      bio: '',
      image: ''
    };
    userService.register.mockResolvedValue({ user: mockResponseUser });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.register(mockRegisterData);
    });

    expect(userService.register).toHaveBeenCalledWith(mockRegisterData);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.currentUser).toEqual(mockResponseUser);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('conduit_user', JSON.stringify(mockResponseUser));
  });

  test('refreshCurrentUser fetches latest user data from API and updates local state', async () => {
    const existingUser = {
      email: 'refresh@test.com',
      username: 'oldusername',
      token: 'valid-refresh-token',
      bio: 'Old bio',
      image: 'old-avatar.png'
    };
    const refreshedUser = {
      email: 'refresh@test.com',
      username: 'updatedusername',
      token: 'valid-refresh-token',
      bio: 'New updated bio',
      image: 'new-avatar.png'
    };
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'conduit_user') return JSON.stringify(existingUser);
      return null;
    });
    userService.getCurrentUser.mockResolvedValue({ user: refreshedUser });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.refreshCurrentUser();
    });

    expect(userService.getCurrentUser).toHaveBeenCalled();
    expect(result.current.currentUser).toEqual(refreshedUser);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('conduit_user', JSON.stringify(refreshedUser));
  });

  test('refreshCurrentUser does nothing and does not throw error when user is not authenticated', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.refreshCurrentUser();
    });

    expect(userService.getCurrentUser).not.toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.currentUser).toBeNull();
  });

  test('refreshCurrentUser preserves existing state when API call fails', async () => {
    const existingUser = {
      email: 'stable@test.com',
      username: 'stableuser',
      token: 'valid-stable-token',
      bio: 'Stable bio',
      image: 'stable-avatar.png'
    };
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'conduit_user') return JSON.stringify(existingUser);
      return null;
    });
    userService.getCurrentUser.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.refreshCurrentUser();
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.currentUser).toEqual(existingUser);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  test('logout method clears auth state and removes persisted data', () => {
    const preExistingUser = {
      email: 'logout@test.com',
      username: 'logoutuser',
      token: 'token-to-clear'
    };
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'conduit_user') return JSON.stringify(preExistingUser);
      return null;
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.currentUser).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('conduit_user');
  });

  test('updateUserInfo correctly merges new user properties to existing state', () => {
    const initialUser = {
      email: 'update@test.com',
      username: 'oldname',
      token: 'persisted-token',
      bio: 'Old bio',
      image: 'old-avatar.png'
    };
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'conduit_user') return JSON.stringify(initialUser);
      return null;
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    act(() => {
      result.current.updateUserInfo({
        username: 'newname',
        bio: 'Updated new bio'
      });
    });

    expect(result.current.currentUser).toEqual({
      ...initialUser,
      username: 'newname',
      bio: 'Updated new bio'
    });
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test('throws expected error when useAuth is called outside AuthProvider', () => {
    // Suppress console.error for this test to avoid noise
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');

    console.error = originalError;
  });

  test('login does not corrupt state when API call throws error', async () => {
    userService.login.mockRejectedValue(new Error('Invalid credentials'));
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await expect(result.current.login({ email: 'bad@test.com', password: 'wrong' })).rejects.toThrow();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.currentUser).toBeNull();
  });

  test('register does not corrupt state when API call throws error', async () => {
    userService.register.mockRejectedValue(new Error('Username already taken'));
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await expect(result.current.register({ username: 'taken', email: 'taken@test.com', password: '123' })).rejects.toThrow();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.currentUser).toBeNull();
  });
});