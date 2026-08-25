# Task: Firebase Authentication Migration

## Overview
Migrate authentication system to Firebase Auth with web client configuration for project `cocreator-saas`.

## Firebase Config
```javascript
const firebaseConfig = {
  projectId: "cocreator-saas",
  appId: "1:970698861067:web:d400e6a796cb2e705bf50e",
  apiKey: "AIzaSyAxolIvWoTAYnf--C7KHwaKnqtpB-cQPY4",
  authDomain: "cocreator-saas.firebaseapp.com",
  storageBucket: "cocreator-saas.firebasestorage.app"
};
```

## Implementation Checklist
- [x] Document migration task in `TASKS/TASK_AUTH_FIREBASE_MIGRATION.md`
- [x] Initialize Firebase App and Auth service in `src/config/firebase.ts`
- [x] Create core Auth methods in `src/services/auth.ts` (email/password signup, login, google login, logout, password reset, auth state listener)
- [x] Implement Auth Provider and Context in `src/context/AuthContext.tsx` and custom hook in `src/hooks/useAuth.ts`
- [x] Add unit tests verifying Firebase Auth integration
