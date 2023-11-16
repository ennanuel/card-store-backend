const mongoose = require('mongoose');

const InvalidTokenSchema = mongoose.Schema({
    token: String,
});

module.exports = mongoose.model('InvalidToken', InvalidTokenSchema);