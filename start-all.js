/**
 * GreenCycle - Start everything needed for production
 * Run this once: node start-all.js
 */
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

console.log('🚀 Starting GreenCycle backend + Cloudflare Tunnel...\n');

// 1. Start backend
const backend = spawn('node', ['server.js'], {
    cwd: require('path').join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
});

// 2. Start Cloudflare Tunnel
setTimeout(() => {
    startTunnel();
}, 3000);

function startTunnel() {
    console.log('🌐 Starting Cloudflare Tunnel...');
    const tunnel = spawn('npx', ['--yes', 'cloudflared', 'tunnel', '--url', 'http://localhost:5000'], {
        cwd: __dirname,
        shell: true
    });

    tunnel.stdout.on('data', (data) => {
        const out = data.toString();
        if (out.includes('trycloudflare.com')) {
            const urlMatch = out.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
            if (urlMatch) {
                console.log(`\n✅ LIVE API URL: ${urlMatch[0]}/api`);
                console.log('⚠️  IMPORTANT: If you restart this, you must update the frontends with this new URL.');
            }
        }
    });

    tunnel.stderr.on('data', (data) => {
        const out = data.toString();
        if (out.includes('trycloudflare.com')) {
            const urlMatch = out.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
            if (urlMatch) {
                console.log(`\n🔗 Tunnel URL Found: ${urlMatch[0]}`);
            }
        }
    });

    tunnel.on('exit', (code) => {
        console.log(`⚠️  Tunnel exited (code ${code}). Restarting in 5s...`);
        setTimeout(startTunnel, 5000);
    });
}

// 3. Keep-alive ping
setInterval(() => {
    const req = http.request({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' }, (res) => { });
    req.on('error', () => { });
    req.end();
}, 4 * 60 * 1000);

// Cleanup
process.on('SIGINT', () => {
    backend.kill();
    process.exit();
});

console.log('\n✅ GreenCycle is booting up!');
console.log('📱 Customer: https://greencycle-nizampet.web.app');
console.log('🔐 Admin:    https://greencycle-admin-panel.web.app');
console.log('⚙️  Agent:    https://greencycle-agent-panel.web.app');
console.log('\nPress Ctrl+C to stop.\n');
