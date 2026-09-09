/**
 * MÁY CHỦ NỘI BỘ PHÒNG HỌC (LAN SERVER) - ZERO DEPENDENCY
 * Tác giả: Thầy giáo Trần Mạnh Tùng - THPT Chuyên Thái Nguyên
 * 100% Thuần Node.js (Không cần cài thêm thư viện npm)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const PORT = 8080;
const ROOT_DIR = __dirname;

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    let fallbackIP = '127.0.0.1';
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wireless')) {
                    return iface.address;
                }
                fallbackIP = iface.address;
            }
        }
    }
    return fallbackIP;
}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/' || reqUrl === '') {
        reqUrl = '/index.html';
    }

    const safePath = path.normalize(decodeURIComponent(reqUrl)).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(ROOT_DIR, safePath);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<h2>404 - Không tìm thấy tệp: ${reqUrl}</h2><p><a href="/index.html">Quay về trang chủ</a></p>`);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

const localIP = getLocalIP();

server.listen(PORT, '0.0.0.0', () => {
    const teacherUrl = `http://${localIP}:${PORT}/index.html`;
    const studentUrl = `http://${localIP}:${PORT}/index.html?view=student`;

    console.log('================================================================');
    console.log('   HỆ THỐNG DẠY HỌC VẬT LÍ 12 – QUY TRÌNH 5 BƯỚC KẾT HỢP AI');
    console.log('   Tác giả: Thầy giáo Trần Mạnh Tùng – THPT Chuyên Thái Nguyên');
    console.log('================================================================');
    console.log(`📡 MÁY CHỦ NỘI BỘ PHÒNG HỌC ĐÃ SẴN SÀNG!`);
    console.log(`👉 Link Giáo Viên (Máy tính/TV): ${teacherUrl}`);
    console.log(`📱 Link Bàn Học Sinh (Quét QR):   ${studentUrl}`);
    console.log('----------------------------------------------------------------');
    console.log('💡 Học sinh và Giáo viên chỉ cần kết nối chung mạng Wi-Fi phòng học.');
    console.log('   (Bấm Ctrl + C trong cửa sổ này nếu muốn dừng máy chủ)');
    console.log('================================================================\n');

    const startCmd = process.platform === 'win32' ? `start "" "${teacherUrl}"` :
                     process.platform === 'darwin' ? `open "${teacherUrl}"` :
                     `xdg-open "${teacherUrl}"`;
    exec(startCmd);
});
