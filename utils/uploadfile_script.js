
const  multer = require('multer');
const path    = require('path');
const fs      = require('fs');

// Configuration de stockage pour Multer
const storage = (filePathDir) => multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname,'../', filePathDir);

    // Crée le dossier si nécessaire
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir); // Dossier où les fichiers seront stockés
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Renomme le fichier avec un suffixe unique
  },
});

// Initialisation de Multer avec des options
const upload = (filePathDir) => multer({
  storage: storage(filePathDir),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5 Mo par fichier
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/; // Types de fichiers acceptés
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers images sont autorisés.'));
    }
  },
});

// Fichier uploadfile_script.js
module.exports = upload;

