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

$Repo = "${REPO}"
$TmpDir = Join-Path $env:TEMP "xsi-install"

$Arch = if ([Environment]::Is64BitOperatingSystem) {
  if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "aarch64" } else { "x86_64" }
} else {
  Write-Error "xs requires a 64-bit system"; exit 1
}

$Url = "https://github.com/$Repo/releases/latest/download/xsi-windows-$Arch.exe"

Write-Host "installing xs..."
Write-Host "  os:   windows"
Write-Host "  arch: $Arch"
Write-Host ""

Remove-Item -Recurse -Force $TmpDir -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $TmpDir | Out-Null

try {
  Invoke-WebRequest -Uri $Url -OutFile "$TmpDir\\xsi.exe" -UseBasicParsing
  Start-Process -FilePath "$TmpDir\\xsi.exe" -ArgumentList "install","--auto" -Wait -Verb RunAs
} finally {
  Remove-Item -Recurse -Force $TmpDir -ErrorAction SilentlyContinue
}
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
