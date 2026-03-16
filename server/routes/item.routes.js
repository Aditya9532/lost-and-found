const router = require('express').Router();
const ctrl   = require('../controllers/item.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/',         ctrl.getItems);
router.get('/my-items', protect, ctrl.getMyItems);
router.get('/:id',      ctrl.getItem);
router.post('/',        protect, upload.array('images', 5), ctrl.createItem);
router.put('/:id',      protect, ctrl.updateItem);
router.delete('/:id',   protect, ctrl.deleteItem);

module.exports = router;
