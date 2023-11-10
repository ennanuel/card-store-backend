const router = require('express').Router();
const { addPlayerCard, editPlayerCard, fetchSinglePlayer, deletePlayerCard, fetchAllPlayers, fetchPlayersBasedOnType, fetchRelatedPlayers } = require('../controllers/player');
const { uploadCardMiddleWare } = require('../utils/file');
const { verifyTokenAndAdmin } = require('../utils/verifyToken');

router.get('/', fetchAllPlayers);
router.get('/related/:card_id', fetchRelatedPlayers);
router.get('/type/:fetchType/:searchValue', fetchPlayersBasedOnType);
router.get('/single/:card_id', fetchSinglePlayer);
router.post('/create/:user_id', verifyTokenAndAdmin, uploadCardMiddleWare, addPlayerCard);
router.put('/edit/:user_id/:card_id', verifyTokenAndAdmin, uploadCardMiddleWare, editPlayerCard);
router.delete('/:id', verifyTokenAndAdmin, deletePlayerCard);

module.exports = router;