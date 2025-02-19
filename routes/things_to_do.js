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
      // Récupérer les données de l'activité envoyée dans la requête

      console.log(req.body);
      const { name, address, description, status, categories, lon, lat, destinationID } = req.body;

  
      // Vérifier que les champs obligatoires sont présents
      if (!name || !address) {
        return res.status(400).json({ error: 'Missing required fields (name or address).' });
      }
  
      // Gérer les fichiers téléchargés
      const icon = req.files['icon'] ? req.files['icon'][0].filename : null;
      const gallery = req.files['gallery']
        ? req.files['gallery'].map((file) => file.filename)
        : [];
  
      // Récupérer les données existantes pour cette destination
      const [existingData] = await db.execute(
        `SELECT activities FROM destination WHERE id = ?`,
        [destinationID]
      );
  
      // Si aucune donnée existante, initialiser un tableau vide
      let data = existingData.length && existingData[0].activities
        ? JSON.parse(existingData[0].activities)
        : [];
  
      // Construire un nouvel objet pour la nouvelle activité
      const newData = {
        activity_name: name || null,
        address: address || null,
        description: description || null,
        status: status || null,
        categories: categories || null,
        lon: lon || null,
        lat: lat || null,
        gallery: gallery,
        icon: icon || null,
        id: data.length, // L'ID est maintenant inclus dans l'objet "data"
      };
  
      // Ajouter la nouvelle activité au tableau existant
      data.push(newData);
  
      // Mettre à jour la table avec le tableau d'activités modifié
      await db.execute(
        `UPDATE destination SET activities = ? WHERE id = ?`,
        [JSON.stringify(data), destinationID]
      );
  
      res.status(200).json({ message: 'Activity added successfully.' , index:data.length});
    } catch (error) {
      console.error('Error processing activities:', error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  });
  Router.delete('/delete/:destinationID/:id', async (req, res) => {
    try {
      const destinationID = req.params.destinationID; // ID de la destination cible
      const idToDelete = parseInt(req.params.id, 10); // ID de l'activité à supprimer
  
      if (isNaN(idToDelete)) {
        return res.status(400).json({ error: 'Invalid activity ID provided.' });
      }
  
      // Récupérer les données existantes dans la table "destination"
      const [existingData] = await db.execute(
        `SELECT activities FROM destination WHERE id = ?`,
        [destinationID]
      );
  
      // Vérifier si des activités existent
      if (!existingData.length || !existingData[0].activities) {
        return res.status(404).json({ error: 'No activities found for this destination.' });
      }
  
      // Parser les activités existantes
      let activities = JSON.parse(existingData[0].activities);
  
      // Trouver l'index correspondant à l'ID
      const indexToDelete = activities.findIndex((activity) => activity.id === idToDelete);
  
      // Vérifier si l'ID existe
      if (indexToDelete === -1) {
        return res.status(404).json({ error: 'Activity with the given ID not found.' });
      }
  
      // Supprimer l'activité correspondant à l'ID
      const deletedActivity = activities.splice(indexToDelete, 1);
  
      // Mettre à jour les IDs des activités restantes pour maintenir la cohérence
      activities = activities.map((activity, index) => ({
        ...activity,
        id: index, // Réattribuer les IDs
      }));
  
      // Mettre à jour la table avec les nouvelles données
      await db.execute(
        `UPDATE destination SET activities = ? WHERE id = ?`,
        [JSON.stringify(activities), destinationID]
      );
  
      res.status(200).json({
        message: 'Activity deleted successfully.',
        deletedActivity,
      });
    } catch (error) {
      console.error('Error during activity deletion:', error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  });


  Router.put('/update/:destinationID/:id', uploadFile(activitiesFilePath), async (req, res) => {
    try {
      const destinationID = req.params.destinationID; // ID of the destination
      const idToUpdate = parseInt(req.params.id, 10); // ID (index) of the activity to update
  
      if (isNaN(idToUpdate)) {
        return res.status(400).json({ error: 'Invalid activity ID provided.' });
      }
  
      // Retrieve existing data for this destination
      const [existingData] = await db.execute(
        `SELECT activities FROM destination WHERE id = ?`,
        [destinationID]
      );
  
      console.log('existingData:', existingData); // Log the database result for debugging
  
      // Ensure data is valid and activities exist
      if (
        !existingData || // Check if the result is undefined or null
        !Array.isArray(existingData) || // Check if the result is not an array
        existingData.length === 0 || // Check if the array is empty
        !existingData[0].activities // Check if the activities field is missing
      ) {
        return res.status(404).json({ error: 'No activities found for this destination.' });
      }
  
      // Parse existing activities
      let activities;
      try {
        activities = JSON.parse(existingData[0].activities);
      } catch (parseError) {
        console.error('Error parsing activities JSON:', parseError);
        return res.status(500).json({ error: 'Failed to parse activities data.' });
      }
  
      // Find the index corresponding to the ID
      const activityIndex = activities.findIndex((activity) => activity.id === idToUpdate);
  
      // Check if the ID exists
      if (activityIndex === -1) {
        return res.status(404).json({ error: 'Activity with the given ID not found.' });
      }
  
      // Retrieve the data sent in the request for updating
      const { name, address, description, status, categories, lon, lat } = req.body;
  
      // Handle uploaded files
      const icon = req.files['icon'] ? req.files['icon'][0].filename : null;
      const gallery = req.files['gallery']
        ? req.files['gallery'].map((file) => file.filename)
        : [];
  
      // Update the specific activity's data
      activities[activityIndex] = {
        ...activities[activityIndex], // Keep existing fields if new ones are not provided
        activity_name: name || activities[activityIndex].activity_name,
        address: address || activities[activityIndex].address,
        description: description || activities[activityIndex].description,
        status: status || activities[activityIndex].status,
        categories: categories || activities[activityIndex].categories,
        lon: lon || activities[activityIndex].lon,
        lat: lat || activities[activityIndex].lat,
        gallery: gallery.length > 0 ? gallery : activities[activityIndex].gallery,
        icon: icon || activities[activityIndex].icon,
      };
  
      // Update the table with the new data
      await db.execute(
        `UPDATE destination SET activities = ? WHERE id = ?`,
        [JSON.stringify(activities), destinationID]
      );
  
      res.status(200).json({
        message: 'Activity updated successfully.',
        updatedActivity: activities[activityIndex],
      });
    } catch (error) {
      console.error('Error during activity update:', error); // Log the full error for debugging
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  });
  
  




  Router.get('/select/:destinationID', async(req, res)=>
  {
    
    try{

      const destinationID = req.params.destinationID;
      const query         = 'SELECT activities, basic_info FROM destination WHERE id = ?'

      const [response]    = await db.execute(query, [destinationID]);

      res.status(200).json({data:response});

    }
    catch(error){
      console.log(error);
    }
  })
  
module.exports = Router;

