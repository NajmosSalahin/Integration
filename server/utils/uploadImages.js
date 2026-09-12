import { readdir, copyFile, mkdir } from 'fs/promises';
import { join, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cloudinary from './cloudinary.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_ROOT = join(__dirname, '../../Product Images');
const TEMP_DIR = join(__dirname, '../../temp_uploads');

const CATEGORIES = ['Plain_Tshirt_image', 'IU_Tshirt_image', 'Hoodies', 'Aesthetic_Tshirt_image'];

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function getImages(category) {
  const dir = join(IMAGES_ROOT, category);
  const files = await readdir(dir);
  return files.filter(f => extname(f).toLowerCase() === '.png').map(f => join(dir, f));
}

async function createCopies(imagePath, count) {
  const name = basename(imagePath, extname(imagePath));
  const ext = extname(imagePath);
  const copies = [];

  for (let i = 1; i <= count; i++) {
    const copyName = `${name}_${i}${ext}`;
    const copyPath = join(TEMP_DIR, copyName);
    await copyFile(imagePath, copyPath);
    copies.push(copyPath);
  }

  return copies;
}

async function uploadToCloudinary(filePath) {
  const name = basename(filePath, extname(filePath));
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'integration/products',
    public_id: name,
    overwrite: true,
  });
  return result.secure_url;
}

function getProductName(filename) {
  return basename(filename, extname(filename));
}

async function main() {
  await ensureDir(TEMP_DIR);

  const uploads = {};

  for (const category of CATEGORIES) {
    console.log(`\nProcessing ${category}...`);
    const images = await getImages(category);

    for (const imagePath of images) {
      const productName = getProductName(imagePath);
      console.log(`  Creating 3 copies of: ${productName}`);

      const copies = await createCopies(imagePath, 3);
      const urls = [];

      for (const copy of copies) {
        process.stdout.write(`    Uploading ${basename(copy)}... `);
        const url = await uploadToCloudinary(copy);
        urls.push(url);
        console.log('done');
      }

      uploads[productName] = urls;
    }
  }

  const outputPath = join(__dirname, 'uploaded_urls.json');
  const { writeFileSync } = await import('fs');
  writeFileSync(outputPath, JSON.stringify(uploads, null, 2));
  console.log(`\nAll uploads complete! URLs saved to ${outputPath}`);

  // Clean up temp dir
  const { rm } = await import('fs/promises');
  await rm(TEMP_DIR, { recursive: true, force: true });
  console.log('Temp files cleaned up.');
}

main().catch(err => {
  console.error('Upload failed:', err);
  process.exit(1);
});
