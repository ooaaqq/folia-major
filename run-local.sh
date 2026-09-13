#!/usr/bin/env bash
set -euo pipefail

# Run the local fork with NixOS-compatible Electron and a full video-capable FFmpeg.
systemctl --user stop folia-wayland.service 2>/dev/null || true

exec nix shell nixpkgs#nodejs_24 nixpkgs#electron nixpkgs#ffmpeg-full --command bash -c '
  export ELECTRON_OVERRIDE_DIST_PATH="$(dirname "$(command -v electron)")"
  export FOLIA_FFMPEG_PATH="$(command -v ffmpeg)"
  export NIXOS_OZONE_WL=1
  npm run dev:electron
'
