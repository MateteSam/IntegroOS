#!/usr/bin/env python3
"""
Simple script to start the Flask backend server
"""
import os
import sys
import subprocess

def main():
    # Change to backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    print("Starting Marketing Brain Command Center Backend...")
    print(f"Working directory: {backend_dir}")
    
    # Check if virtual environment exists
    venv_path = os.path.join(backend_dir, 'venv')
    if not os.path.exists(venv_path):
        print("Virtual environment not found. Creating one...")
        subprocess.run([sys.executable, '-m', 'venv', 'venv'])
        
    # Activate virtual environment and install requirements
    if os.name == 'nt':  # Windows
        pip_path = os.path.join(venv_path, 'Scripts', 'pip.exe')
        python_path = os.path.join(venv_path, 'Scripts', 'python.exe')
    else:  # Unix/Linux/Mac
        pip_path = os.path.join(venv_path, 'bin', 'pip')
        python_path = os.path.join(venv_path, 'bin', 'python')
    
    # Install requirements
    print("Installing requirements...")
    subprocess.run([pip_path, 'install', '-r', 'requirements.txt'])
    
    # Start the Flask app
    print("Starting Flask server on http://localhost:5000")
    subprocess.run([python_path, 'app.py'])

if __name__ == '__main__':
    main()