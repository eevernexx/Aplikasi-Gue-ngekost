import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');

// Full-bleed green background keeps the maskable variant safe (glyph stays
// within the central ~60%, well inside the maskable safe zone).
const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#1B4332"/>
  <rect x="146" y="190" width="220" height="156" rx="26" fill="#52B788"/>
  <rect x="146" y="190" width="220" height="50" rx="26" fill="#40916C"/>
  <rect x="146" y="214" width="220" height="26" fill="#40916C"/>
  <rect x="280" y="258" width="100" height="64" rx="16" fill="#D8F3DC"/>
  <circle cx="324" cy="290" r="15" fill="#1B4332"/>
  <path d="M170 190 L256 146 L342 190 Z" fill="#40916C"/>
</svg>
`;

const targets = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

await mkdir(outDir, { recursive: true });

const buf = Buffer.from(svg);
await Promise.all(
  targets.map(({ name, size }) =>
    sharp(buf).resize(size, size).png().toFile(join(outDir, name))
  )
);

console.log(`Generated ${targets.length} icons in ${outDir}`);
