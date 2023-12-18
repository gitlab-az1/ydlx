git clone https://github.com/gitlab-az1/ydlx.git /tmp/ydlx

cd /tmp/ydlx
npm install
npm run build

sudo cp -r /tmp/ydlx/dist "$HOME/.ydlx"
sudo cp -r /tmp/ydlx/.script "$HOME/.ydlx"
sudo cp -r /tmp/ydlx/package.build.json "$HOME/.ydlx"
sudo cp -r /tmp/ydlx/README.md "$HOME/.ydlx"
sudo cp -r /tmp/ydlx/LICENSE "$HOME/.ydlx"

sudo rm -rf /tmp/ydlx

cd "$HOME/.ydlx"

python3 -m venv .venv
source .venv/bin/activate

python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

mv ./package.build.json ./package.json
mv ./bin/main ./bin/ydlx

cp "$HOME/.bashrc" "$HOME/.bashrc.bak"
echo "PATH=\$PATH:$HOME/.ydlx/bin\nexport PATH" >> "$HOME/.bashrc"

