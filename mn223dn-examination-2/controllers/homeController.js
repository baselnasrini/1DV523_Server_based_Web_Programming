/**
 * HomeController.
 *
 * @author Mohammed Basel Nasrini
 * @version 1.0.0
 */

'use strict'
const User = require('../models/User')

const homeController = {}

/**
 * Displays the starting page.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
homeController.index = async (req, res, next) => {
  try {
    res.render('home/index', { title: 'Home' })
  } catch (error) {
    next(error)
  }
}

/**
 * Handling logIn's request.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
homeController.loginPost = async (req, res, next) => {
  try {
    const user = await User.authenticate(req.body.username, req.body.password) // check user enteries.
    await req.session.regenerate(function (err, result) { // login success, regenerate the session cookie, show flash msg and redirect to snippets page
      if (err) throw new Error(err.message)
      req.session.flash = {
        type: 'success',
        message: 'Login successful'
      }
      req.session.isLoggedin = true
      req.session.user = user
      res.redirect('snippets')
    })
  } catch (error) { // Login failed, wrong user name or password, show flash msg and redirect to the home page
    req.session.flash = {
      type: 'danger',
      message: 'Invalid login'
    }
    res.redirect('.')
  }
}

/**
 * Handling logOut request.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
homeController.logout = async (req, res, next) => {
  try {
    await req.session.regenerate(function (err, result) { // logout the user, regenerate the cookie, and show flash msg
      if (err) throw new Error(err.message)
      req.session.flash = {
        type: 'danger',
        message: 'Logged out successfuly'
      }
      res.redirect('/')
    })
  } catch (error) {
    next(error)
  }
}

// Exports.
module.exports = homeController
