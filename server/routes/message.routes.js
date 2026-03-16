const router = require('express').Router();
const ctrl   = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/',               protect, ctrl.sendMessage);
router.get('/inbox',           protect, ctrl.getInbox);
router.get('/:userId/:itemId', protect, ctrl.getConversation);

module.exports = router;
