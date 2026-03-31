const REPO = "xs-lang0/xsi";

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

New-Item -ItemType Directory -Force -Path $TmpDir | Out-Null

try {
  Invoke-WebRequest -Uri $Url -OutFile "$TmpDir\\xsi.exe" -UseBasicParsing
  & "$TmpDir\\xsi.exe" install --auto
} finally {
  Remove-Item -Recurse -Force $TmpDir -ErrorAction SilentlyContinue
}
`;

export async function GET() {
  return new Response(psScript, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
