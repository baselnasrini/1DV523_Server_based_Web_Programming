/**
 * Mongoose model Snippet.
 *
 * @author Mohammed Basel Nasrini
 * @version 1.0.0
 */

'use strict'

const mongoose = require('mongoose')

// Create snippet schema.
const snippetSchema = new mongoose.Schema({
  creator: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  tags: {
    type: [String]
  }
}, {
  timestamps: true,
  versionKey: false
})

// Create a model using the schema.
const Snippet = mongoose.model('Snippet', snippetSchema)

// Exports.
module.exports = Snippet
