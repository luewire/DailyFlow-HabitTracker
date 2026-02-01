# 🔥 Quick Start: Firebase Migration

## TL;DR - Cara Tercepat

### 1️⃣ Setup Firebase Project (5 menit)
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik "Add project" → nama: `dailyflow`
3. Di project overview, klik icon Web `</>` → nama: `DailyFlow Web`
4. **Copy firebaseConfig yang muncul!**
5. Enable Firestore: Build → Firestore Database → Create
6. Enable Auth: Build → Authentication → Email/Password

### 2️⃣ Configure App (2 menit)
```bash
# Copy template
copy .env.local.example .env.local

# Edit .env.local dan paste Firebase config yang tadi dicopy
notepad .env.local
```

### 3️⃣ Switch to Firebase (1 klik)
```bash
# Windows
.\switch-to-firebase.bat

# Atau manual
npm run dev
```

### 4️⃣ Setup Firestore Rules (1 menit)
Di Firebase Console → Firestore → Rules tab, paste ini:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
                          request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    match /workouts/{workoutId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Klik **Publish**!

## ✅ Test
1. `npm run dev`
2. Login → Add task → Check di Firestore Console

## 🔄 Rollback
```bash
.\switch-to-localstorage.bat
```

## 📖 Full Guide
Lihat `FIREBASE-MIGRATION.md` untuk detail lengkap.

## ❓ Troubleshooting

**Error: "Missing or insufficient permissions"**
→ Publish Firestore rules!

**Error: "Firebase not initialized"**
→ Check `.env.local` ada dan terisi dengan benar
→ Restart `npm run dev`

**Data tidak muncul**
→ Check browser console untuk error
→ Pastikan sudah login
→ Check Firestore console apakah data tersimpan
