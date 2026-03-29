import { type NextRequest } from "next/server";

const REPO = "xs-lang0/xs";

const shScript = `#!/bin/sh
set -e

REPO="${REPO}"
INSTALL_DIR="\${XS_INSTALL_DIR:-\$HOME/.xs}"
BIN_DIR="\$INSTALL_DIR/bin"

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

  local url="https://github.com/\$REPO/releases/latest/download/xs-\$os-\$arch"

  echo "installing xs..."
  echo "  os:   \$os"
  echo "  arch: \$arch"
  echo ""

  mkdir -p "\$BIN_DIR"

  curl -fsSL "\$url" -o "\$BIN_DIR/xs"
  chmod +x "\$BIN_DIR/xs"

  echo "xs installed to \$BIN_DIR/xs"
  echo ""

  if ! echo "\$PATH" | grep -q "\$BIN_DIR"; then
    local shell_name=\$(basename "\$SHELL")
    local rc=""
    case "\$shell_name" in
      bash) rc="\$HOME/.bashrc" ;;
      zsh)  rc="\$HOME/.zshrc" ;;
      fish) rc="\$HOME/.config/fish/config.fish" ;;
    esac

    if [ -n "\$rc" ]; then
      echo "export PATH=\\"\$BIN_DIR:\\\$PATH\\"" >> "\$rc"
      echo "added \$BIN_DIR to PATH in \$rc"
      echo "run 'source \$rc' or restart your shell"
    else
      echo "add \$BIN_DIR to your PATH manually"
    fi
  fi

  echo ""
  "\$BIN_DIR/xs" --version
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

main
`;

const psScript = `#Requires -Version 5.1
$ErrorActionPreference = "Stop"

$Repo = "${REPO}"
$InstallDir = if ($env:XS_INSTALL_DIR) { $env:XS_INSTALL_DIR } else { "$env:USERPROFILE\\.xs" }
$BinDir = "$InstallDir\\bin"

$Arch = if ([Environment]::Is64BitOperatingSystem) {
  if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "aarch64" } else { "x86_64" }
} else {
  Write-Error "xs requires a 64-bit system"; exit 1
}

$Url = "https://github.com/$Repo/releases/latest/download/xs-windows-$Arch.exe"

Write-Host "installing xs..."
Write-Host "  os:   windows"
Write-Host "  arch: $Arch"
Write-Host ""

New-Item -ItemType Directory -Force -Path $BinDir | Out-Null

Invoke-WebRequest -Uri $Url -OutFile "$BinDir\\xs.exe" -UseBasicParsing

Write-Host "xs installed to $BinDir\\xs.exe"
Write-Host ""

$UserPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($UserPath -notlike "*$BinDir*") {
  [Environment]::SetEnvironmentVariable("PATH", "$BinDir;$UserPath", "User")
  Write-Host "added $BinDir to user PATH"
  Write-Host "restart your terminal for PATH changes to take effect"
}

Write-Host ""
& "$BinDir\\xs.exe" --version
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
