import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

function inspect(path) {
  const bytes = readFileSync(path)
  const result = { path, bytes: bytes.length, tracks: [] }
  let moov = -1
  let mdat = -1
  function walk(start, end, owner) {
    for (let offset = start; offset + 8 <= end;) {
      const size = bytes.readUInt32BE(offset)
      const type = bytes.toString('ascii', offset + 4, offset + 8)
      if (size < 8 || offset + size > end) throw new Error('Unsupported MP4 box')
      if (type === 'moov') moov = offset
      if (type === 'mdat') mdat = offset
      if (type === 'trak') {
        const track = {}
        result.tracks.push(track)
        walk(offset + 8, offset + size, track)
      } else if (['moov', 'mdia', 'minf', 'stbl'].includes(type)) {
        walk(offset + 8, offset + size, owner)
      }
      if (type === 'mvhd' || type === 'mdhd') {
        assert.equal(bytes[offset + 8], 0, 'Expected version 0 timing box')
        owner.timescale = bytes.readUInt32BE(offset + 20)
        owner.duration = bytes.readUInt32BE(offset + 24) / owner.timescale
      }
      if (type === 'hdlr') owner.type = bytes.toString('ascii', offset + 16, offset + 20)
      if (type === 'stsz') owner.frames = bytes.readUInt32BE(offset + 16)
      if (type === 'stss') owner.keyframes = bytes.readUInt32BE(offset + 12)
      if (type === 'stts') {
        owner.timing = Array.from({ length: bytes.readUInt32BE(offset + 12) }, (_, index) => [
          bytes.readUInt32BE(offset + 16 + index * 8),
          bytes.readUInt32BE(offset + 20 + index * 8),
        ])
      }
      if (type === 'tkhd') {
        owner.width = bytes.readUInt32BE(offset + size - 8) / 65536
        owner.height = bytes.readUInt32BE(offset + size - 4) / 65536
      }
      offset += size
    }
  }
  walk(0, bytes.length, result)
  const video = result.tracks.find(track => track.type === 'vide')
  // ISO BMFF: absent stss means every sample is a sync sample.
  video.keyframes ??= video.frames
  video.fps = video.frames / video.duration
  result.faststart = moov < mdat
  result.sha256 = createHash('sha256').update(bytes).digest('hex')
  return result
}

const source = inspect('public/media/headphones-exploded-scroll.mp4')
const scrub = inspect('public/media/headphones-exploded-scroll-scrub.mp4')
const original = source.tracks.find(track => track.type === 'vide')
const optimized = scrub.tracks.find(track => track.type === 'vide')
assert.equal(source.sha256, '5f4ca2b63dbae9eedec0d6be81c322adae58102dc31abf0130a91d75d2827b93')
for (const property of ['width', 'height', 'duration', 'fps', 'frames', 'timescale']) {
  assert.equal(optimized[property], original[property], property)
}
assert.deepEqual(optimized.timing, original.timing, 'Every frame timestamp must match')
assert.equal(scrub.duration, source.duration, 'Container duration')
assert.equal(optimized.keyframes, optimized.frames)
assert.equal(scrub.faststart, true)
console.log(JSON.stringify({ source, scrub }, null, 2))
console.log('PASS: original hash, resolution, durations, FPS, frame count, timestamps, all-keyframe encoding, fast start')
