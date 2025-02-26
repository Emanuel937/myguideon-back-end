const Destination = require('../models/Destination');


const destinationController = {


    async addDestination(req, res) {
        try {
            const { destinationName, language, budget, currency, status, address, categories, lon, lat, author } = req.body;
            let imgpath = null;

            if (req.files && req.files['weather_image'] && req.files['weather_image'][0]) {
                imgpath = `/public/assets/images/${req.files['weather_image'][0].filename}`;
            }

            const basicInfo = { destinationName, language, budget, currency, status, address, categories, lon, lat, imgpath };
            const insertedId = await Destination.add(basicInfo, author);

            res.status(200).json({ message: "Destination ajoutée avec succès", id: insertedId, data: basicInfo });
        } catch (error) {
            console.error('Erreur lors de l\'ajout:', error);
            res.status(500).json({ message: "Erreur lors de l'ajout de la destination." });
        }
    },

    async deleteDestination(req, res) {
        try {
            const success = await Destination.delete(req.params.id);
            if (success) {
                res.json({ message: 'Destination supprimée avec succès.' });
            } else {
                res.status(404).json({ message: 'Destination non trouvée.' });
            }
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            res.status(500).json({ message: 'Erreur serveur.' });
        }
    },

    async getAllDestinations(req, res) {
        try {
            const destinations = await Destination.findAll();
            res.status(200).json(destinations);
        } catch (error) {
            console.error('Erreur lors de la récupération des destinations:', error);
            res.status(500).json({ message: 'Erreur serveur.' });
        }
    },

    async getDestinationById(req, res){

        try {
            const destinations = await Destination.findById(req.params.id);
            res.status(200).json(destinations);

            console.log('it is called');

            

        } catch (error) {
            console.error('Erreur lors de la récupération des destinations:', error);
            res.status(500).json({ message: 'Erreur serveur.' });
        }
    }
};

module.exports = destinationController;
