const mongoose = require('mongoose');

const indexSchema = new mongoose.Schema({
  value: {
    type: Number,
    default: 0,
    // required: true,
    // unique: true
  }
});

const IndexModel = mongoose.model('Index', indexSchema);

module.exports = IndexModel;
