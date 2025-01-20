const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');  // Ajouté pour gérer les fichiers et répertoires
const db = require('../config/db');

const router = express.Router();

// Configuration de multer pour gérer le téléchargement des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads/categories');
    // Vérifiez et créez le dossier si nécessaire
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Route POST pour ajouter une catégorie
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { name, description, parentId } = req.body;
    const image = req.file ? `/public/uploads/categories/${req.file.filename}` : null;

    if (!name) {
      return res.status(400).json({ message: 'Le nom de la catégorie est obligatoire.' });
    }

    const query = `
      INSERT INTO categories (categories_name, categories_parent_id, description, image)
      VALUES (?, ?, ?, ?)
    `;

    const values = [name, parentId || null, description || null, image];

    await db.execute(query, values);

    return res.status(200).json({ message: 'Catégorie ajoutée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l’ajout de la catégorie :', error);
    return res.status(500).json({ message: 'Une erreur est survenue.' });
  }
});


// Route GET pour récupérer toutes les catégories
router.get('/', async (req, res) => {
    try {
      // Requête SQL pour récupérer toutes les catégories
      const query = 'SELECT * FROM categories'; // Modifiez cette requête en fonction de votre schéma de base de données
      const [categories] = await db.execute(query); // Exécution de la requête
      res.status(200).json(categories); // Retourner les catégories sous forme de JSON
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des catégories.' });
    }
  });


// Route pour supprimer une catégorie
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      // Vérifier si la catégorie existe dans la base de données
      const queryCheck = 'SELECT * FROM categories WHERE id = ?';
      const [category] = await db.execute(queryCheck, [id]);
  
      if (category.length === 0) {
        return res.status(404).json({ message: 'Catégorie non trouvée' });
      }
  
      // Supprimer la catégorie
      const queryDelete = 'DELETE FROM categories WHERE id = ?';
      await db.execute(queryDelete, [id]);
  
      return res.status(200).json({ message: 'Catégorie supprimée avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      return res.status(500).json({ message: 'Erreur serveur lors de la suppression de la catégorie' });
    }
  });

  


// Route pour mettre à jour une catégorie
router.put('/update/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, description, parentId } = req.body;
  let imageUrl = '';

  // Si une image est téléchargée, on prépare le chemin d'accès à l'image
  if (req.file) {
    const imagePath = path.join(__dirname, 'uploads', req.file.filename);
    imageUrl = `/public/uploads/${req.file.filename}`;
    // Vous pouvez également traiter l'image, par exemple en la déplaçant dans un dossier spécifique si nécessaire
  }

  try {
    // Requête SQL pour mettre à jour la catégorie dans la base de données
    const query = `
      UPDATE categories
      SET categories_name = ?, description = ?, categories_parent_id = ?, image = ?
      WHERE id = ?
    `;

    // On passe les valeurs dans l'ordre correspondant aux placeholders dans la requête
    const values = [name, description, parentId || null, imageUrl, id];

    // Exécution de la requête SQL avec `execute` de mysql2
    const [result] = await db.execute(query, values);

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: 'Catégorie mise à jour avec succès.' });
    } else {
      return res.status(404).json({ message: 'Catégorie non trouvée.' });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

module.exports = router;
