import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const iconsDir = path.join(__dirname, '..', 'public', 'icons')
fs.mkdirSync(iconsDir, { recursive: true })

function makeSVG(size) {
  const r = Math.round(size * 0.22)
  const fontSize = Math.round(size * 0.48)
  const cy = Math.round(size * 0.63)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#080c14"/>
  <rect width="${size}" height="${size}" rx="${r}" fill="none" stroke="#F5C842" stroke-width="${Math.round(size * 0.03)}" stroke-opacity="0.4"/>
  <text x="${size / 2}" y="${cy}" font-family="Arial, sans-serif" font-size="${fontSize}" text-anchor="middle" fill="#F5C842">⚡</text>
</svg>`
}

// Tulis SVG
fs.writeFileSync(path.join(iconsDir, 'icon-192.svg'), makeSVG(192))
fs.writeFileSync(path.join(iconsDir, 'icon-512.svg'), makeSVG(512))

// Buat PNG minimal yang valid menggunakan Uint8Array
// PNG spec: signature + IHDR + IDAT (solid color) + IEND
import { createHash } from 'crypto'
import { deflateSync } from 'zlib'

function crc32(buf) {
  let crc = 0xFFFFFFFF
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    table[i] = c
  }
  for (const byte of buf) crc = table[(crc ^ byte) & 0xFF] ^ (crc >>> 8)
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcInput = Buffer.concat([typeBytes, data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(crcInput))
  return Buffer.concat([len, typeBytes, data, crcBuf])
}

function makePNG(size) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR: width, height, bit depth=8, color type=2 (RGB), compression=0, filter=0, interlace=0
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(size, 0)
  ihdrData.writeUInt32BE(size, 4)
  ihdrData[8] = 8   // bit depth
  ihdrData[9] = 2   // color type RGB
  ihdrData[10] = 0  // compression
  ihdrData[11] = 0  // filter
  ihdrData[12] = 0  // interlace

  // Background color #080c14 = 8, 12, 20
  // Gold color #F5C842 = 245, 200, 66
  const bg = [8, 12, 20]
  const gold = [245, 200, 66]

  // Buat raw image data — background solid dengan lightning bolt area gold
  const rowSize = 1 + size * 3 // filter byte + RGB per pixel
  const rawData = Buffer.alloc(size * rowSize)

  for (let y = 0; y < size; y++) {
    rawData[y * rowSize] = 0 // filter type None
    for (let x = 0; x < size; x++) {
      const cx = x - size / 2
      const cy = y - size / 2
      const r = size * 0.42

      // Lingkaran latar (rounded square approximation)
      const inBg = Math.abs(cx) < r && Math.abs(cy) < r

      // Lightning bolt shape (sederhana)
      const boltX = cx / (size * 0.12)
      const boltY = cy / (size * 0.25)
      const inBolt = inBg && (
        (boltY < 0 && boltX > -1 && boltX < 0.5 + boltY * 0.5) ||
        (boltY >= 0 && boltX > -0.5 + boltY * 0.3 && boltX < 1)
      )

      const color = !inBg ? [0, 0, 0] : inBolt ? gold : bg
      const offset = y * rowSize + 1 + x * 3
      rawData[offset] = color[0]
      rawData[offset + 1] = color[1]
      rawData[offset + 2] = color[2]
    }
  }

  const compressed = deflateSync(rawData)
  const idat = chunk('IDAT', compressed)
  const iend = chunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, chunk('IHDR', ihdrData), idat, iend])
}

for (const size of [192, 512]) {
  const png = makePNG(size)
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.png`), png)
  console.log(`Created icon-${size}.png (${png.length} bytes)`)
}

console.log('Icons created successfully')
