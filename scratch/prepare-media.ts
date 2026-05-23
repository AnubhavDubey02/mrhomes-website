import fs from 'node:fs';
import path from 'node:path';

const publicRefs = [
  'MRH-1001',
  'MRH-1002',
  'MRH-1003',
  'MRH-1004',
  'MRH-1005',
  'MRH-1006',
  'MRH-1007',
  'MRH-1008',
  'MRH-1009',
  'MRH-1010',
  'MRH-1011',
  'MRH-1012',
  'MRH-1013',
  'MRH-1014',
  'MRH-1015'
];

const placeholders = [
  'builder-floor-exterior.webp',
  'minimal-luxury-interior.webp',
  'modern-villa-exterior.webp',
  'gurgaon-skyline.webp'
];

function prepareMedia() {
  const projectRoot = path.join(__dirname, '..');
  const placeholdersDir = path.join(projectRoot, 'public', 'brand', 'placeholders');
  const listingsDir = path.join(projectRoot, 'public', 'listings');

  console.log(`Setting up mock media for ${publicRefs.length} listings...`);

  publicRefs.forEach((ref, idx) => {
    const destDir = path.join(listingsDir, ref);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Assign 2 photos from the placeholders
    const img1Source = path.join(placeholdersDir, placeholders[idx % placeholders.length]);
    const img2Source = path.join(placeholdersDir, placeholders[(idx + 1) % placeholders.length]);

    const img1Dest = path.join(destDir, '01.webp');
    const img2Dest = path.join(destDir, '02.webp');

    fs.copyFileSync(img1Source, img1Dest);
    fs.copyFileSync(img2Source, img2Dest);

    // Optionally add a mock video for featured listings (e.g. MRH-1001)
    if (idx === 0 || idx === 2 || idx === 8) {
      // copy tour.mp4 from MRH-0001 if it exists
      const sourceVideo = path.join(listingsDir, 'MRH-0001', 'tour.mp4');
      if (fs.existsSync(sourceVideo)) {
        fs.copyFileSync(sourceVideo, path.join(destDir, 'tour.mp4'));
      }
    }
  });

  console.log('✓ Successfully populated listings media folders!');
}

prepareMedia();
