import { readdir, copyFile, mkdir } from 'fs/promises';
import { join, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cloudinary from './cloudinary.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_ROOT = join(__dirname, '../../Product Images');
const TEMP_DIR = join(__dirname, '../../temp_uploads');

const CATEGORIES = [
  'Plain_Tshirt_image',
  'IU_Tshirt_image',
  'Hoodies',
  'Aesthetic_Tshirt_image',
  'Literature_Cover_Tshirt',
  'IDK Category',
  'Men_Shirt_image',
  'Womens_Tshirt_image',
  'Womens_Shirt_image',
  'Men_Cap_image',
  'Joggers_image',
  'Men_Handbag_image',
  'Women_Handbag_image',
  'Men_Backpack_image',
  'Women_Backpack_image',
  'ToteBag_image',
  'MessengerBag_image',
  'Men_Jeans_image',
  'Women_Jeans_image',
];

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function getImages(category) {
  const dir = join(IMAGES_ROOT, category);
  const files = await readdir(dir, { withFileTypes: true });
  const pngs = [];
  for (const entry of files) {
    if (entry.isDirectory()) {
      pngs.push(...await getImages(join(category, entry.name)));
    } else if (extname(entry.name).toLowerCase() === '.png') {
      pngs.push(join(dir, entry.name));
    }
  }
  return pngs;
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

const MAX_ATTEMPTS = 3;

async function uploadToCloudinary(filePath) {
  const name = basename(filePath, extname(filePath));
  const safeName = name.replace(/&/g, 'and').replace(/[/\\?#%*:"<>|]/g, '-');

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'integration/products',
        public_id: safeName,
        overwrite: true,
      });
      return result.secure_url;
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) throw err;
      console.log(`    Retrying (${attempt}/${MAX_ATTEMPTS}) after error...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
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
