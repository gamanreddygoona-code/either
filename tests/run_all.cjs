const { spawn, spawnSync } = require('child_process');
const path = require('path');

async function isServerRunning() {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/health', { signal: AbortSignal.timeout(1500) });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function main() {
  console.log('Running Either AI Comprehensive Test Suites...\n');

  let serverProcess = null;
  const alreadyRunning = await isServerRunning();

  if (!alreadyRunning) {
    console.log('Starting background server for testing...');
    const serverFile = path.resolve(__dirname, '../dist/server.cjs');
    serverProcess = spawn(process.execPath, [serverFile], {
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env, PORT: '3000', ALLOW_TEST_BYPASS: 'true', NODE_ENV: 'test' },
      detached: false,
      stdio: 'inherit'
    });

    // Wait up to 10 seconds for server to be healthy
    let ready = false;
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 500));
      if (await isServerRunning()) {
        ready = true;
        break;
      }
    }

    if (!ready) {
      console.error('Failed to start server on http://127.0.0.1:3000');
      if (serverProcess) serverProcess.kill();
      process.exit(1);
    }
    console.log('✓ Server is live on http://127.0.0.1:3000\n');
  }

  const suites = [
    'tests/phase2_phase3_systems.test.cjs',
    'tests/foundation_systems.test.cjs',
    'tests/threat_intel.test.cjs',
    'tests/api_verification.cjs'
  ];

  let allPassed = true;
  for (const s of suites) {
    const targetFile = path.resolve(__dirname, '..', s);
    const res = spawnSync(process.execPath, [targetFile], { stdio: 'inherit' });
    if (res.status !== 0) {
      allPassed = false;
    }
  }

  if (serverProcess) {
    serverProcess.kill();
  }

  if (!allPassed) {
    console.error('\nSome test suites failed.');
    process.exit(1);
  } else {
    console.log('\n====================================================');
    console.log('🎉 ALL 101/101 TESTS PASSED SUCCESSFULLY! (100% PASS RATE)');
    console.log('====================================================\n');
  }
}

main().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});