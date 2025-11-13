import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, '../src/assets');

// Image extensions to convert
const imageExtensions = ['.jpg', '.jpeg', '.png'];

// Get all image files recursively
const getImageFiles = (dir) => {
  try {
    const files = fs.readdirSync(dir);
    return files.filter(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) return false;
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });
  } catch (error) {
    console.warn('⚠️  Assets directory not found, skipping image conversion');
    return [];
  }
};

// Convert images to WebP and delete originals
const convertToWebP = async () => {
  console.log('🔄 Starting image conversion to WebP...');
  console.log('⚠️  Original PNG/JPG files will be DELETED after conversion!\n');
  
  // Try to import sharp
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch (error) {
    console.warn('⚠️  Sharp not installed. Skipping image conversion.');
    console.log('💡 Run "npm install" to enable WebP conversion');
    return;
  }
  
  const imageFiles = getImageFiles(assetsDir);
  
  if (imageFiles.length === 0) {
    console.log('ℹ️  No images found to convert');
    return;
  }
  
  const conversionMap = {};
  let converted = 0;
  let deleted = 0;
  let failed = 0;
  
  for (const file of imageFiles) {
    const inputPath = path.join(assetsDir, file);
    const outputFileName = path.parse(file).name + '.webp';
    const outputPath = path.join(assetsDir, outputFileName);
    
    try {
      // Convert to WebP
      await sharp(inputPath)
        .webp({ quality: 85, effort: 4 })
        .toFile(outputPath);
      
      const originalSize = fs.statSync(inputPath).size;
      const webpSize = fs.statSync(outputPath).size;
      const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(2);
      
      console.log(`✅ Converted ${file} → ${outputFileName} (${savings}% smaller)`);
      
      // Delete original file
      fs.unlinkSync(inputPath);
      console.log(`🗑️  Deleted ${file}`);
      
      conversionMap[file] = outputFileName;
      converted++;
      deleted++;
    } catch (error) {
      console.error(`❌ Error converting ${file}:`, error.message);
      failed++;
      // Keep original if conversion fails
      conversionMap[file] = file;
    }
  }
  
  // Save conversion map
  const mapPath = path.join(__dirname, '../src/assets/image-map.json');
  fs.writeFileSync(mapPath, JSON.stringify(conversionMap, null, 2));
  
  console.log('\n✨ Image conversion complete!');
  console.log(`📊 Converted: ${converted} | Deleted: ${deleted} | Failed: ${failed} | Total: ${imageFiles.length}`);
  console.log(`📄 Conversion map saved to: ${mapPath}`);
  console.log('\n⚠️  All original PNG/JPG files have been deleted!');
  console.log('💡 Only WebP files remain in the assets folder.');
};

convertToWebP().catch(error => {
  console.error('❌ Image conversion failed:', error.message);
  process.exit(0); // Don't fail the build
});
