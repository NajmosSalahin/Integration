import mongoose from 'mongoose';
import Product from '../models/Product.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env.development') });

const MONGO_URI = process.env.MONGO_URI;

const PRICE = 450;
const HOODIE_PRICE = 950;
const SHIRT_PRICE = 750;

const plainTees = [
  { name: 'Premium Solid Black T-shirt', color: 'Black', tags: ['plain', 'solid', 'black'] },
  { name: 'Premium Pure White T-shirt', color: 'White', tags: ['plain', 'solid', 'white'] },
  { name: 'Premium Sand Beige T-shirt', color: 'Sand Beige', tags: ['plain', 'solid', 'beige'] },
  { name: 'Premium Olive Green T-shirt', color: 'Olive Green', tags: ['plain', 'solid', 'green'] },
  { name: 'Premium Navy Blue T-shirt', color: 'Navy Blue', tags: ['plain', 'solid', 'blue'] },
  { name: 'Premium Maroon Red T-shirt', color: 'Maroon Red', tags: ['plain', 'solid', 'red'] },
  { name: 'Premium Heather Grey T-shirt', color: 'Heather Grey', tags: ['plain', 'solid', 'grey'] },
];

const iuTees = [
  { name: 'Sotota Fountain ~ Islamic University ~ Premium Black T-shirt', design: 'Sotota Fountain', tags: ['iu', 'fountain', 'landmark', 'popular'], featured: true },
  { name: 'Shaheed Monument ~ Islamic University ~ Premium Black T-shirt', design: 'Shaheed Monument', tags: ['iu', 'monument', 'landmark'], featured: true },
  { name: 'Mukta Bangla ~ Islamic University ~ Premium Black T-shirt', design: 'Mukta Bangla', tags: ['iu', 'typography', 'bangla', 'popular'], featured: true },
  { name: 'Mofiz Lake Bridge ~ Islamic University ~ Premium Black T-shirt', design: 'Mofiz Lake Bridge', tags: ['iu', 'nature', 'bridge'] },
  { name: 'IUian Multi-Monument Retro ~ Islamic University ~ Premium Black T-shirt', design: 'Multi-Monument Retro', tags: ['iu', 'retro', 'multi'] },
  { name: 'IUian Grunge Element Strips ~ Islamic University ~ Premium Black T-shirt', design: 'Grunge Element Strips', tags: ['iu', 'grunge', 'strips'] },
  { name: 'IUian Festival Doodle Art ~ Islamic University ~ Premium Black T-shirt', design: 'Festival Doodle Art', tags: ['iu', 'doodle', 'festival'] },
  { name: 'IU Gate ~ Islamic University ~ Premium Black T-shirt', design: 'IU Gate', tags: ['iu', 'gate', 'landmark', 'popular'] },
  { name: 'SDS ~ Islamic University ~ Premium Black T-shirt', design: 'SDS', tags: ['iu', 'sds', 'typography'] },
  { name: 'Islamic University ~ Horizontal Strips ~ Premium Black T-shirt.png', display: 'Islamic University ~ Horizontal Strips ~ Premium Black T-shirt', design: 'Horizontal Strips', tags: ['iu', 'strips', 'minimal'] },
  { name: 'Central Mosque ~ Islamic University ~ Premium Black T-shirt', design: 'Central Mosque', tags: ['iu', 'mosque', 'landmark', 'popular'], featured: true },
  { name: 'Lain Islamic University ~ Premium Solid Black T-shirt', design: 'Lain', tags: ['iu', 'lain', 'anime', 'typography'] },
  { name: 'A Day in Five Frames Islamic University ~ Premium Solid Black T-shirt', design: 'A Day in Five Frames', tags: ['iu', 'landmark', 'art'] },
  { name: 'Misty Crossing Islamic University ~ Premium Solid Black T-shirt', design: 'Misty Crossing', tags: ['iu', 'nature', 'bridge'] },
  { name: 'Rainy Paradise Road Islamic University ~ Premium Solid Black T-shirt', design: 'Rainy Paradise Road', tags: ['iu', 'campus', 'rain'] },
  { name: 'Rainy Red Double-Decker Islamic University ~ Premium Solid Black T-shirt', design: 'Rainy Red Double-Decker', tags: ['iu', 'double-decker', 'rain'] },
  { name: 'Red Double-Decker Islamic University ~ Premium Solid Black T-shirt', design: 'Red Double-Decker', tags: ['iu', 'double-decker', 'landmark'], featured: true },
  { name: 'Sunset Over Central Mosque Islamic University ~ Premium Solid Black T-shirt', design: 'Sunset Over Central Mosque', tags: ['iu', 'mosque', 'sunset'] },
  { name: 'Symmetry From Above Islamic University ~ Premium Solid Black T-shirt', design: 'Symmetry From Above', tags: ['iu', 'aerial', 'campus'] },
  { name: 'The Central Mosque Islamic University ~ Premium Solid Black T-shirt', design: 'The Central Mosque', tags: ['iu', 'mosque', 'landmark', 'popular'], featured: true },
  { name: 'The Foggy Bridge Islamic University ~ Premium Solid Black T-shirt', design: 'The Foggy Bridge', tags: ['iu', 'nature', 'bridge', 'fog'] },
  { name: 'TSCC - Milonayoton Islamic University ~ Premium Solid Black T-shirt', design: 'TSCC - Milonayoton', tags: ['iu', 'tscc', 'landmark'] },
  { name: 'TSCC Islamic University ~ Premium Solid Black T-shirt', design: 'TSCC', tags: ['iu', 'tscc', 'landmark', 'popular'], featured: true },
];

const hoodies = [
  { name: 'Premium Chocolate Brown Hoodie', color: 'Chocolate Brown', price: HOODIE_PRICE, tags: ['premium', 'chocolate', 'brown'] },
];

const menShirts = [
  { name: 'Integration Classic Poplin ~ Premium Navy Long-Sleeve Shirt', design: 'Classic Poplin', tags: ['long-sleeve', 'classic', 'poplin', 'navy'] },
  { name: 'Integration Denim Weave ~ Premium Navy Long-Sleeve Shirt', design: 'Denim Weave', tags: ['long-sleeve', 'denim', 'casual', 'navy'] },
  { name: 'Integration Flannel Edition ~ Premium Navy Long-Sleeve Shirt', design: 'Flannel Edition', tags: ['long-sleeve', 'flannel', 'warm', 'navy'] },
  { name: 'Integration Oxford Button-Down ~ Premium Navy Long-Sleeve Shirt', design: 'Oxford Button-Down', tags: ['long-sleeve', 'oxford', 'formal', 'navy'] },
];

const aestheticTees = [
  { name: 'Mount Fuji Torii ~ Premium Solid Black T-shirt', design: 'Mount Fuji Torii', tags: ['japanese', 'mountain', 'torii', 'minimal'] },
  { name: 'Oriental Mountain Landscape ~ Premium Solid Black T-shirt', design: 'Oriental Mountain Landscape', tags: ['japanese', 'landscape', 'nature'] },
  { name: 'Ramen Neko ~ Premium Solid Black T-shirt', design: 'Ramen Neko', tags: ['japanese', 'ramen', 'cute', 'illustration'] },
  { name: 'Retro Fallout ~ Premium Black T-shirt', design: 'Retro Fallout', tags: ['retro', 'vintage', 'text'] },
  { name: 'What If It Works Out ~ Premium Solid Black T-shirt', design: 'What If It Works Out', tags: ['motivational', 'text', 'minimal'] },
  { name: 'Offline Life Is The Ultimate Luxury ~ Premium Solid Black T-shirt', design: 'Offline Life Is The Ultimate Luxury', tags: ['lifestyle', 'text', 'minimal'] },
  { name: 'Kneeling Skeleton Lotus ~ Premium Solid Black T-shirt', design: 'Kneeling Skeleton Lotus', tags: ['spiritual', 'skeleton', 'lotus', 'illustration'] },
  { name: 'Serendipity ~ Premium Solid Black T-shirt', design: 'Serendipity', tags: ['serendipity', 'minimal', 'text'] },
  { name: 'Where Am I ~ Premium Solid Black T-shirt', design: 'Where Am I', tags: ['introspective', 'text', 'minimal'] },
  { name: 'Abbey Road ~ Premium Solid Black T-shirt', design: 'Abbey Road', tags: ['music', 'vintage', 'crosswalk', 'iconic'] },
  { name: 'Ankle Acquired Cat ~ Premium Solid Black T-shirt', design: 'Ankle Acquired Cat', tags: ['japanese', 'cat', 'meme', 'illustration'] },
  { name: 'Cowboy Bebop Oh Well ~ Premium Solid Black T-shirt', design: 'Cowboy Bebop Oh Well', tags: ['japanese', 'anime', 'space', 'retro'] },
  { name: 'Drained Cat ~ Premium Solid Black T-shirt', design: 'Drained Cat', tags: ['japanese', 'cat', 'mood', 'illustration'] },
  { name: 'Johan Liebert - Monster ~ Premium Solid Black T-shirt', design: 'Johan Liebert - Monster', tags: ['japanese', 'anime', 'thriller', 'illustration'] },
  { name: 'Lucky Black Cat ~ Premium Solid Black T-shirt', design: 'Lucky Black Cat', tags: ['cat', 'luck', 'minimal', 'illustration'] },
  { name: 'Marlboro Juice Box ~ Premium Solid Black T-shirt', design: 'Marlboro Juice Box', tags: ['retro', 'vintage', 'packaging', 'illustration'] },
  { name: 'Maybe Silence Was The Cleanest Goodbye ~ Premium Solid Black T-shirt', design: 'Maybe Silence Was The Cleanest Goodbye', tags: ['introspective', 'text', 'minimal', 'quote'] },
  { name: 'Meet You Like The Wind ~ Premium Solid Black T-shirt', design: 'Meet You Like The Wind', tags: ['romantic', 'text', 'minimal', 'quote'] },
  { name: 'Night Village ~ Premium Solid Black T-shirt', design: 'Night Village', tags: ['japanese', 'landscape', 'night', 'nature'] },
  { name: 'Ponyo Comic Panel ~ Premium Solid Black T-shirt', design: 'Ponyo Comic Panel', tags: ['japanese', 'anime', 'film', 'illustration'] },
  { name: 'Focus Quiet Desk ~ Premium Solid Black T-shirt', design: 'Focus Quiet Desk', tags: ['focus', 'calm', 'minimal', 'desk'] },
  { name: 'Im Proud Of You Anime ~ Premium Solid Black T-shirt', design: 'Im Proud Of You Anime', tags: ['anime', 'affection', 'emotional', 'illustration'] },
  { name: 'Melancholy Rushing Water ~ Premium Solid Black T-shirt', design: 'Melancholy Rushing Water', tags: ['japanese', 'melancholy', 'water', 'landscape'] },
  { name: 'Metanoia  ~ Premium Solid Black T-shirt', design: 'Metanoia', tags: ['introspective', 'minimal', 'text', 'change'] },
  { name: 'Mt Fuji Lawson Convenience Store ~ Premium Solid Black T-shirt', design: 'Mt Fuji Lawson Convenience Store', tags: ['japanese', 'fuji', 'convenience', 'retro'] },
  { name: 'No Internet Bench Rain - 2 ~ Premium Solid Black T-shirt', design: 'No Internet Bench Rain - 2', tags: ['sad', 'rain', 'bench', 'illustration'] },
  { name: 'No Internet Bench Rain ~ Premium Solid Black T-shirt', design: 'No Internet Bench Rain', tags: ['sad', 'rain', 'bench', 'illustration'] },
  { name: 'No Internet Dino ~ Premium Solid Black T-shirt', design: 'No Internet Dino', tags: ['dino', 'nostalgia', 'fun', 'illustration'] },
  { name: 'No Internet Night City ~ Premium Solid Black T-shirt', design: 'No Internet Night City', tags: ['night', 'city', 'cyberpunk', 'illustration'] },
  { name: 'Peaked Mountaineer ~ Premium Solid Black T-shirt', design: 'Peaked Mountaineer', tags: ['mountain', 'peak', 'achievement', 'illustration'] },
  { name: 'Preserve My Memories Liquifies ~ Premium Solid Black T-shirt', design: 'Preserve My Memories Liquifies', tags: ['nostalgia', 'melancholy', 'memory', 'text'] },
  { name: 'The World Is Too Noisy Take Care Of Yourself ~ Premium Solid Black T-shirt', design: 'The World Is Too Noisy Take Care Of Yourself', tags: ['selfcare', 'quiet', 'encouragement', 'text'] },
  { name: 'This User Is Losing Interest In Everything ~ Premium Solid Black T-shirt', design: 'This User Is Losing Interest In Everything', tags: ['burnout', 'mood', 'humor', 'text'] },
  { name: 'What A Privilege ~ Premium Solid Black T-shirt', design: 'What A Privilege', tags: ['gratitude', 'privilege', 'text', 'life'] },
  { name: 'Wordless Maya World ~ Premium Solid Black T-shirt', design: 'Wordless Maya World', tags: ['minimal', 'conceptual', 'illustration', 'maya'] },
  { name: 'Your Time Graphic ~ Premium Solid Black T-shirt', design: 'Your Time Graphic', tags: ['time', 'hourglass', 'graphic', 'abstract'] },
  { name: 'Asa & Yoru Chainsaw Man ~ Premium Solid Black T-shirt', design: 'Asa & Yoru Chainsaw Man', tags: ['japanese', 'anime', 'chainsaw man', 'illustration'] },
  { name: 'Chainsaw Man Asa Mitaka Yoru ~ Premium Solid Black T-shirt', design: 'Chainsaw Man Asa Mitaka Yoru', tags: ['japanese', 'anime', 'chainsaw man', 'illustration'] },
  { name: "I'm Proud Of You ~ Premium Solid Black T-shirt", design: "I'm Proud Of You", tags: ['affection', 'emotional', 'illustration', 'quote'] },
  { name: 'Kyoto ~ Premium Solid Black T-shirt', design: 'Kyoto', tags: ['japanese', 'city', 'landscape', 'night'] },
  { name: 'Makima ~ Premium Solid Black T-shirt', design: 'Makima', tags: ['japanese', 'anime', 'illustration'] },
  { name: 'Mt Fuji Lawson ~ Premium Solid Black T-shirt', design: 'Mt Fuji Lawson', tags: ['japanese', 'fuji', 'convenience', 'retro'] },
  { name: 'Naoki Urasawa Monster ~ Premium Solid Black T-shirt', design: 'Naoki Urasawa Monster', tags: ['japanese', 'anime', 'thriller', 'illustration'] },
  { name: 'Only Dead Fish Go With The Flow ~ Premium Solid Black T-shirt', design: 'Only Dead Fish Go With The Flow', tags: ['motivational', 'text', 'minimal', 'quote'] },
  { name: 'Reggae Retro ~ Premium Solid Black T-shirt', design: 'Reggae Retro', tags: ['reggae', 'retro', 'music', 'vintage'] },
  { name: 'Retro Reggae Palette ~ Premium Solid Black T-shirt', design: 'Retro Reggae Palette', tags: ['reggae', 'retro', 'palette', 'vintage'] },
  { name: 'Sea Wolf ~ Premium Solid Black T-shirt', design: 'Sea Wolf', tags: ['animal', 'wolf', 'ocean', 'illustration'] },
  { name: 'Smoking Kills ~ Premium Solid Black T-shirt', design: 'Smoking Kills', tags: ['retro', 'vintage', 'warning', 'typography'] },
  { name: 'Smoking Kills Slow ~ Premium Solid Black T-shirt', design: 'Smoking Kills Slow', tags: ['retro', 'vintage', 'warning', 'typography'] },
  { name: 'Sony HF-S90 ~ Premium Solid Black T-shirt', design: 'Sony HF-S90', tags: ['retro', 'cassette', 'packaging', 'vintage'] },
  { name: 'Tsuki Ga Kirei Desu Ne ~ Premium Solid Black T-shirt', design: 'Tsuki Ga Kirei Desu Ne', tags: ['japanese', 'moon', 'romantic', 'text'] },
  { name: "We All Get Addicted To Something That Takes Away The Pain ~ Premium Solid Black T-shirt", design: "We All Get Addicted To Something That Takes Away The Pain", tags: ['deep', 'text', 'introspective', 'quote'] },
  { name: 'Wordless ~ Premium Solid Black T-shirt', design: 'Wordless', tags: ['minimal', 'conceptual', 'illustration'] },
  { name: "You're Going To Die Anyway ~ Premium Solid Black T-shirt", design: "You're Going To Die Anyway", tags: ['memento mori', 'philosophical', 'text', 'minimal'] },
  { name: 'Anime Eyes A Thousand Stories ~ Premium Solid Black T-shirt', design: 'Anime Eyes A Thousand Stories', tags: ['japanese', 'anime', 'minimal', 'illustration'] },
  { name: 'Chain Smoking Cat ~ Premium Solid Black T-shirt', design: 'Chain Smoking Cat', tags: ['cat', 'retro', 'meme', 'illustration'] },
  { name: 'Fight Club ~ Premium Solid Black T-shirt', design: 'Fight Club', tags: ['movie', 'film', 'iconic', 'vintage', 'popular'], featured: true },
  { name: 'Find Your Crew ~ Premium Solid Black T-shirt', design: 'Find Your Crew', tags: ['motivational', 'text', 'minimal'] },
  { name: 'Glitch in the Code ~ Premium Solid Black T-shirt', design: 'Glitch in the Code', tags: ['tech', 'glitch', 'minimal', 'digital'] },
  { name: 'Japan Stamp Collection ~ Premium Solid Black T-shirt', design: 'Japan Stamp Collection', tags: ['japanese', 'stamps', 'retro', 'collection'] },
  { name: 'Kyoto Travel Deeper ~ Premium Solid Black T-shirt', design: 'Kyoto Travel Deeper', tags: ['japanese', 'kyoto', 'travel', 'retro'] },
  { name: 'Lose Your Mind Find Your Soul ~ Premium Solid Black T-shirt', design: 'Lose Your Mind Find Your Soul', tags: ['spiritual', 'text', 'minimal', 'quote'] },
  { name: 'One Piece Wano Country (ワノ国) ~ Premium Solid Black T-shirt', design: 'One Piece Wano Country (ワノ国)', tags: ['japanese', 'anime', 'one piece', 'illustration', 'popular'] },
  { name: 'Ramen Neko ~ Premium Solid Black T-shirt (2)', design: 'Ramen Neko ~ Premium Solid Black T-shirt (2)', tags: ['japanese', 'ramen', 'cat', 'illustration'] },
  { name: 'Ramen Vinyl ~ Premium Solid Black T-shirt', design: 'Ramen Vinyl', tags: ['japanese', 'ramen', 'vinyl', 'retro'] },
  { name: 'Roronoa Zoro ~ Premium Solid Black T-shirt', design: 'Roronoa Zoro', tags: ['japanese', 'anime', 'one piece', 'illustration', 'popular'], featured: true },
  { name: 'Stacked Stones Red Sun ~ Premium Solid Black T-shirt', design: 'Stacked Stones Red Sun', tags: ['japanese', 'zen', 'minimal', 'sun'] },
  { name: 'Surrounded by Fish ~ Premium Solid Black T-shirt', design: 'Surrounded by Fish', tags: ['japanese', 'fish', 'art', 'illustration'] },
  { name: 'The Climber (孤高の人) ~ Premium Solid Black T-shirt', design: 'The Climber (孤高の人)', tags: ['japanese', 'mountain', 'climber', 'illustration'] },
  { name: 'Walking Toward the Light ~ Premium Solid Black T-shirt', design: 'Walking Toward the Light', tags: ['minimal', 'hopeful', 'abstract', 'illustration'] },
];

const literatureTees = [
  { name: 'Abhishapto ~ Premium Solid Black T-shirt', design: 'Abhishapto', tags: ['bangla', 'literature', 'classic'] },
  { name: 'Aguner Poroshmoni ~ Premium Solid Black T-shirt', design: 'Aguner Poroshmoni', tags: ['bangla', 'literature', 'poetry'] },
  { name: 'Amar Aachhe Jol ~ Premium Solid Black T-shirt', design: 'Amar Aachhe Jol', tags: ['bangla', 'literature', 'poetry'] },
  { name: 'Aranyak ~ Premium Solid Black T-shirt', design: 'Aranyak', tags: ['bangla', 'literature', 'classic'] },
  { name: 'Aranyer Dinratri ~ Premium Solid Black T-shirt', design: 'Aranyer Dinratri', tags: ['bangla', 'literature', 'classic', 'popular'] },
  { name: 'Aranyok ~ Premium Solid Black T-shirt', design: 'Aranyok', tags: ['bangla', 'literature', 'classic'] },
  { name: 'Badal Diner Ditiyo Kadam Phul ~ Premium Solid Black T-shirt', design: 'Badal Diner Ditiyo Kadam Phul', tags: ['bangla', 'literature', 'poetry'] },
  { name: 'Chander Amabashya ~ Premium Solid Black T-shirt', design: 'Chander Amabashya', tags: ['bangla', 'literature', 'novel'] },
  { name: 'Chander Pahar ~ Premium Solid Black T-shirt', design: 'Chander Pahar', tags: ['bangla', 'literature', 'adventure', 'popular'] },
  { name: 'Chilekothar Sepai ~ Premium Solid Black T-shirt', design: 'Chilekothar Sepai', tags: ['bangla', 'literature', 'classic'] },
  { name: 'Dhusar Pandulipi ~ Premium Solid Black T-shirt', design: 'Dhusar Pandulipi', tags: ['bangla', 'literature', 'classic'] },
  { name: 'Hansuli Banker Upakatha ~ Premium Solid Black T-shirt', design: 'Hansuli Banker Upakatha', tags: ['bangla', 'literature', 'novel'] },
  { name: 'Hazar Bachhar Dhare ~ Premium Solid Black T-shirt', design: 'Hazar Bachhar Dhare', tags: ['bangla', 'literature', 'classic'] },
  { name: 'Ichhamati ~ Premium Solid Black T-shirt', design: 'Ichhamati', tags: ['bangla', 'literature', 'novel'] },
  { name: 'Lalsalu ~ Premium Solid Black T-shirt', design: 'Lalsalu', tags: ['bangla', 'literature', 'novel', 'popular'] },
  { name: 'Manasamangal ~ Premium Solid Black T-shirt', design: 'Manasamangal', tags: ['bangla', 'literature', 'epic'] },
  { name: 'Megh Boleche Jabo Jabo ~ Premium Solid Black T-shirt', design: 'Megh Boleche Jabo Jabo', tags: ['bangla', 'literature', 'poetry'] },
  { name: 'Nishithe ~ Premium Solid Black T-shirt', design: 'Nishithe', tags: ['bangla', 'literature', 'classic'] },
  { name: 'Nishithini ~ Premium Solid Black T-shirt', design: 'Nishithini', tags: ['bangla', 'literature', 'classic'] },
  { name: 'Padatika ~ Premium Solid Black T-shirt', design: 'Padatika', tags: ['bangla', 'literature', 'classic'] },
  { name: 'Padma Nadir Majhi ~ Premium Solid Black T-shirt', design: 'Padma Nadir Majhi', tags: ['bangla', 'literature', 'novel', 'popular'] },
  { name: 'Pather Panchali ~ Premium Solid Black T-shirt', design: 'Pather Panchali', tags: ['bangla', 'literature', 'classic', 'popular'], featured: true },
  { name: 'Pathik ~ Premium Solid Black T-shirt', design: 'Pathik', tags: ['bangla', 'literature', 'classic'] },
  { name: 'Rupasi Bangla ~ Premium Solid Black T-shirt', design: 'Rupasi Bangla', tags: ['bangla', 'literature', 'poetry'] },
  { name: 'Sandhya ~ Premium Solid Black T-shirt', design: 'Sandhya', tags: ['bangla', 'literature', 'poetry'] },
  { name: 'Sojon Badiyar Ghat ~ Premium Solid Black T-shirt', design: 'Sojon Badiyar Ghat', tags: ['bangla', 'literature', 'novel'] },
  { name: 'Sonar Tori ~ Premium Solid Black T-shirt', design: 'Sonar Tori', tags: ['bangla', 'literature', 'poetry', 'popular'] },
  { name: 'Srabon Megher Din ~ Premium Solid Black T-shirt', design: 'Srabon Megher Din', tags: ['bangla', 'literature', 'movie', 'classic'] },
  { name: 'Titas Ekti Nadir Naam 2 ~ Premium Solid Black T-shirt', design: 'Titas Ekti Nadir Naam 2', tags: ['bangla', 'literature', 'novel'] },
  { name: 'Titas Ekti Nadir Naam ~ Premium Solid Black T-shirt', design: 'Titas Ekti Nadir Naam', tags: ['bangla', 'literature', 'novel', 'popular'] },
  { name: 'Tithidor ~ Premium Solid Black T-shirt', design: 'Tithidor', tags: ['bangla', 'literature', 'novel'] },
];

function loadUrls() {
  const raw = readFileSync(join(__dirname, 'uploaded_urls.json'), 'utf-8');
  return JSON.parse(raw);
}

function buildProducts(urls) {
  const products = [];

  for (const tee of plainTees) {
    products.push({
      title: tee.name,
      description: `Premium solid ${tee.color} t-shirt from Integration. Heavy cotton, clean finish. A versatile essential that works across every setting — minimal design, maximum quality.`,
      price: tee.price || PRICE,
      images: urls[tee.name] || [],
      sizes: ['S', 'M', 'L', 'XL'],
      sizeGuideNote: 'Standard fit. True to size.',
      stock: [
        { size: 'S', inStock: true },
        { size: 'M', inStock: true },
        { size: 'L', inStock: true },
        { size: 'XL', inStock: true },
      ],
      tags: ['mens-tshirts', ...tee.tags],
      active: true,
    });
  }

  for (const tee of iuTees) {
    products.push({
      title: tee.display || tee.name,
      description: `Premium black t-shirt featuring the "${tee.design}" design representing Islamic University. Heavy cotton, bold print. For those who carry their campus pride everywhere.`,
      price: tee.price || PRICE,
      images: urls[tee.name] || [],
      sizes: ['S', 'M', 'L', 'XL'],
      sizeGuideNote: 'Standard fit. True to size.',
      stock: [
        { size: 'S', inStock: true },
        { size: 'M', inStock: true },
        { size: 'L', inStock: true },
        { size: 'XL', inStock: true },
      ],
      tags: ['iu-tshirts', ...tee.tags],
      active: true,
      featured: !!tee.featured,
    });
  }

  for (const item of hoodies) {
    products.push({
      title: item.name,
      description: `Premium ${item.color} hoodie from Integration. Heavy fleece, clean cut, everyday comfort. The layer you reach for when you want both warmth and style.`,
      price: item.price,
      images: urls[item.name] || [],
      sizes: ['S', 'M', 'L', 'XL'],
      sizeGuideNote: 'Standard fit. True to size.',
      stock: [
        { size: 'S', inStock: true },
        { size: 'M', inStock: true },
        { size: 'L', inStock: true },
        { size: 'XL', inStock: true },
      ],
      tags: ['hoodies', ...item.tags],
      active: true,
    });
  }

  for (const item of menShirts) {
    products.push({
      title: item.name,
      description: `Premium navy long-sleeve shirt from Integration. The "${item.design}" cut and fabric, tailored for comfort. A wardrobe staple that carries you from campus to everywhere.`,
      price: SHIRT_PRICE,
      images: urls[item.name] || [],
      sizes: ['S', 'M', 'L', 'XL'],
      sizeGuideNote: 'Standard fit. True to size.',
      stock: [
        { size: 'S', inStock: true },
        { size: 'M', inStock: true },
        { size: 'L', inStock: true },
        { size: 'XL', inStock: true },
      ],
      tags: ['mens-shirts', ...item.tags],
      active: true,
    });
  }

  for (const tee of aestheticTees) {
    products.push({
      title: tee.display || tee.name,
      description: `Premium solid black t-shirt featuring the "${tee.design}" design. Heavy cotton, clean print. A statement piece for those who wear their mood, their mind, and their aesthetic.`,
      price: tee.price || PRICE,
      images: urls[tee.name] || [],
      sizes: ['S', 'M', 'L', 'XL'],
      sizeGuideNote: 'Standard fit. True to size.',
      stock: [
        { size: 'S', inStock: true },
        { size: 'M', inStock: true },
        { size: 'L', inStock: true },
        { size: 'XL', inStock: true },
      ],
      tags: ['aesthetic-tshirts', ...tee.tags],
      active: true,
      featured: !!tee.featured,
    });
  }

  for (const item of literatureTees) {
    products.push({
      title: item.display || item.name,
      description: `Premium solid black t-shirt featuring the iconic book cover of "${item.design}". Heavy cotton, clean print. A tribute to Bengali literature for readers who carry their favorite stories everywhere.`,
      price: item.price || PRICE,
      images: urls[item.name] || [],
      sizes: ['S', 'M', 'L', 'XL'],
      sizeGuideNote: 'Standard fit. True to size.',
      stock: [
        { size: 'S', inStock: true },
        { size: 'M', inStock: true },
        { size: 'L', inStock: true },
        { size: 'XL', inStock: true },
      ],
      tags: ['literature-tshirts', ...item.tags],
      active: true,
      featured: !!item.featured,
    });
  }

  return products;
}

async function seed() {
  if (!MONGO_URI) {
    console.error('No MONGO_URI found in environment');
    process.exit(1);
  }

  try {
    const urls = loadUrls();
    console.log(`Loaded ${Object.keys(urls).length} uploaded image URLs`);

    const products = buildProducts(urls);
    console.log(`Prepared ${products.length} products for seeding`);

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`Database has ${count} products. Clearing...`);
      await Product.deleteMany({});
    }

    const created = await Product.insertMany(products);
    console.log(`Seeded ${created.length} products successfully`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
