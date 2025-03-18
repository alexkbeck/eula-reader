const fs = require('fs');
const { createCanvas } = require('canvas');

// If you don't have the canvas package installed, you'll need to install it:
// npm install canvas

// Icon sizes needed
const sizes = [16, 24, 32, 48, 128];

// Generate icons for each size
sizes.forEach(size => {
  // Create canvas with the specified size
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fill background with the theme color
  ctx.fillStyle = '#1976d2';
  ctx.fillRect(0, 0, size, size);
  
  // Draw a simple document icon
  ctx.fillStyle = 'white';
  
  // Document outline
  const padding = Math.max(1, Math.floor(size * 0.1));
  const docWidth = Math.floor(size * 0.7);
  const docHeight = Math.floor(size * 0.8);
  const cornerSize = Math.max(2, Math.floor(size * 0.15));
  
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding + docWidth - cornerSize, padding);
  ctx.lineTo(padding + docWidth, padding + cornerSize);
  ctx.lineTo(padding + docWidth, padding + docHeight);
  ctx.lineTo(padding, padding + docHeight);
  ctx.closePath();
  ctx.fill();
  
  // Folded corner
  ctx.fillStyle = '#1976d2';
  ctx.beginPath();
  ctx.moveTo(padding + docWidth - cornerSize, padding);
  ctx.lineTo(padding + docWidth, padding + cornerSize);
  ctx.lineTo(padding + docWidth - cornerSize, padding + cornerSize);
  ctx.closePath();
  ctx.fill();
  
  // Text lines
  if (size >= 24) {
    ctx.fillStyle = '#1976d2';
    const lineHeight = Math.max(1, Math.floor(size * 0.08));
    const lineWidth = Math.floor(docWidth * 0.7);
    const startY = padding + Math.floor(size * 0.25);
    const startX = padding + Math.floor(size * 0.15);
    
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(startX, startY + (i * lineHeight * 2), lineWidth, lineHeight);
    }
  }
  
  // Save the icon to a file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`icon${size}.png`, buffer);
  
  console.log(`Generated icon${size}.png`);
});

console.log('All icons generated successfully!'); 