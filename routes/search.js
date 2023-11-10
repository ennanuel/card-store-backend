const router = require('express').Router();
const { fetchSearchResults } = require('../controllers/search');

router.get('/:searchValue', fetchSearchResults);

module.exports = router;