const mongoose = require('mongoose')
var Schema = mongoose.Schema

/* Entry defining a logged IP and datetime of ToS agreement */
var entrySchema = new Schema({
  ip:  { type: String, index: true }, /* TODO sanitize ipv4 to prevent spam */
  date: { type: Date, default: Date.now }
})

var Entry = mongoose.model('Entry', acceptorSchema);

module.exports = {Entry: Entry}

