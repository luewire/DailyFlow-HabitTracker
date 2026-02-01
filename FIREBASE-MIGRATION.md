# Firebase Migration Guide

## 📋 Overview
Panduan untuk migrate storage dari localStorage ke Firebase Firestore.

## ✅ Yang Sudah Disiapkan

### 1. Firebase SDK Installed
```bash
npm install firebase
```

### 2. Firebase Stores Created
- `store/taskStore.firebase.ts` - Firestore version of taskStore
- `store/workoutStore.firebase.ts` - Firestore version of workoutStore
- `store/timerStore.ts` - Tetap gunakan localStorage (session data)

### 3. Firebase Config
File `lib/firebase.ts` sudah ada dan siap digunakan.

## 🔧 Setup Firebase Project

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `dailyflow-app` (or any name)
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Register Web App
1. In project overview, click Web icon (</>) 
2. App nickname: `DailyFlow Web`
3. Don't check "Firebase Hosting"
4. Click "Register app"
5. **Copy the firebaseConfig object**

### Step 3: Enable Firestore
1. Go to "Build" → "Firestore Database"
2. Click "Create database"
3. Select location (asia-southeast1 for Indonesia)
4. Start in **production mode** (we'll add rules later)
5. Click "Enable"

### Step 4: Enable Authentication
1. Go to "Build" → "Authentication"
2. Click "Get started"
3. Enable "Email/Password" sign-in method
4. Click "Save"

## 📝 Configure Environment Variables

### Step 1: Create `.env.local` file
Create file in project root: `c:\laragon\www\my-work\.env.local`

### Step 2: Add Firebase Config
Paste your Firebase config from console:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Example:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dailyflow-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dailyflow-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dailyflow-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789
```

## 🔄 Switch to Firebase Stores

### Option A: Manual File Replacement

1. **Backup current stores:**
```bash
mv store/taskStore.ts store/taskStore.localStorage.backup.ts
mv store/workoutStore.ts store/workoutStore.localStorage.backup.ts
```

2. **Use Firebase stores:**
```bash
mv store/taskStore.firebase.ts store/taskStore.ts
mv store/workoutStore.firebase.ts store/workoutStore.ts
```

### Option B: Direct Import (Recommended for Testing)

Update imports in your pages:

**Before (localStorage):**
```typescript
import { useTaskStore } from '@/store/taskStore';
import { useWorkoutStore } from '@/store/workoutStore';
```

**After (Firebase):**
```typescript
import { useTaskStore } from '@/store/taskStore.firebase';
import { useWorkoutStore } from '@/store/workoutStore.firebase';
```

## 🔒 Firestore Security Rules

Go to Firestore → Rules tab, paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Tasks collection
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
                          request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
    }
    
    // Workouts collection
    match /workouts/{workoutId} {
      allow read, write: if request.auth != null && 
                          workoutId.matches(request.auth.uid + '_.*');
    }
  }
}
```

**Publish the rules!**

## 📊 Firestore Collections Structure

### `tasks` Collection
```
tasks/
  {taskId}/
    - title: string
    - priority: "low" | "medium" | "high"
    - completed: boolean
    - dueDate: string | null
    - createdAt: Timestamp
    - order: number
    - userId: string
```

### `workouts` Collection
```
workouts/
  {userId}_{weekId}/
    - userId: string
    - weekId: string (e.g., "2026-W05")
    - workouts: array
    - completedExercises: array
```

## 🧪 Testing

### 1. Test Firebase Connection
```bash
npm run dev
```

Open browser console, check for Firebase errors.

### 2. Test Auth
Login and check if authentication works.

### 3. Test Tasks
- Add new task
- Mark as complete
- Delete task
- Reorder tasks

### 4. Test Workouts
- Check weekly workout loads
- Toggle exercises
- Verify progress updates

### 5. Check Firestore Console
Go to Firestore console, verify data is being saved.

## 🔄 Data Migration (Optional)

If you want to migrate existing localStorage data to Firebase:

### Create Migration Script
```typescript
// scripts/migrate-to-firebase.ts
import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

async function migrateData(userId: string) {
  // Get localStorage data
  const tasks = JSON.parse(localStorage.getItem('dailyflow_tasks') || '[]');
  const workout = JSON.parse(localStorage.getItem('dailyflow_weekly_workout') || 'null');
  
  // Migrate tasks
  for (const task of tasks) {
    if (task.userId === userId) {
      await setDoc(doc(db, 'tasks', task.id), task);
      console.log('Migrated task:', task.id);
    }
  }
  
  // Migrate workout
  if (workout && workout.userId === userId) {
    const docId = `${userId}_${workout.weekId}`;
    await setDoc(doc(db, 'workouts', docId), workout);
    console.log('Migrated workout:', docId);
  }
  
  console.log('Migration complete!');
}

// Call in browser console:
// migrateData('your-user-id-here')
```

## 🚀 Deployment

### Vercel/Netlify
Environment variables will be automatically loaded from `.env.local` in development.

For production, add the same variables in:
- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables

### Build and Deploy
```bash
npm run build
npm start
```

## 📱 PWA Offline Support

Firebase data is cached automatically by Firestore SDK. 

For better offline experience, enable offline persistence:

```typescript
// lib/firebase.ts
import { enableIndexedDbPersistence } from 'firebase/firestore';

// After initializing Firestore
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Browser doesn\'t support offline');
  }
});
```

## ❗ Important Notes

1. **Authentication**: Firebase stores require user to be logged in (`userId`)
2. **Security**: Always use Firestore rules to protect user data
3. **Costs**: Firebase free tier includes:
   - 50k reads/day
   - 20k writes/day
   - 1GB storage
4. **Timer Store**: Keep timerStore in localStorage (session data)
5. **Quotes Cache**: Keep quote cache in localStorage (temporary data)

## 🆘 Troubleshooting

### Error: "Missing or insufficient permissions"
- Check Firestore rules are published
- Verify user is authenticated
- Check userId matches in queries

### Error: "Firebase not initialized"
- Check `.env.local` file exists
- Verify all environment variables are set
- Restart dev server after adding env vars

### Data not syncing
- Check browser console for errors
- Verify Firestore rules allow read/write
- Check network tab for Firestore requests

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
