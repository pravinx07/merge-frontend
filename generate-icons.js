import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, 'public', 'favicon.svg');
const publicDir = path.join(__dirname, 'public');

async function generateIcons() {
  console.log('Starting icon generation...');
  
  if (!fs.existsSync(svgPath)) {
    console.error(`Error: SVG file not found at ${svgPath}`);
    process.exit(1);
  }

  // 1. Generate standard icons
  const standardIcons = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
  ];

  for (const icon of standardIcons) {
    const outputPath = path.join(publicDir, icon.name);
    await sharp(svgPath)
      .resize(icon.size, icon.size)
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated standard icon: ${icon.name} (${icon.size}x${icon.size})`);
  }

  // 2. Generate maskable icons (padded on #0a0a0b background)
  const maskableIcons = [
    { name: 'pwa-maskable-192x192.png', size: 192 },
    { name: 'pwa-maskable-512x512.png', size: 512 },
  ];

  for (const icon of maskableIcons) {
    const outputPath = path.join(publicDir, icon.name);
    // Maskable icons require a safe-zone: the active icon should occupy ~60-70% of the canvas
    const iconSize = Math.round(icon.size * 0.65);
    
    // Render the SVG to a buffer at the smaller size
    const logoBuffer = await sharp(svgPath)
      .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    // Composite it over a solid brand-color background
    await sharp({
      create: {
        width: icon.size,
        height: icon.size,
        channels: 4,
        background: { r: 10, g: 10, b: 11, alpha: 1 } // #0a0a0b
      }
    })
      .composite([{ input: logoBuffer, gravity: 'center' }])
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated maskable icon: ${icon.name} (${icon.size}x${icon.size})`);
  }

  console.log('All PWA icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
