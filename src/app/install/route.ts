import { type NextRequest } from "next/server";

const REPO = "xs-lang0/xsi";

const shScript = `#!/bin/sh
set -e

REPO="${REPO}"
TMP_DIR="\$(mktemp -d)"

main() {
  need_cmd curl
  need_cmd uname

  local os arch
  os=\$(uname -s | tr '[:upper:]' '[:lower:]')
  arch=\$(uname -m)

  case "\$os" in
    linux)  os="linux" ;;
    darwin) os="macos" ;;
    *)      err "unsupported OS: \$os" ;;
  esac

  case "\$arch" in
    x86_64|amd64)  arch="x86_64" ;;
    aarch64|arm64) arch="aarch64" ;;
    *)             err "unsupported architecture: \$arch" ;;
  esac

  local url="https://github.com/\$REPO/releases/latest/download/xsi-\$os-\$arch"

  echo "installing xs..."
  echo "  os:   \$os"
  echo "  arch: \$arch"
  echo ""

  curl -fsSL "\$url" -o "\$TMP_DIR/xsi"
  chmod +x "\$TMP_DIR/xsi"

  sudo "\$TMP_DIR/xsi" install --auto

  rm -rf "\$TMP_DIR"
}

need_cmd() {
  if ! command -v "\$1" > /dev/null 2>&1; then
    err "need '\$1' (not found)"
  fi
}

err() {
  echo "error: \$1" >&2
  exit 1
}

cleanup() {
  rm -rf "\$TMP_DIR" 2>/dev/null
}

trap cleanup EXIT
main
`;

const psScript = `#Requires -Version 5.1
$ErrorActionPreference = "Stop"

# require admin
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Error "run this from an elevated (admin) PowerShell"
  exit 1
}

$XsRepo = "xs-lang0/xs"
$XsiRepo = "xs-lang0/xsi"
$InstallDir = "C:\\xs"
$BinDir = "$InstallDir\\bin"
$LibDir = "$InstallDir\\lib"
$CacheDir = "$InstallDir\\cache"

$Arch = if ([Environment]::Is64BitOperatingSystem) {
  if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "aarch64" } else { "x86_64" }
} else {
  Write-Error "xs requires a 64-bit system"; exit 1
}

Write-Host "installing xs..."
Write-Host "  os:   windows"
Write-Host "  arch: $Arch"
Write-Host ""

# create directories
foreach ($d in @($BinDir, $LibDir, $CacheDir)) {
  New-Item -ItemType Directory -Force -Path $d | Out-Null
}

# download as zip to avoid antivirus blocking exe writes
$XsZip = "$CacheDir\\xs.zip"
$XsiZip = "$CacheDir\\xsi.zip"

$XsUrl = "https://github.com/$XsRepo/releases/latest/download/xs-windows-$Arch.zip"
Write-Host "  downloading xs..."
Invoke-WebRequest -Uri $XsUrl -OutFile $XsZip -UseBasicParsing

$XsiUrl = "https://github.com/$XsiRepo/releases/latest/download/xsi-windows-$Arch.zip"
Write-Host "  downloading xsi..."
Invoke-WebRequest -Uri $XsiUrl -OutFile $XsiZip -UseBasicParsing

Write-Host "  extracting..."
# extract to temp dir to avoid conflicts with existing files
$ExtractDir = "$CacheDir\\extract"
Remove-Item -Recurse -Force $ExtractDir -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $ExtractDir | Out-Null
Expand-Archive -Path $XsZip -DestinationPath $ExtractDir -Force
Expand-Archive -Path $XsiZip -DestinationPath $ExtractDir -Force
# remove old binaries first
Remove-Item -Force "$BinDir\\xs.exe" -ErrorAction SilentlyContinue
Remove-Item -Force "$BinDir\\xsi.exe" -ErrorAction SilentlyContinue
# copy fresh binaries with correct names
Copy-Item -Force "$ExtractDir\\xs-windows-$Arch.exe" "$BinDir\\xs.exe"
Copy-Item -Force "$ExtractDir\\xsi-windows-$Arch.exe" "$BinDir\\xsi.exe"
Remove-Item -Recurse -Force $ExtractDir -ErrorAction SilentlyContinue
Remove-Item -Force $XsZip, $XsiZip -ErrorAction SilentlyContinue

# add to system PATH
$SysPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($SysPath -notlike "*$BinDir*") {
  [Environment]::SetEnvironmentVariable("Path", "$BinDir;$SysPath", "Machine")
  Write-Host "  added $BinDir to system PATH"
} else {
  Write-Host "  PATH already contains $BinDir"
}

Write-Host ""
Write-Host "setup complete!"
Write-Host "  install dir: $InstallDir"
Write-Host "  xs binary:   $BinDir\\xs.exe"
Write-Host "  xsi binary:  $BinDir\\xsi.exe"
Write-Host "  lib dir:     $LibDir"
Write-Host "  cache dir:   $CacheDir"
Write-Host ""
Write-Host "restart your terminal, then run: xs --version"
Write-Host ""
Read-Host "press enter to close"
`;

export async function GET(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  const isWindows = /powershell|windowspowershell|pwsh|microsoft/i.test(ua);

  return new Response(isWindows ? psScript : shScript, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
