@echo off
echo ========================================
echo DailyFlow - Switch to LocalStorage
echo ========================================
echo.

echo [1/2] Restoring localStorage stores...
if exist store\taskStore.localStorage.backup.ts (
    copy /Y store\taskStore.localStorage.backup.ts store\taskStore.ts >nul
    echo   ✓ taskStore.ts restored from backup
) else (
    echo   ✗ No backup found for taskStore.ts
)

if exist store\workoutStore.localStorage.backup.ts (
    copy /Y store\workoutStore.localStorage.backup.ts store\workoutStore.ts >nul
    echo   ✓ workoutStore.ts restored from backup
) else (
    echo   ✗ No backup found for workoutStore.ts
)

echo.
echo [2/2] Cleanup...
echo   ✓ Switched back to localStorage

echo.
echo ========================================
echo Rollback Complete!
echo ========================================
echo.
echo Restart dev server: npm run dev
echo.
pause
