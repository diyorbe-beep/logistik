import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
  const { asset } = req.query;
  
  if (!asset || Array.isArray(asset)) {
    return res.status(400).json({ error: 'Invalid asset path' });
  }

  try {
    // Security check - prevent directory traversal
    if (asset.includes('..') || asset.includes('/') || asset.includes('\\')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const filePath = join(process.cwd(), 'dist', 'assets', asset);
    const fileContent = readFileSync(filePath);
    
    // Set correct MIME type based on file extension
    const ext = asset.split('.').pop().toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case 'js':
      case 'mjs':
        contentType = 'application/javascript; charset=utf-8';
        break;
      case 'css':
        contentType = 'text/css; charset=utf-8';
        break;
      case 'json':
        contentType = 'application/json; charset=utf-8';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
      case 'ico':
        contentType = 'image/x-icon';
        break;
      case 'woff':
        contentType = 'font/woff';
        break;
      case 'woff2':
        contentType = 'font/woff2';
        break;
      case 'ttf':
        contentType = 'font/ttf';
        break;
      case 'eot':
        contentType = 'application/vnd.ms-fontobject';
        break;
    }

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    return res.send(fileContent);
  } catch (error) {
    console.error('Asset serving error:', error);
    return res.status(404).json({ error: 'Asset not found' });
  }
}