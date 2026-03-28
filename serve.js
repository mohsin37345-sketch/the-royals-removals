const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const PORT = 3000;

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.xml':  'application/xml',
  '.txt':  'text/plain',
  '.ico':  'image/x-icon',
};

http.createServer((req, res) => {
  // Strip query string
  let urlPath = req.url.split('?')[0];

  // Decode URI components
  try { urlPath = decodeURIComponent(urlPath); } catch(e) {}

  // Strip leading slash, then join to DIST safely
  const relativePath = urlPath.replace(/^\//, '');
  let filePath = path.join(DIST, relativePath);

  // If it's a directory, serve index.html inside it
  if (!path.extname(filePath)) {
    filePath = path.join(filePath, 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Try adding /index.html if not found
      const fallback = path.join(DIST, relativePath, 'index.html');
      fs.readFile(fallback, (err2, data2) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 Not Found</h1><p>' + filePath + '</p>');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data2);
        }
      });
    } else {
      const ext = path.extname(filePath);
      const contentType = MIME[ext] || 'text/plain';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}).listen(PORT, () => {
  console.log('✅ Server running at http://localhost:' + PORT);
  console.log('   Serving from: ' + DIST);
});
