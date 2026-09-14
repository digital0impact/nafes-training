@echo off
chcp 65001 >nul
echo Adding all changes...
git add -A
echo.
echo Status:
git status
echo.
set /p msg="Commit message (or press Enter for default): "
if "%msg%"=="" set msg=إزالة القيم الافتراضية من صفحة الطالبة وتحسينات رفع الاختبارات
git commit -m "%msg%"
echo.
echo Pushing to GitHub...
git push origin main
if errorlevel 1 git push origin master
echo.
pause
