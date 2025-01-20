const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const utils = require('../utils/uploadfile_script');
const { v4: uuidv4 } = require('uuid');

// Middleware pour gérer les fichiers téléchargés
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const getLastIdQuery = 'SELECT MAX(id) AS last_id FROM destination';

    db.execute(getLastIdQuery)
      .then(([rows]) => {
        const lastId = rows[0].last_id || 0;
        const uploadDir = path.join(__dirname, `../public/uploads/${lastId}`);
        
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const folder = file.fieldname === 'coverImage' ? 'cover' : 'meteo';
        const targetDir = path.join(uploadDir, folder);

        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        cb(null, targetDir);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération du dernier ID:', error);
        cb(error);
      });
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// delete destination by id
router.delete('/delete/:id', async (req, res) => {
  const deleteQuery = "DELETE FROM destination WHERE id = ?";

  try {
    // Execute the query with the provided ID
    const [response] = await db.execute(deleteQuery, [req.params.id]);

    if (response.affectedRows > 0) {
      res.json({ message: 'Destination deleted successfully.' });
    } else {
      res.status(404).json({ message: 'Destination not found.' });
    }
  } catch (err) {
    console.error('Error deleting destination:', err);
    res.status(500).json({ message: 'An error occurred while deleting the destination.' });
  }
});

router.post('/add/basic/info', upload.fields([
  { name: 'weatherImage_0', maxCount: 1 },
]), (req, res) => {
  const { destinationName, language, budget, currency, status, address } = req.body;

  console.log(req.body);

  // Préparer les images météo avec un ID temporaire (remplacé après insertion)
  const weatherImages = [];
  Object.keys(req.files).forEach(key => {
    if (key.startsWith('weatherImage')) {
      const weatherImage = req.files[key][0];
      if (weatherImage) {
        weatherImages.push(`/public/uploads/temp/meteo/${weatherImage.filename}`);
      }
    }
  });

  const basicInfo = {
    destinationName,
    language,
    budget,
    currency,
    status,
    address,
    weatherImages,
  };

  const query = `
    INSERT INTO destination (basic_info)
    VALUES (?)
  `;

  db.execute(query, [JSON.stringify(basicInfo)])
    .then(([result]) => {
      // Récupérer l'ID de la ligne insérée
      const insertedId = result.insertId;

      // Mettre à jour les chemins des images météo avec l'ID correct
      const updatedWeatherImages = weatherImages.map(imgPath =>
        imgPath.replace('/temp/', `/${insertedId}/`)
      );

      // Ajouter la logique de mise à jour des chemins si nécessaire
      const updateQuery = `
        UPDATE destination
        SET basic_info = ?
        WHERE id = ?
      `;

      const updatedBasicInfo = {
        ...basicInfo,
        weatherImages: updatedWeatherImages,
      };

      return db.execute(updateQuery, [JSON.stringify(updatedBasicInfo), insertedId])
        .then(() => {
          res.status(200).json({
            message: "Destination ajoutée avec succès",
            id: insertedId, // Retourner l'ID nouvellement créé
            data: updatedBasicInfo,
          });
        });
    })
    .catch((error) => {
      console.error('Erreur lors de l\'insertion dans la base de données:', error);
      res.status(500).json({ message: "Erreur lors de l'insertion dans la base de données" });
    });
});


// Route GET pour récupérer toutes les catégories
router.get('/', async (req, res) => {
  try {
    // Requête SQL pour récupérer toutes les catégories
    const query = 'SELECT * FROM destination'; // Modifiez cette requête en fonction de votre schéma de base de données
    const [destination] = await db.execute(query); // Exécution de la requête
    res.status(200).json(destination); // Retourner les catégories sous forme de JSON
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des catégories.' });
  }
});

//update destination 

router.post('/update/basic/info/:id', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'weatherImage_0', maxCount: 1 },
  { name: 'weatherImage_1', maxCount: 1 },
  { name: 'weatherImage_2', maxCount: 1 },
]), (req, res) => {
  const { id } = req.params; // ID de la destination
  const { destinationName, language, budget, currency, status, country, address, postalCode } = req.body;

  // Vérifier si l'ID est valide
  if (!id) {
    return res.status(400).json({ message: "ID de la destination manquant ou invalide." });
  }

  const coverImage = req.files['coverImage'] ? req.files['coverImage'][0] : null;

  const weatherImages = [];
  Object.keys(req.files).forEach(key => {
    if (key.startsWith('weatherImage')) {
      const weatherImage = req.files[key][0];
      if (weatherImage) {
        weatherImages.push(`/public/uploads/${id}/meteo/${weatherImage.filename}`);
      }
    }
  });

  // Construire l'objet à mettre à jour
  const updatedBasicInfo = {
    destinationName,
    language,
    budget,
    currency,
    status,
    country,
    address,
    postalCode,
  };

  // Ajouter les chemins d'image si des fichiers sont fournis
  if (coverImage) {
    updatedBasicInfo.coverImage = `/public/uploads/${id}/cover/${coverImage.filename}`;
  }
  if (weatherImages.length > 0) {
    updatedBasicInfo.weatherImages = weatherImages;
  }

  // Vérifier si la destination existe
  const checkQuery = 'SELECT * FROM destination WHERE id = ?';
  db.execute(checkQuery, [id])
    .then(([rows]) => {
      if (rows.length === 0) {
        return res.status(404).json({ message: "Destination introuvable." });
      }

      // Mettre à jour la destination
      const updateQuery = `
        UPDATE destination
        SET basic_info = ?
        WHERE id = ?
      `;
      db.execute(updateQuery, [JSON.stringify(updatedBasicInfo), id])
        .then(() => {
          res.status(200).json({
            message: "Informations de la destination mises à jour avec succès.",
            data: updatedBasicInfo,
          });
        })
        .catch((error) => {
          console.error('Erreur lors de la mise à jour dans la base de données:', error);
          res.status(500).json({ message: "Erreur lors de la mise à jour dans la base de données." });
        });
    })
    .catch((error) => {
      console.error('Erreur lors de la vérification de la destination:', error);
      res.status(500).json({ message: "Erreur lors de la vérification de la destination." });
    });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params; // Récupérer l'id depuis les paramètres de l'URL

  try {
    // Requête SQL pour récupérer toutes les colonnes de la destination avec l'id donné
    const query = 'SELECT * FROM destination WHERE id = ?';

    // Exécuter la requête
    const [destination] = await db.execute(query, [id]);

    // Vérifier si une destination a été trouvée
    if (destination.length === 0) {
      return res.status(404).json({ message: `Aucune destination trouvée avec l'id ${id}.` });
    }

    // Retourner les données de la destination sous forme de JSON
    res.status(200).json({
      message: "Destination récupérée avec succès.",
      data: destination[0],
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la destination:', error);
    res.status(500).json({ message: "Erreur lors de la récupération de la destination." });
  }
});




router.post('/update/gallery/:id', upload.array('files', 10), (req, res) => {
  const destinationId = req.params.id; // Récupérer l'ID de la destination depuis l'URL
  const destinationDir = path.join(__dirname, `../public/uploads/destination/gallery`); // Définir le répertoire de la galerie

  // Créer le répertoire pour la galerie si il n'existe pas
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true }); // Créer le répertoire (récursivement si nécessaire)
  }

  // Récupérer le coverId envoyé par le frontend (c'est l'ID de l'image couverture)
  let { cover } = req.body;  // Directement récupérer 'cover' depuis req.body
  
  // Créer la liste des images de la galerie avec les nouveaux chemins
  console.log("cover is  ______");
  console.log(cover);
  const galleryImages = req.files.map(file => {
    console.log(file);
    console.log(file.originalname);
  
    // Générer un nom de fichier unique en utilisant la date actuelle, un UUID et l'extension du fichier
    const extensionGallery = path.extname(file.originalname);
    const uniqueFilename = `${Date.now()}-${uuidv4()}${extensionGallery}`;
    const filePath = `/public/uploads/destination/gallery/${uniqueFilename}`;
    
    // Déplacer le fichier dans le répertoire spécifique avec le nouveau nom
    fs.renameSync(file.path, path.join(destinationDir, uniqueFilename)); // Déplacer le fichier
    return filePath; // Retourner le chemin d'accès relatif pour la base de données
  });
  

  // Si 'cover' n'est pas spécifié, choisir la première image de la galerie comme couverture
  if (!cover || cover.length <= 0) {
    cover = galleryImages[0]; // Par défaut, utiliser la première image téléchargée
  } 

  // Requête SQL pour mettre à jour la table destination
  const query = `
    UPDATE destination 
    SET gallery = ?, imageCover = ?
    WHERE id = ?
  `;

  db.execute(query, [JSON.stringify(galleryImages), `/public/uploads/destination/gallery/${cover}`, destinationId])
    .then(() => {
      res.status(200).json({
        message: "Galerie mise à jour avec succès",
        data: {
          galleryImages,
          imageCover: cover,  // Inclure l'image de couverture mise à jour dans la réponse
        },
      });
    })
    .catch((error) => {
      console.error('Erreur lors de la mise à jour de la galerie:', error);
      res.status(500).json({ message: "Erreur lors de la mise à jour de la galerie" });
    });
});




module.exports = router;
