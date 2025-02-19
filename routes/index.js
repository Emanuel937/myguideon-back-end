// This file handle all all router of all file
// then it is export to the app.js file ✅
// Servir le dossier 'public' comme contenu statique


const express              = require('express');
const router               = express.Router();
const addDestBscinfo       = require('./destinationAddBasicInfo.js');
const categoriesRouter     = require('./categories.js');
const activities           = require('./things_to_do.js');
const profils              = require('./equipes.js');
const info                 = require('./info.js');
const culture              = require('./culture.js');
const historical           = require('./historical.js');

// user router 
router.use('/destination',   addDestBscinfo);
router.use('/categories',    categoriesRouter);
router.use('/activities',    activities);
router.use('/profil',        profils);
router.use('/culture',       culture);
router.use('/pratique/info',    info);
router.use('/historical',     historical);
module.exports = router;