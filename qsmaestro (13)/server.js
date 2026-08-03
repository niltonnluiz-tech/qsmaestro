import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from root and subfolder
app.use(express.static(path.join(__dirname, 'MAESTTRO', 'codigo-completo-multiarquivo')));
app.use(express.static(__dirname));

// Clean routes helper
function serveHtml(res, filename) {
  const subPath = path.join(__dirname, 'MAESTTRO', 'codigo-completo-multiarquivo', filename);
  const rootPath = path.join(__dirname, filename);
  if (fs.existsSync(subPath)) {
    return res.sendFile(subPath);
  }
  if (fs.existsSync(rootPath)) {
    return res.sendFile(rootPath);
  }
  return res.status(404).send('File not found');
}

app.get('/admin', (req, res) => serveHtml(res, 'admin.html'));
app.get('/contrato', (req, res) => serveHtml(res, 'contrato.html'));
app.get('/quem-somos', (req, res) => serveHtml(res, 'quem-somos.html'));

// Serve the Wix embed file if requested
app.get('/maesttro-home-wix-embed-leve.html', (req, res) => {
  const embedPath = path.join(__dirname, 'MAESTTRO', 'maesttro-home-wix-embed-leve.html');
  if (fs.existsSync(embedPath)) {
    return res.sendFile(embedPath);
  }
  return res.sendFile(path.join(__dirname, 'maesttro-home-wix-embed-leve.html'));
});

// Catch-all route to serve index.html for single page navigation
app.get('*', (req, res) => serveHtml(res, 'index.html'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
