import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../src/assets/—Pngtree—texture of recycled cardboard with_15735637 1.jpg');
const outputPath = path.join(__dirname, '../src/assets/—Pngtree—texture of recycled cardboard with_15735637 1.webp');

console.log('🔄 Converting large background image...');
console.log('⚠️  This may take a moment...\n');

async function convertLargeImage() {
  try {
    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    console.log(`📐 Original dimensions: ${metadata.width}x${metadata.height}`);
    console.log(`📦 Original size: ${(fs.statSync(inputPath).size / 1024 / 1024).toFixed(2)} MB\n`);

    // Try with lower quality and resize if needed
    let quality = 75;
    let resize = null;
    
    // If image is very large, resize it
    if (metadata.width > 2000 || metadata.height > 2000) {
      resize = { width: 2000, height: 2000, fit: 'inside' };
      console.log('📏 Resizing to max 2000px...');
    }

    const sharpInstance = sharp(inputPath);
    
    if (resize) {
      sharpInstance.resize(resize);
    }

    await sharpInstance
      .webp({ quality, effort: 6, smartSubsample: true })
      .toFile(outputPath);

    const originalSize = fs.statSync(inputPath).size;
    const webpSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(2);

    console.log(`\n✅ Successfully converted!`);
    console.log(`📦 New size: ${(webpSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`💾 Savings: ${savings}%`);
    
    // Delete original
    fs.unlinkSync(inputPath);
    console.log(`🗑️  Deleted original JPG file`);
    
    console.log('\n✨ Conversion complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 The image might be too large. Consider using a smaller version.');
  }
}

convertLargeImage();
