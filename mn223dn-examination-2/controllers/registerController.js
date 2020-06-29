/**
 * Register Controller.
 *
 * @author Mohammed Basel Nasrini
 * @version 1.0.0
 */

'use strict'
const User = require('../models/User')

const registerController = {}

/**
 * Displays the register page.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
registerController.registerIndex = async (req, res, next) => {
  try {
    res.render('register/index', { title: 'Register' })
  } catch (error) {
    next(error)
  }
}

/**
 * Handling the register new user request.
 * userame and email should be unique.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
registerController.registerPost = async (req, res, next) => {
  try {
    const user = new User({ // Fetch the entered data and create the new user.
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    })
    await user.save() // Add the new user to DB
    req.session.flash = { // Show successful flash msg.
      type: 'success',
      message: 'User register successful'
    }
    res.redirect('/')
  } catch (error) {
    if (error.message.includes('duplicate key')) { // User is already exist, userame and email should be unique.
      req.session.flash = {
        type: 'danger',
        message: 'User is alreday registered'
      }
      res.redirect('/register')
    }
  }
}

// Exports.
module.exports = registerController
