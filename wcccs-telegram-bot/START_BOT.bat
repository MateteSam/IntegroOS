@echo off
echo ============================================
echo   WCCCS Command Center Bot - Launcher
echo ============================================
echo.
echo Checking dependencies...
pip install -r requirements.txt --quiet
echo.
echo Starting bot...
echo.
python bot.py
pause
