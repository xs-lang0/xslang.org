const REPO = "xs-lang0/xs";

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

export async function GET() {
  return new Response(psScript, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
