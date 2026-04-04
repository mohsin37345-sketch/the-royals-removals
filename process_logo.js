const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processLogo() {
  const input = path.join(__dirname, 'images', 'logo.jpg');
  
  if (!fs.existsSync(input)) {
    console.error('Input file does not exist:', input);
    return;
  }
  
  try {
    // 1. Full logo with trimmed whitespace and transparent background
    const trimmedBuffer = await sharp(input)
      .trim({ background: '#ffffff', threshold: 10 })
      .toBuffer();

    const { data, info } = await sharp(trimmedBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
        data[i + 3] = 0; // alpha to 0
      }
    }

    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png()
    .toFile(path.join(__dirname, 'images', 'logo_trimmed.png'));
      
    // 2. Favicon (square)
    await sharp(input)
      .trim({ background: '#ffffff', threshold: 10 })
      .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(path.join(__dirname, 'images', 'favicon.png'));
      
    // 3. Apple Touch Icon (180x180)
    await sharp(input)
      .trim({ background: '#ffffff', threshold: 10 })
      .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(path.join(__dirname, 'images', 'apple-touch-icon.png'));
      
    // 4. OG Image (1200x630)
    await sharp(input)
      .trim({ background: '#ffffff', threshold: 10 })
      .extend({
        top: 50, bottom: 50, left: 50, right: 50,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .resize(1200, 630, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(path.join(__dirname, 'images', 'og-image.jpg'));
      
    console.log('Images processed successfully.');
  } catch (err) {
    console.error('Error processing images:', err);
  }
}

processLogo();
