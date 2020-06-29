/**
 * Mongoose model User.
 *
 * @author Mohammed Basel Nasrini
 * @version 1.0.0
 */

'use strict'

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Create user schema.
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    maxlength: [20, 'The username must be of the maximum length of 20 characters.']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'The password must be of the minimum length of 6 characters.'],
    maxlength: [100, 'The password must be of the maximum length of 100 characters.']
  }
}, {
  timestamps: true,
  versionKey: false
})

// Using a pre-hook (runs after validation and before saving).
userSchema.pre('save', async function (next) {
  try {
    const salt = await bcrypt.genSalt(12) // Generate unique salt.
    this.password = await bcrypt.hash(this.password, salt) // Hash the password using the generated salt. Replace the hashed one with the actual pass to save the hash one in the DB.
    next()
  } catch (err) {
    next(err)
  }
})

// Authenticate user username and password with DB data.
userSchema.statics.authenticate = async function (username, password) {
  const user = await this.findOne({ username }) // find user in the DB

  if (!user) {
    throw new Error('Invalid username.')
  } else {
    const isMatch = await bcrypt.compare(password, user.password) // compare the entered pass with teh one in DB
    if (isMatch) {
      return user
    } else {
      throw new Error('password wrong.')
    }
  }
}

// Create a model using the schema.
const User = mongoose.model('User', userSchema)

// Exports.
module.exports = User
