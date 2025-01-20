// This file handle all all router of all file
// then it is export to the app.js file ✅
// Servir le dossier 'public' comme contenu statique


const express              = require('express');
const router               = express.Router();
const addDestBscinfo       = require('./destinationAddBasicInfo.js');
const categoriesRouter     = require('./categories.js');
const activities           = require('./things_to_do.js');


// user router 
router.use('/destination',   addDestBscinfo);
router.use('/categories',    categoriesRouter);
router.use('/activities',    activities);


module.exports = router;