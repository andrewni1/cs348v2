const mongoose = require('mongoose');

const stateSchema = mongoose.Schema({
    name: { type: String, required: true },
    population: { type: Number },
    capital: { type: String }
});

module.exports = mongoose.model('State', stateSchema);
