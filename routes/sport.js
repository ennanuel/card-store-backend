const router = require('express').Router();
const { fetchSports } = require('../controllers/sport');

router.get('/', fetchSports)

module.exports = router