import { type NextRequest } from "next/server";

const REPO = "xs-lang0/xs";

const shScript = `#!/bin/sh
set -e

REPO="${REPO}"
INSTALL_DIR="\${XS_INSTALL_DIR:-/usr/local/bin}"
TMP_DIR="\$(mktemp -d)"

cleanup() { rm -rf "\$TMP_DIR" 2>/dev/null; }
trap cleanup EXIT

err() { echo "error: \$1" >&2; exit 1; }
need() { command -v "\$1" >/dev/null 2>&1 || err "need '\$1' (not found)"; }

main() {
  need curl
  need uname

  os=\$(uname -s | tr '[:upper:]' '[:lower:]')
  arch=\$(uname -m)

  case "\$os" in
    linux)  os="linux" ;;
    darwin) os="macos" ;;
    *) err "unsupported OS: \$os" ;;
  esac

  case "\$arch" in
    x86_64|amd64) arch="x86_64" ;;
    aarch64|arm64)
      echo "note: no native arm64 build yet; falling back to x86_64 (rosetta on apple silicon)" >&2
      arch="x86_64"
      ;;
    *) err "unsupported arch: \$arch" ;;
  esac

  asset="xs-\${os}-\${arch}"
  url="https://github.com/\${REPO}/releases/latest/download/\${asset}"

  echo "installing xs..."
  echo "  os:   \$os"
  echo "  arch: \$arch"
  echo ""

  echo "  downloading binary..."
  curl -fsSL "\$url" -o "\$TMP_DIR/xs" || err "download failed: \$url"

  echo "  verifying..."
  curl -fsSL "\$url.sha256" -o "\$TMP_DIR/xs.sha256" || err "checksum download failed"
  expected=\$(awk '{print \$1}' "\$TMP_DIR/xs.sha256")
  if command -v sha256sum >/dev/null 2>&1; then
    actual=\$(cd "\$TMP_DIR" && sha256sum xs | awk '{print \$1}')
  else
    actual=\$(cd "\$TMP_DIR" && shasum -a 256 xs | awk '{print \$1}')
  fi
  [ "\$expected" = "\$actual" ] || err "checksum mismatch (got \$actual, expected \$expected)"

  chmod +x "\$TMP_DIR/xs"

  echo "  installing to \$INSTALL_DIR..."
  if [ -w "\$INSTALL_DIR" ]; then
    mv "\$TMP_DIR/xs" "\$INSTALL_DIR/xs"
  else
    sudo mv "\$TMP_DIR/xs" "\$INSTALL_DIR/xs"
  fi

  echo ""
  echo "installed."
  echo "run: xs --version"
  echo "upgrade later: xs upgrade"
}

main
`;

const psScript = `#Requires -Version 5.1
$ErrorActionPreference = "Stop"

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Error "run this from an elevated (admin) PowerShell"
  exit 1
}

$Repo = "xs-lang0/xs"
$InstallDir = if ($env:XS_INSTALL_DIR) { $env:XS_INSTALL_DIR } else { "C:\\xs" }
$BinDir = "$InstallDir\\bin"

$Arch = if ([Environment]::Is64BitOperatingSystem) {
  if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") {
    Write-Host "note: no native arm64 build yet; falling back to x86_64 (windows x64 emulation)"
  }
  "x86_64"
} else {
  Write-Error "xs requires a 64-bit system"; exit 1
}

Write-Host "installing xs..."
Write-Host "  os:   windows"
Write-Host "  arch: $Arch"
Write-Host ""

New-Item -ItemType Directory -Force -Path $BinDir | Out-Null

$Asset = "xs-windows-$Arch.zip"
$Url = "https://github.com/$Repo/releases/latest/download/$Asset"
$TmpDir = New-Item -ItemType Directory -Force -Path "$env:TEMP\\xs-install-$([guid]::NewGuid().Guid)"
$Zip = "$($TmpDir.FullName)\\xs.zip"
$Sum = "$($TmpDir.FullName)\\xs.zip.sha256"

try {
  Write-Host "  downloading binary..."
  Invoke-WebRequest -Uri $Url -OutFile $Zip -UseBasicParsing

  Write-Host "  verifying..."
  Invoke-WebRequest -Uri "$Url.sha256" -OutFile $Sum -UseBasicParsing
  $Expected = (Get-Content $Sum).Split()[0].ToLower()
  $Actual = (Get-FileHash -Algorithm SHA256 -Path $Zip).Hash.ToLower()
  if ($Actual -ne $Expected) {
    Write-Error "checksum mismatch (got $Actual, expected $Expected)"
    exit 1
  }

  Write-Host "  extracting..."
  Expand-Archive -Path $Zip -DestinationPath $TmpDir.FullName -Force

  $Exe = "$BinDir\\xs.exe"
  if (Test-Path $Exe) {
    try { Remove-Item -Force $Exe } catch {
      Write-Warning "could not replace $Exe (in use?). Close any xs processes and re-run."
      exit 1
    }
  }
  Copy-Item -Force "$($TmpDir.FullName)\\xs-windows-$Arch.exe" $Exe

  $SysPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
  if ($SysPath -notlike "*$BinDir*") {
    [Environment]::SetEnvironmentVariable("Path", "$BinDir;$SysPath", "Machine")
    Write-Host "  added $BinDir to system PATH"
  }
} finally {
  Remove-Item -Recurse -Force $TmpDir.FullName -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "installed."
Write-Host "  binary: $Exe"
Write-Host "restart your terminal, then run: xs --version"
Write-Host "upgrade later: xs upgrade"
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
