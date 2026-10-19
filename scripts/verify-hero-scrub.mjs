import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'

const probe = process.argv[2] ?? '.tools/probe/package/ffprobe.exe'
const originalPath = 'public/media/hero-headphones.mp4'
const optimizedPath = 'public/media/hero-headphones-scrub.mp4'
function inspect(path) {
  const data = JSON.parse(execFileSync(probe, ['-v', 'error', '-select_streams', 'v:0',
    '-show_streams', '-show_format', '-show_packets', '-show_entries',
    'stream:format:packet=pts_time,duration_time,flags', '-of', 'json', path], { maxBuffer: 8 * 1024 * 1024 }))
  const packets = data.packets.sort((a, b) => Number(a.pts_time) - Number(b.pts_time))
  return { stream: data.streams[0], format: data.format, packets }
}
const source = inspect(originalPath)
const optimized = inspect(optimizedPath)
const bytes = readFileSync(optimizedPath)
assert.equal(createHash('sha256').update(readFileSync(originalPath)).digest('hex'),
  '7b22b0802e02641cff0291d6a3a033ceab97762d4025a8ae8f023b20e39bd005', 'Original remains unchanged')
for (const property of ['width', 'height', 'r_frame_rate', 'avg_frame_rate', 'duration', 'nb_frames',
  'time_base', 'pix_fmt', 'sample_aspect_ratio', 'color_space', 'color_transfer', 'color_primaries', 'color_range']) {
  assert.equal(optimized.stream[property], source.stream[property], property)
}
assert.equal(optimized.stream.codec_name, 'h264')
assert.equal(optimized.stream.has_b_frames, 0)
assert.deepEqual(optimized.packets.map(({ pts_time, duration_time }) => [pts_time, duration_time]),
  source.packets.map(({ pts_time, duration_time }) => [pts_time, duration_time]), 'All presentation timestamps and frame durations match')
assert(optimized.packets.every(packet => packet.flags.includes('K')), 'Every frame must be independently seekable')
let moov = -1, mdat = -1
for (let offset = 0; offset + 8 <= bytes.length;) {
  const size = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8)
  if (type === 'moov') moov = offset
  if (type === 'mdat') mdat = offset
  if (size < 8) break
  offset += size
}
assert(moov >= 0 && mdat > moov, 'Faststart moov must precede mdat')
console.log(JSON.stringify({
  resolution: [optimized.stream.width, optimized.stream.height], fps: optimized.stream.avg_frame_rate,
  videoDuration: optimized.stream.duration, frames: optimized.packets.length,
  sourceKeyframes: source.packets.filter(packet => packet.flags.includes('K')).length,
  optimizedKeyframes: optimized.packets.length, firstTimestamp: optimized.packets[0].pts_time,
  finalTimestamp: optimized.packets.at(-1).pts_time, sourceBitrate: source.stream.bit_rate,
  optimizedBitrate: optimized.stream.bit_rate, bytes: bytes.length, faststart: true,
}, null, 2))
console.log('PASS: original hash, complete frame timeline, first/final frames, dimensions, FPS, color tags, all-intra, faststart')
