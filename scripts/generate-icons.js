const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  // Read SVG
  const svgPath = './public/icon.svg';
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  
  // Create a temporary HTML to render SVG
  const img = await loadImage(svgPath);
  
  for (const size of sizes) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Draw image scaled to size
    ctx.drawImage(img, 0, 0, size, size);
    
    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`./public/icon-${size}x${size}.png`, buffer);
    console.log(`Generated icon-${size}x${size}.png`);
  }
  
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
