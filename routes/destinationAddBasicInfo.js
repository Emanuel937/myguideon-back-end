const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const utils = require('../utils/uploadfile_script');
const { v4: uuidv4 } = require('uuid');
const formatText  =  require('../utils/format_text');
const sendMail = require('../utils/transporter');
const hostLink = require('../constant/host');
const host = require('../constant/host');



const toMail = 'myguideon.contact@gmail.com';
const objet  = 'Pending validation';
const htmlText = (id, link, type)=>{
  const html = `
    <h1> La destination n° ${id}<h1>
    <p> Vous avez une nouvelle ${type} en attente de votre validation, voici son lien pour previsualiser : ${link}</p>
  
  `;
}



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
  { name: 'weather_image', maxCount: 1 },
]), async (req, res) => {
  const { destinationName, language, budget, currency, status, address, categories, lon, lat, author} = req.body;

  // Préparer les images météo avec un ID temporaire (remplacé après insertion)

  var imgpath = null;
  var meteoPath = " ";

  const basicInfo = {
    destinationName,
    language,
    budget,
    currency,
    status,
    address,
    categories,
    lon,
    lat,
    imgpath
  };

  const query = `
    INSERT INTO destination (basic_info, author)
    VALUES (?, ?)
  `;

  // Vérifier si la table destination est vide
  const checkQuery = 'SELECT COUNT(*) AS count FROM destination';
      
  const [row] =  await db.execute(checkQuery); // ✅ Corrigé ici
  const isTableEmpty = row[0].count == 0; // ✅ Accès correct à la valeur count



  db.execute(query, [JSON.stringify(basicInfo), author])
    .then(async ([result]) => {
      // Récupérer l'ID de la ligne insérée
      const insertedId = result.insertId;

      // Ajouter la logique de mise à jour des chemins si nécessaire
      const updateQuery = `
        UPDATE destination
        SET basic_info = ?
        WHERE id = ?
      `;
      
      
      try {
        meteoPath = req.files['weather_image'][0].filename;
      
        var index = isTableEmpty ? 0 : insertedId - 1;
        
        meteoPath = `/public/uploads/${index}/meteo/${meteoPath}`;
        
        console.log('📂 Fichiers reçus:', req.files);
        console.log('🛠️ Chemin de l\'image défini:', meteoPath);
      } 
      catch (error) {
        console.log('❌ Erreur lors du traitement du fichier:', error);
      }
      
      

      const updatedBasicInfo = {
        ...basicInfo,
        imgpath: meteoPath,
      };

      console.log('update:', updatedBasicInfo);
      console.log("file", req.files['weather_image']);

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


// Route GET pour récupérer toutes les catégories
router.get('/details/:id', async (req, res) => {
  try {
    // Requête SQL pour récupérer toutes les catégories
    const id = req.params.id;
    const query = 'SELECT * FROM destination WHERE id = ?'; // Modifiez cette requête en fonction de votre schéma de base de données
    const [destination] = await db.execute(query,[id]); // Exécution de la requête
    res.status(200).json(destination); // Retourner les catégories sous forme de JSON
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des catégories.' });
  }
});

//update destination 

router.post('/update/basic/info/:id', upload.fields([
  { name: 'weather_image', maxCount: 1 }
]), (req, res) => {
  const { id } = req.params; // ID de la destination
  var { destinationName, language, budget, currency, status, address, categories, lon, lat, author, imgpath} = req.body;
  
  // Vérifier si l'ID est valide
  if (!id) {
    return res.status(400).json({ message: "ID de la destination manquant ou invalide." });
  }

  notifyAllAdmin(status,db, id);

  var weatherImage = null;
    try{ 
 
        weatherImage= req.files['weather_image'][0].filename;
        imgpath = `/public/uploads/${id}/meteo/${weatherImage}`;

    
    }

    catch(error){
      imgpath  = imgpath;
    }


  const formatStatus =  formatText(status);
  

  // Construire l'objet à mettre à jour
  const updatedBasicInfo = {
      destinationName,
      language,
      budget,
      currency,
      status,
      address,
      imgpath,
      categories,
      lon,
      lat
  };

  notifyTheAuthor(status, db, author, id);

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


router.post('/update/gallery/:id', upload.array('files', 1000), async (req, res) => {
  const destinationId = req.params.id;
  const destinationDir = path.join(__dirname, `../public/uploads/destination/gallery`);

  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
  }

  let { cover, deletedImages } = req.body;  // `deletedImages` contient les chemins des images supprimées

  try {
    // 1️⃣ **Récupérer les anciennes images**
    const [rows] = await db.execute("SELECT gallery FROM destination WHERE id = ?", [destinationId]);

    let oldGallery = (rows.length > 0 && rows[0].gallery) ? JSON.parse(rows[0].gallery) : [];


    // 2️⃣ **Supprimer les images qui ont été retirées du frontend**
    if (deletedImages) {
      const deletedList = JSON.parse(deletedImages); // Convertir en tableau
      oldGallery = oldGallery.filter(img => !deletedList.includes(img));

      // Supprimer les fichiers du serveur
      deletedList.forEach(imgPath => {
        const fullPath = path.join(__dirname, `../${imgPath}`);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath); // Supprimer l’image
        }
      });
    }

    // 3️⃣ **Ajouter les nouvelles images uploadées**
    const newImages = req.files.map(file => {
      const extension = path.extname(file.originalname);
      const uniqueFilename = `${Date.now()}-${uuidv4()}${extension}`;
      const filePath = `/public/uploads/destination/gallery/${uniqueFilename}`;

      fs.renameSync(file.path, path.join(destinationDir, uniqueFilename));

      if (cover === file.originalname) {
        cover = filePath;  // Si c'est la couverture, on met à jour
      }
      return filePath;
    });

    // **Fusionner les anciennes images restantes et les nouvelles**
    const updatedGallery = [...oldGallery, ...newImages];

    // 4️⃣ **Définir une image par défaut si la couverture a été supprimée**
    if (!cover || cover.length === 0) {
      cover = updatedGallery.length > 0 ? updatedGallery[0] : null;
    }

    // 5️⃣ **Mettre à jour la base de données**
    await db.execute("UPDATE destination SET gallery = ?, imageCover = ? WHERE id = ?", [
      JSON.stringify(updatedGallery), cover, destinationId
    ]);

    res.status(200).json({
      message: "Galerie mise à jour avec succès",
      data: { galleryImages: updatedGallery, imageCover: cover }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la galerie:', error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la galerie" });
  }
});



const notifyTheAuthor = async (status, db, userID, destinationID) => {
  if (status.toLowerCase().includes("published")) {
      try {
          const query = 'SELECT email FROM user_admin WHERE id = ?';
          // get author data 
          const [author] = await db.execute(query, [userID]);

          if (!author || author.length === 0) {
              console.error("No author found with the given userID.");
              return;
          }
          console.log(hostLink);
        
          const html = `
          <h1>Your destination with ID ${destinationID} has been published:</h1>
          <p>Your destination is now live and accessible.</p>
          <p>
              View your destination here: 
              <a href="${hostLink}/destination/overview/${destinationID}" target="_blank" rel="noopener noreferrer">
                  ${hostLink}/destination/overview/${destinationID}
              </a>
          </p>
          <p>If the link does not work, copy and paste this URL into your browser:</p>
          <p>${hostLink}/destination/overview/${destinationID}</p>
      `;
      

          sendMail(author[0].email, 'Update destination', html);
      } catch (error) {
          console.error("Error sending email:", error);
      }
  }
};


const notifyAllAdmin = async (status, db, destinationID) => {

  if(!status.toLowerCase().includes('pending validation')){
    return;
  }
  // Get all users' email and permissions
  const profilsQuery = 'SELECT id, permissions FROM equipes';
  const emailsQuery = 'SELECT email FROM user_admin WHERE profil_id IN (?)';
  const updatePermissionDestination = 6;

  try {
    // Fetch all user permissions
    const [allUserPermissions] = await db.execute(profilsQuery);

    // Filter users who have the required permission
    const usersWithPermission = allUserPermissions.filter((user) =>
      user.permissions.includes(updatePermissionDestination)
    );

    // Extract profile IDs
    const profilIDs = usersWithPermission.map(user => user.id);

    if (profilIDs.length === 0) {
      console.log("No users found with the required permission.");
      return;
    }

    console.log('profilID', profilIDs);
    
    // Fetch all admin emails associated with those profile IDs
    const [adminEmails] = await db.execute(emailsQuery, [profilIDs.toString()]);

    console.log("Admin Emails:", adminEmails);

    const html = `<h1> Destination to validate</h1>
    <p> Destination with id ${destinationID} is must be validate </p>
    <p>here is the link to validate it : <a href="${host}/admin?page=list_destination&isEdit=yes&destinationID=${destinationID}">
    
    validate destination</a></p>
    
    
    `
    
    adminEmails.map((e)=> sendMail(e.email, "A destination to validate", html));


  } catch (error) {
    console.error("Error fetching data:", error);
  }
};




module.exports = router;
