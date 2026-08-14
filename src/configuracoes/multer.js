const multer = require('multer');
const path = require('path');
const fs = require('fs');

const diretorioUploads = path.join(__dirname, '../../uploads');

if (!fs.existsSync(diretorioUploads)) {
  fs.mkdirSync(diretorioUploads, { recursive: true });
}

const extensoesPermitidas = new Set(['.png', '.jpg', '.jpeg']);

const armazenamento = multer.diskStorage({
  destination: (req, file, cb) => cb(null, diretorioUploads),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const extensaoSegura = extensoesPermitidas.has(ext) ? ext : '.png';
    const nomeArquivo = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensaoSegura}`;
    cb(null, nomeArquivo);
  }
});

const upload = multer({
  storage: armazenamento,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (extensoesPermitidas.has(ext)) {
      cb(null, true);
      return;
    }

    cb(new Error('Apenas imagens PNG e JPG/JPEG são permitidas'));
  }
});

module.exports = upload;
