const express = require('express');
const router  = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');  // Ajouté pour gérer les fichiers et répertoires
const db = require('../config/db');

router.put('/add/:id', async (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    const { section, content } = req.body;  // Récupération des valeurs depuis le body

    // Requête pour récupérer la colonne culture
    const selectQuery = 'SELECT historical FROM destination WHERE id = ?';
    const updateQuery = 'UPDATE destination SET historical = ? WHERE id = ?';

    try {
        const [response] = await db.execute(selectQuery, [id]); // Exécuter la requête de sélection
        let rows = response[0]; // Assurez-vous de récupérer les bonnes données depuis la réponse
        let jsonDataToSend;
        let data;

        // Vérifier si la colonne culture existe et est vide
        if (response.length > 0 && rows && rows.culture) {
            // Si culture existe, analyser les données JSON
            data = JSON.parse(rows.culture);
        } else {
            // Si culture n'existe pas ou est vide, initialiser un tableau par défaut
            data = [null, null, null]; // Initialiser avec des valeurs par défaut (brief, language, religion)
        }

        // Mettre à jour la section en fonction du type
        if (section.toLowerCase().includes('0')) {
            data[0] = content; // Mettre à jour la section brief
        } 

        // Convertir les données en JSON
        jsonDataToSend = JSON.stringify(data);

        // Exécuter la requête de mise à jour
        await db.execute(updateQuery, [jsonDataToSend, id]);

        // Retourner une réponse de succès
        res.status(200).json({ message: 'Culture mise à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la culture:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});


router.get('/:id',  async(req, res)=>{
    const destinationID = req.params.id;
    const query         = 'SELECT historical FROM destination WHERE id = ?';

    try{
        const [response] = await db.execute(query, [destinationID]);
        res.status(200).json(response);
    }
    catch(error){
        console.log(error);
    }
})



module.exports = router;
