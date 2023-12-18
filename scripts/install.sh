#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Function to write to write to the .bashrc file
write_bashrc() {
  filename="$HOME/.bashrc"
  pattern="export PATH"

  # Use grep to find the line number containing the pattern
  line_number=$(grep -nF "$pattern" "$filename" | cut -d':' -f1)

  # Check if the pattern was found
  if [ -n "$line_number" ]; then
    # Use sed to delete the line with the specified line number
    sed -i "${line_number}d" "$filename"
    echo "Line containing '$pattern' deleted from $filename."
  else
    echo "Pattern '$pattern' not found in $filename."
  fi

  cp "$HOME/.bashrc" "$HOME/.bashrc.bak"

  # Write the new line to the file
  echo 'export PATH="$HOME/.ydlx/bin:$PATH"' >> "$HOME/.bashrc"
}

# Clone the repository
git clone https://github.com/gitlab-az1/ydlx.git /tmp/ydlx

# Change directory
cd /tmp/ydlx

# Install npm packages and build
yarn install
yarn build

# Copy files to .ydlx directory
sudo cp -r /tmp/ydlx/dist "$HOME/.ydlx"
sudo cp -r /tmp/ydlx/.script "$HOME/.ydlx/.script"
sudo cp -r /tmp/ydlx/package.build.json "$HOME/.ydlx"
sudo cp -r /tmp/ydlx/README.md "$HOME/.ydlx"
sudo cp -r /tmp/ydlx/LICENSE "$HOME/.ydlx"

# Remove temporary directory
sudo rm -rf /tmp/ydlx

# Change directory to .ydlx\.script
cd "$HOME/.ydlx/.script"

# Create a python3 virtual environment
sudo python3 -m venv .venv
sudo chmod -R 777 ./.venv/
source ./.venv/bin/activate

# Upgrade pip and install requirements
python3 -m pip install --upgrade pip
python3 -m pip install -r ./requirements.txt

# Change directory back to .ydlx
cd ..

# Set permissions for .ydlx directory
sudo chmod -R 777 "$HOME/.ydlx"

# Rename files
mv ./package.build.json ./package.json
mv ./bin/main ./bin/ydlx

# Set permissions for ydlx executable
sudo chmod -R 755 ./bin/ydlx

# Install ydlx production dependencies
yarn install --production

# Display installation success message
echo "The installation was successful."
echo ""
echo "Now, to use the ydlx you must add the following line to your .bashrc file:"
echo "  export PATH=\"\$HOME/.ydlx/bin:\$PATH\""
echo ""
echo "And reset your terminal."