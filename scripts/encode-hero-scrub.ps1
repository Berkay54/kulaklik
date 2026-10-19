# Portable FFmpeg can be provided explicitly; tools stay outside app dependencies.
param([string]$Ffmpeg = '.tools/package/ffmpeg.exe')
& $Ffmpeg -hide_banner -y -i public/media/hero-headphones.mp4 `
  -map 0:v:0 -an -c:v libx264 -preset fast -crf 12 `
  -g 1 -keyint_min 1 -sc_threshold 0 -bf 0 -pix_fmt yuv420p `
  -vsync 0 -video_track_timescale 30 -color_primaries bt709 `
  -color_trc bt709 -colorspace bt709 -color_range tv `
  -movflags +faststart public/media/hero-headphones-scrub.mp4
if ($LASTEXITCODE -ne 0) { throw 'Scrub encode failed' }
