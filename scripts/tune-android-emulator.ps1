$ErrorActionPreference = "Stop"

$emulators = adb devices | Select-String "emulator-" | ForEach-Object {
  ($_ -split "\s+")[0]
}

if (-not $emulators -or $emulators.Count -eq 0) {
  Write-Host "No running emulator found. Start an Android emulator first."
  exit 1
}

foreach ($id in $emulators) {
  Write-Host "Tuning $id ..."

  # Ensure emulator network shaper is not effectively disabled.
  adb -s $id emu network speed lte | Out-Null
  adb -s $id emu network delay none | Out-Null

  # Disable UI animations for snappier test interactions.
  adb -s $id shell settings put global window_animation_scale 0 | Out-Null
  adb -s $id shell settings put global transition_animation_scale 0 | Out-Null
  adb -s $id shell settings put global animator_duration_scale 0 | Out-Null

  # Keep default readable font scale and print current display profile.
  adb -s $id shell settings put system font_scale 1.0 | Out-Null
  $size = adb -s $id shell wm size
  $density = adb -s $id shell wm density
  $network = adb -s $id emu network status
  $routes = adb -s $id shell ip route

  Write-Host "  $size"
  Write-Host "  $density"
  Write-Host "  Network:"
  $network | ForEach-Object { Write-Host "    $_" }
  Write-Host "  Routes:"
  $routes | ForEach-Object { Write-Host "    $_" }

  if (-not ($routes | Select-String "default")) {
    Write-Host "  WARNING: No default route detected in emulator."
    Write-Host "  Appium may become unstable until emulator networking is restored (cold boot recommended)."
  }

  Write-Host "  Animation scales set to 0"
}

Write-Host "Emulator tuning complete."
