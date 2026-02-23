/**
 * GreenCycle - Start everything needed for production
 * Run this once: node start-all.js
 */
const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting GreenCycle backend + tunnel...\n');

// 1. Start backend (must use backend/ as CWD so dotenv finds .env)
const backend = spawn('node', ['server.js'], {
    cwd: require('path').join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
});

// 2. Wait 3s then start localtunnel
setTimeout(() => {
    startTunnel();
}, 3000);

function startTunnel() {
    console.log('🌐 Starting localtunnel...');
    const tunnel = spawn('lt', ['--port', '5000', '--subdomain', 'greencycle-api'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true
    });

    tunnel.on('exit', (code) => {
        console.log(`⚠️  Tunnel exited (code ${code}). Restarting in 5s...`);
        setTimeout(startTunnel, 5000);
    });
}

// 3. Keep-alive ping every 4 minutes to prevent tunnel sleep
setInterval(() => {
    const req = http.request({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' }, (res) => {
        console.log(`💓 Keep-alive ping: ${res.statusCode}`);
    });
    req.on('error', () => { });
    req.end();
}, 4 * 60 * 1000);

// Cleanup
process.on('SIGINT', () => {
    backend.kill();
    process.exit();
});

console.log('\n✅ GreenCycle is running!');
console.log('📱 Customer: https://greencycle-nizampet.web.app');
console.log('🔐 Admin:    https://greencycle-admin-panel.web.app');
console.log('⚙️  API:      https://greencycle-api.loca.lt/api');
console.log('\nPress Ctrl+C to stop.\n');
