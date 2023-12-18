# Define variables
$homePath = $env:USERPROFILE
$profilePath = Join-Path $homePath "Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1"
$ydlxPath = Join-Path $homePath ".ydlx"

# Function to write to profile
function Write-Profile {
  $pattern = 'export PATH="$home\.ydlx\bin;$env:PATH"'

  # Check if the pattern exists in the profile
  if(Select-String -Path $profilePath -Pattern $pattern) {
    Write-Host "Pattern '$pattern' already exists in $profilePath."
  } else {
    Add-Content -Path $profilePath -Value $pattern
    Write-Host "Line containing '$pattern' added to $profilePath."
  }
}

# Clone repository
git clone https://github.com/gitlab-az1/ydlx.git "$env:TEMP\ydlx"

# Change directory
cd "$env:TEMP\ydlx"

# Install npm packages and build
npm install
npm run build

# Copy files to .ydlx directory
Copy-Item -Recurse -Force .\dist "$ydlxPath"
Copy-Item -Recurse -Force .\.script "$ydlxPath\.script"
Copy-Item -Recurse -Force .\package.build.json "$ydlxPath"
Copy-Item -Recurse -Force .\README.md "$ydlxPath"
Copy-Item -Recurse -Force .\LICENSE "$ydlxPath"

# Remove temporary directory
Remove-Item -Recurse -Force "$env:TEMP\ydlx"

# Change directory to .ydlx\.script
cd "$ydlxPath\.script"

# Create virtual environment
python3 -m venv .venv
chmod -R 777 .\.venv
.\.venv\Scripts\Activate.ps1

# Upgrade pip and install requirements
python3 -m pip install --upgrade pip
python3 -m pip install -r .\requirements.txt

# Change directory back to .ydlx
cd $ydlxPath

# Set permissions for .ydlx directory
chmod -R 777 $ydlxPath

# Rename files
Rename-Item .\package.build.json .\package.json
Rename-Item .\bin\main .\bin\ydlx

# Set permissions for ydlx executable
chmod -R 755 .\bin\ydlx

# Install ydlx
yarn install --production

# Write to the profile
Write-Profile

# Display installation success message
Write-Host "The installation was successful."
Write-Host ""
Write-Host "Now, to use ydlx, restart PowerShell."
