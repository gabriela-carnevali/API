const multer = require('multer');
const path = require('path');
const fs = require('fs');

const diretorioUploads = path.join(__dirname, '../../uploads');

if (!fs.existsSync(diretorioUploads)) {
  fs.mkdirSync(diretorioUploads, { recursive: true });
}

const armazenamento = multer.diskStorage({
  destination: (req, file, cb) => cb(null, diretorioUploads),
  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname);
    const nomeArquivo = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`;
    cb(null, nomeArquivo);
  }
});

const upload = multer({
  storage: armazenamento,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }
    cb(new Error('Apenas imagens são permitidas'));
  }
});

module.exports = upload;
