const router = require('express').Router();
const { fetchTeams } = require('../controllers/team');

router.get('/', fetchTeams);

module.exports = router;