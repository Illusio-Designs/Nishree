@echo off
echo ========================================
echo   NISHREE FRONTEND - STARTING...
echo ========================================
echo.
echo Converting images to WebP...
call npm run convert-images
echo.
echo Starting development server...
echo.
call npm run dev
