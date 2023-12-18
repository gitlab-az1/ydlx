# ydlx - Open Source YouTube Downloader

## Installation

### For Windows

1. **Download the installation script:**
```powershell
wget https://github.com/gitlab-az1/ydlx/blob/main/scripts/install.ps1 -O install.ps1
```

2. **Run the installation script:**
```powershell
powershell -ExecutionPolicy Bypass -File ./install.ps1
```

### For Linux

1. **Download the installation script:**
```bash
wget https://github.com/gitlab-az1/ydlx/blob/main/scripts/install.sh -O install.sh
```

2. **Change the permissions of the installation script:**
```bash
sudo chmod +x ./install.sh
```

3. **Run the installation script:**
```bash
./install.sh
```

or

```bash
bash ./install.sh
```


## Usage

```bash
ydlx <url or video id> [options]
```

### Options

| Option | Description |
| --- | --- |
| `-h`, `--help` | Show help message and exit. |
| `-v`, `--version` | Show program's version number and exit. |
| `-q`, `--quality` | Specify the video quality. You can use a predefined quality like "high" or "low", or you can use a custom quality like "720p". |
| `-o`, `--output` | Specify the output directory. |
| `--audio-only` | Download only the audio. |
| `--set-name` | Set the name of the output file. |