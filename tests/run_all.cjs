const { spawnSync } = require('child_process');

console.log('Running Either AI Comprehensive Test Suites...\n');

const suites = [
  'tests/phase2_phase3_systems.test.cjs',
  'tests/foundation_systems.test.cjs',
  'tests/threat_intel.test.cjs',
  'tests/api_verification.cjs'
];

let allPassed = true;
for (const s of suites) {
  const res = spawnSync(process.execPath, [s], { stdio: 'inherit' });
  if (res.status !== 0) {
    allPassed = false;
  }
}

if (!allPassed) {
  console.error('\nSome test suites failed.');
  process.exit(1);
} else {
  console.log('\nAll test suites passed successfully.');
}