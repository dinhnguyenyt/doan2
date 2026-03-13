const { spawn } = require('child_process');
const path = require('path');

const clientPath = path.join(__dirname, 'client');

console.log('[v0] Starting React development server on http://localhost:3000...');
console.log('[v0] Client path:', clientPath);

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const proc = spawn(npm, ['start'], {
  cwd: clientPath,
  stdio: 'inherit',
  shell: true
});

proc.on('error', (err) => {
  console.error('[v0] Error starting client:', err);
  process.exit(1);
});

proc.on('close', (code) => {
  console.log('[v0] Client process exited with code:', code);
  process.exit(code);
});
