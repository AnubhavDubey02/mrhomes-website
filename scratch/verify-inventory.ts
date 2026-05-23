import { PROPERTIES } from '../lib/properties';
import { filterProperties } from '../lib/property-filters';

function runTests() {
  console.log('=== RUNNING Mr HOMES REALTORS VERIFICATION ===\n');

  // Test 1: Active Listings Count
  console.log(`Test 1: Check active listings count...`);
  console.log(`  Total listings: ${PROPERTIES.length}`);
  if (PROPERTIES.length === 15) {
    console.log(`  ✓ Pass: Total listings count is exactly 15.`);
  } else {
    console.log(`  ✗ Fail: Total listings count is ${PROPERTIES.length}, expected 15.`);
  }

  // Test 2: Verify MRH-0001 is removed
  console.log(`\nTest 2: Verify MRH-0001 is removed...`);
  const mrh0001 = PROPERTIES.find(p => p.mhId === 'MRH-0001');
  if (!mrh0001) {
    console.log(`  ✓ Pass: MRH-0001 seed listing is not in database.`);
  } else {
    console.log(`  ✗ Fail: MRH-0001 is still in database!`);
  }

  // Test 3: Verify all property cards render with real media
  console.log(`\nTest 3: Verify all properties have real media...`);
  let missingMedia = 0;
  PROPERTIES.forEach(p => {
    if (!p.images || p.images.length === 0) {
      console.log(`  ✗ Missing images on ${p.mhId}`);
      missingMedia++;
    }
  });
  if (missingMedia === 0) {
    console.log(`  ✓ Pass: All properties have at least one image.`);
  } else {
    console.log(`  ✗ Fail: ${missingMedia} properties are missing images.`);
  }

  // Test 4: Verify location filters work
  console.log(`\nTest 4: Verify location filters work...`);
  const sec43 = filterProperties({ area: { slug: 'sector-43', name: 'Sector 43' } });
  const sec52 = filterProperties({ area: { slug: 'sector-52', name: 'Sector 52' } });
  const gcr = filterProperties({ area: { slug: 'golf-course-road', name: 'Golf Course Road' } });

  console.log(`  Sector 43 properties: ${sec43.length}`);
  console.log(`  Sector 52 properties: ${sec52.length}`);
  console.log(`  Golf Course Road properties: ${gcr.length}`);

  if (sec43.length > 0 && sec52.length > 0 && gcr.length > 0) {
    console.log(`  ✓ Pass: All tested locations return filtered matches.`);
  } else {
    console.log(`  ✗ Fail: One or more locations returned 0 matches.`);
  }

  // Test 5: Verify category filters work
  console.log(`\nTest 5: Verify category filters work...`);
  const rkFilter = filterProperties({ type: { value: '1-rk', label: '1 RK' } });
  const bhk1Filter = filterProperties({ apartmentType: { value: '1-bhk', label: '1 BHK' } });
  const bhk2Filter = filterProperties({ apartmentType: { value: '2-bhk', label: '2 BHK' } });

  console.log(`  1 RK matches: ${rkFilter.length}`);
  console.log(`  1 BHK matches: ${bhk1Filter.length}`);
  console.log(`  2 BHK matches: ${bhk2Filter.length}`);

  if (rkFilter.length > 0 && bhk1Filter.length > 0 && bhk2Filter.length > 0) {
    console.log(`  ✓ Pass: Category filters return matching listings.`);
  } else {
    console.log(`  ✗ Fail: One or more categories returned 0 matches.`);
  }

  // Test 6: Verify Featured vs Live behavior
  console.log(`\nTest 6: Verify Featured and Live listings behavior...`);
  const featured = PROPERTIES.filter(p => p.status === 'featured');
  const live = PROPERTIES.filter(p => p.status === 'available');

  console.log(`  Featured listings: ${featured.length}`);
  console.log(`  Live (available) listings: ${live.length}`);

  if (featured.length === 4) {
    console.log(`  ✓ Pass: Correct number of featured listings (4).`);
  } else {
    console.log(`  ✗ Fail: Expected 4 featured listings, found ${featured.length}.`);
  }

  if (live.length === 11) {
    console.log(`  ✓ Pass: Correct number of live listings (11).`);
  } else {
    console.log(`  ✗ Fail: Expected 11 live listings, found ${live.length}.`);
  }

  console.log('\n=== VERIFICATION COMPLETED ===');
}

runTests();
