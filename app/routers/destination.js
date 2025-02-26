
const express                = require('express');
const router                 = express.Router();
const destinationController  = require('../controllers/destinationController');
const upload                 = require('../middleware/uploadFile');


router.get('/',                         destinationController.getAllDestinations);
router.get('/details/:id',              destinationController.getDestinationById);     
router.post('/add/basic/info',          destinationController.addDestination);

router.delete('/delete/:id',             destinationController.deleteDestination);

//router.post('/update/basic/info/:id', destinationController.updateDestination);
//router.post('/update/gallery/:id', upload.array('files', 1000), destinationController.updateGallery);

module.exports = router;
