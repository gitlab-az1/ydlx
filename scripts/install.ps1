# Clone the Git repository
git clone https://github.com/gitlab-az1/ydlx.git C:\Temp\ydlx

# Navigate to the cloned repository
cd C:\Temp\ydlx

# Install Node.js dependencies and build the project
npm install
npm run build

# Copy files to the installation directory (C:\Users\<YourUsername>\.ydlx)
Copy-Item -Recurse -Force .\dist "$env:USERPROFILE\.ydlx"
Copy-Item -Recurse -Force .\.script "$env:USERPROFILE\.ydlx"
Copy-Item -Recurse -Force .\package.build.json "$env:USERPROFILE\.ydlx"
Copy-Item -Recurse -Force .\README.md "$env:USERPROFILE\.ydlx"
Copy-Item -Recurse -Force .\LICENSE "$env:USERPROFILE\.ydlx"

# Remove the temporary directory
Remove-Item -Recurse -Force C:\Temp\ydlx

# Navigate to the installation directory
cd "$env:USERPROFILE\.ydlx"

# Set up a Python virtual environment
python -m venv .venv
. .\.venv\Scripts\Activate

# Upgrade pip and install Python dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Rename files and directories
Rename-Item .\package.build.json .\package.json
Rename-Item .\bin\main .\bin\ydlx

# Modify the user's profile to include the tool's binary directory in the PATH
$profilePath = "$env:USERPROFILE\Documents\PowerShell\Microsoft.PowerShell_profile.ps1"
Add-Content $profilePath -Value "``$env:PATH += \";$env:USERPROFILE\.ydlx\bin\""

# Reload the PowerShell profile to apply the changes
. $profilePath
