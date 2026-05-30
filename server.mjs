// 静的ファイル配信用 Node.js サーバー（並列リクエスト対応）
import http from 'http';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT    = 8002;
const __dir   = path.dirname(fileURLToPath(import.meta.url));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
  '.txt':  'text/plain; charset=utf-8',
};

http.createServer((req, res) => {
  // クエリ文字列を除去してファイルパスを解決
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  // パストラバーサル防止
  const safe = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  const file  = path.join(__dir, safe);

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + safe);
      return;
    }
    const ext  = path.extname(file).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type':  mime,
      'Content-Length': data.length,
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Serving ${__dir} at http://localhost:${PORT}`);
});
