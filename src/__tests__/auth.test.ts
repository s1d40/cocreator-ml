import { firebaseConfig, app, auth } from '../config/firebase';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  logoutUser,
  resetPassword,
  subscribeToAuthChanges,
} from '../services/auth';

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({ name: '[DEFAULT]' })),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({ name: '[DEFAULT]' })),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  onAuthStateChanged: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';

describe('Firebase Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('firebaseConfig should match target project credentials', () => {
    expect(firebaseConfig.projectId).toBe('cocreator-saas');
    expect(firebaseConfig.appId).toBe('1:970698861067:web:d400e6a796cb2e705bf50e');
    expect(firebaseConfig.apiKey).toBe('AIzaSyAxolIvWoTAYnf--C7KHwaKnqtpB-cQPY4');
    expect(firebaseConfig.authDomain).toBe('cocreator-saas.firebaseapp.com');
    expect(firebaseConfig.storageBucket).toBe('cocreator-saas.firebasestorage.app');
  });

  test('signUpWithEmail calls createUserWithEmailAndPassword', async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({ user: { email: 'test@example.com' } });
    const result = await signUpWithEmail('test@example.com', 'password123');
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password123');
    expect(result.user.email).toBe('test@example.com');
  });

  test('signInWithEmail calls signInWithEmailAndPassword', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({ user: { email: 'test@example.com' } });
    const result = await signInWithEmail('test@example.com', 'password123');
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password123');
    expect(result.user.email).toBe('test@example.com');
  });

  test('signInWithGoogle calls signInWithPopup', async () => {
    (signInWithPopup as jest.Mock).mockResolvedValueOnce({ user: { email: 'google@example.com' } });
    const result = await signInWithGoogle();
    expect(signInWithPopup).toHaveBeenCalledWith(auth, expect.anything());
    expect(result.user.email).toBe('google@example.com');
  });

  test('logoutUser calls signOut', async () => {
    (signOut as jest.Mock).mockResolvedValueOnce(undefined);
    await logoutUser();
    expect(signOut).toHaveBeenCalledWith(auth);
  });

  test('resetPassword calls sendPasswordResetEmail', async () => {
    (sendPasswordResetEmail as jest.Mock).mockResolvedValueOnce(undefined);
    await resetPassword('test@example.com');
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'test@example.com');
  });

  test('subscribeToAuthChanges attaches state change listener', () => {
    const callback = jest.fn();
    subscribeToAuthChanges(callback);
    expect(onAuthStateChanged).toHaveBeenCalledWith(auth, callback);
  });
});
