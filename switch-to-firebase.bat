@echo off
echo ========================================
echo DailyFlow - Switch to Firebase Storage
echo ========================================
echo.

echo [1/3] Backing up localStorage stores...
if exist store\taskStore.ts (
    copy store\taskStore.ts store\taskStore.localStorage.backup.ts >nul
    echo   ✓ taskStore.ts backed up
)
if exist store\workoutStore.ts (
    copy store\workoutStore.ts store\workoutStore.localStorage.backup.ts >nul
    echo   ✓ workoutStore.ts backed up
)

echo.
echo [2/3] Switching to Firebase stores...
if exist store\taskStore.firebase.ts (
    copy /Y store\taskStore.firebase.ts store\taskStore.ts >nul
    echo   ✓ taskStore.ts updated to Firebase version
)
if exist store\workoutStore.firebase.ts (
    copy /Y store\workoutStore.firebase.ts store\workoutStore.ts >nul
    echo   ✓ workoutStore.ts updated to Firebase version
)

echo.
echo [3/3] Checking environment...
if exist .env.local (
    echo   ✓ .env.local found
) else (
    echo   ✗ .env.local not found!
    echo.
    echo   Please create .env.local with Firebase credentials:
    echo   NEXT_PUBLIC_FIREBASE_API_KEY=...
    echo   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    echo   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    echo   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    echo   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    echo   NEXT_PUBLIC_FIREBASE_APP_ID=...
)

echo.
echo ========================================
echo Migration Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure .env.local has Firebase credentials
echo 2. Setup Firestore security rules
echo 3. Restart dev server: npm run dev
echo.
echo To rollback, run: switch-to-localstorage.bat
echo.
pause
