'use strict';

const mongoose = require('mongoose')

const ImageSchema = new mongoose.Schema({
  path: { 
    type: String,
    required: true
  },
  label: { 
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  },
})

module.exports = mongoose.model('Image', ImageSchema)