'use strict';

const mongoose = require('mongoose')

const ImageSchema = new mongoose.Schema({
  path: { // 원래 있던거
    type: String,
    required: true
  },
  label: {  // 원래 있던거
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
})

module.exports = mongoose.model('Image', ImageSchema)