const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const ICON_SIZES = [16, 32, 48, 128];
const PRIMARY_COLOR = '#4CAF50';
const ICONS_DIR = path.join(__dirname, '..', 'src', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
}

function generateIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Calculate rounded corner radius (2px for 16px, scaled for others)
    const cornerRadius = Math.max(2, Math.floor(size / 8));
    
    // Draw rounded rectangle background
    ctx.beginPath();
    ctx.moveTo(cornerRadius, 0);
    ctx.lineTo(size - cornerRadius, 0);
    ctx.quadraticCurveTo(size, 0, size, cornerRadius);
    ctx.lineTo(size, size - cornerRadius);
    ctx.quadraticCurveTo(size, size, size - cornerRadius, size);
    ctx.lineTo(cornerRadius, size);
    ctx.quadraticCurveTo(0, size, 0, size - cornerRadius);
    ctx.lineTo(0, cornerRadius);
    ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
    ctx.closePath();
    
    // Fill with primary color
    ctx.fillStyle = PRIMARY_COLOR;
    ctx.fill();
    
    // Add "TF" text
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = Math.floor(size * 0.5);
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillText('TF', size / 2, size / 2);
    
    // Save the icon
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(ICONS_DIR, `icon${size}.png`), buffer);
    console.log(`Generated icon${size}.png`);
}

// Generate all icon sizes
ICON_SIZES.forEach(generateIcon);
console.log('All icons generated successfully!');