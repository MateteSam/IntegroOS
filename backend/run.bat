@echo off
echo Starting Marketing Brain Command Center Backend...
cd /d "%~dp0"

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install requirements
echo Installing requirements...
pip install -r requirements.txt

REM Start the Flask app
echo Starting Flask server on http://localhost:5000
python app.py
pause
