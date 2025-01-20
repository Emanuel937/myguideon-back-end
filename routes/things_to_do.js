const  App       = require('express');
const  Router    = App.Router();
const  db        = require('../config/db');
const  upload    = require('../utils/uploadfile_script');
const path       = require('path');

// get all the destination data ;
Router.get('/',async(req, res)=>{
    const  query     = "SELECT * FROM  things_to_do";   
    const  [things_to_do] = await  db.execute(query);

    try{
       res.status(200).json(things_to_do);
    }catch(error){
        console.log(error);
    }

});


  const uploadFile = (locationFilePath) => {
    return upload(locationFilePath).fields([
      { name: 'icon', maxCount: 1 },
      { name: 'gallery', maxCount: 6 } // Assurez-vous que vous autorisez jusqu'à 6 fichiers dans 'gallery'
    ]);
  };
  

  const activitiesFilePath = '/public/uploads/destination/activities'; 

  Router.post('/add', uploadFile(activitiesFilePath), async (req, res) => {
    try {
      // Vérifier si des activités ont été envoyées
      const activities = req.body.activities;
  
      // Si le tableau activities est vide ou non défini, renvoyer une erreur
      if (!activities || activities.length === 0) {
        return res.status(400).json({ error: 'No activities provided' });
      }
  
      // Log pour déboguer
      console.log('Activities data:', activities);
  
      // Initialisation de l'insertion
      const insertThingstoDo = `
        INSERT INTO things_to_do (name, adress, destination_name, description, logintude, icon, gallery)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
  
      // Itérer sur toutes les activités envoyées
      for (const activity of activities) {
        const { name, address, destination_name, description } = activity;
        const longitude = null; // Si nécessaire, remplacez par une valeur par défaut ou obtenez-la de l'activité
        const icon = req.files['icon'] ? req.files['icon'][0].filename : null; // Icône de l'activité
        const gallery = req.files['gallery'] ? req.files['gallery'].map(file => file.filename) : null; // Galerie
  
        // Exécution de la requête pour chaque activité
        await db.execute(insertThingstoDo, [
          name || null, // Si name est undefined, utilisez null
          address || null, // Idem pour address
          destination_name || null, // Idem pour destination_name
          description || null, // Idem pour description
          longitude, // Longitude est null
          icon, // Si icon est présent, utiliser le nom du fichier ou null
          gallery ? JSON.stringify(gallery) : null, // Galerie convertie en JSON ou null
        ]);
  
        console.log(`Activity ${name} inserted successfully`);
      }
  
      // Réponse de succès
      res.status(200).json('All activities inserted successfully');
    } catch (error) {
      // Gérer l'erreur si elle se produit
      console.error('Error inserting data:', error);
      res.status(500).json({ error: 'An error occurred while processing your request' });
    }
  });
  

  Router.delete('/delete/:id', async (req, res) => {
  
    const id = req.params.id;
    const selectQuery = 'SELECT icon FROM things_to_do WHERE id = ?';
    const deleteQuery = 'DELETE FROM things_to_do WHERE id = ?';
  
    try {
      // Récupérer le chemin de l'image
      const [rows] = await db.execute(selectQuery, [id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Item not found.' });
      }
  
      const imagePath = rows[0].image_path;
  
      // Supprimer l'entrée de la base de données
      await db.execute(deleteQuery, [id]);
  
      // Supprimer l'image associée si elle existe
      if (imagePath) {
        const fullPath = path.resolve(__dirname, '../public/uploads/destination/activities', imagePath); // Chemin complet vers le fichier
        fs.unlink(fullPath, (err) => {
          if (err) {
            console.error('Error deleting the image file:', err);
          } else {
            console.log('Image file deleted successfully');
          }
        });
      }
  
      res.status(200).json({ message: 'Data deleted successfully.' });
    } catch (error) {
      console.error('Error during deletion:', error);
      res.status(500).json({ message: 'An error occurred during deletion.' });
    }
  });


  Router.get('/:id', async (req, res) => {
    const query = 'SELECT * FROM things_to_do WHERE id = ?';
  
    try {
      // Exécution de la requête dans le bloc try
      const [response] = await db.execute(query, [req.params.id]);
  
      // Réponse réussie
      res.status(200).json(response);
    } catch (error) {
      // Gestion des erreurs
      console.error('Erreur lors de la récupération de l\'activité :', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  });

  Router.put('/update/:id', uploadFile(activitiesFilePath), async (req, res) => {
    try {
      const id = req.params.id; // ID de l'activité à mettre à jour
  
      // Récupérer les données de l'activité envoyées dans le corps de la requête
      const { name, address, destination_name, description } = req.body;

      const longitude = null;
  
      // Récupérer les fichiers téléchargés
      const newIcon = req.files['icon'] ? req.files['icon'][0].filename : null;
      const newGallery = req.files['gallery'] ? req.files['gallery'].map(file => file.filename) : null;
  
      // Récupérer l'activité actuelle pour gérer les anciens fichiers
      const [currentActivity] = await db.execute('SELECT * FROM things_to_do WHERE id = ?', [id]);
  
      if (!currentActivity || currentActivity.length === 0) {
        return res.status(404).json({ error: 'Activity not found' });
      }
  
      const oldActivity = currentActivity[0];
  
      // Gestion des fichiers (icône)
      let icon = oldActivity.icon;
      if (newIcon) {
        // Supprimer l'ancienne icône si elle existe
        if (icon) {
          const oldIconPath = `${activitiesFilePath}/${icon}`;
          fs.unlinkSync(oldIconPath);
        }
        icon = newIcon; // Remplacer par la nouvelle icône
      }
  
      // Gestion de la galerie
      let gallery = oldActivity.gallery ? JSON.parse(oldActivity.gallery) : [];
      if (newGallery) {
        // Supprimer les anciennes images de la galerie si elles existent
        gallery.forEach(file => {
          const oldGalleryPath = `${activitiesFilePath}/${file}`;
          if (fs.existsSync(oldGalleryPath)) {
            fs.unlinkSync(oldGalleryPath);
          }
        });
        gallery = newGallery; // Remplacer par la nouvelle galerie
      }
  
      // Mise à jour dans la base de données
      const updateQuery = `
        UPDATE things_to_do 
        SET name = ?, adress = ?, destination_name = ?, description = ?, logintude = ?, icon = ?, gallery = ?
        WHERE id = ?
      `;
  
      await db.execute(updateQuery, [
        name || oldActivity.name,
        address || oldActivity.adress,
        destination_name || oldActivity.destination_name,
        description || oldActivity.description,
        longitude || oldActivity.logintude,
        icon,
        gallery.length > 0 ? JSON.stringify(gallery) : null,
        id,
      ]);
  
      res.status(200).json({ message: `Activity ${id} updated successfully` });
    } catch (error) {
      console.error('Error updating activity:', error);
      res.status(500).json({ error: 'An error occurred while updating the activity' });
    }
  });
  
module.exports = Router;