/**
 * Snippets Controller.
 *
 * @author Mohammed Basel Nasrini
 * @version 1.0.0
 */

'use strict'
const Snippet = require('../models/Snippet')

const snippetsController = {}

/**
 * Displays a list of snippets.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
snippetsController.index = async (req, res, next) => {
  try {
    const filter = req.query.filter
    const filteredArr = []
    let snippets = (await Snippet.find({})) // Fetch all snippets from DB.
      .map(snippet => ({
        id: snippet._id,
        title: snippet.title,
        creator: snippet.creator,
        content: snippet.content,
        tags: snippet.tags,
        createdAt: snippet.createdAt.toLocaleString('en-US'),
        updatedAt: snippet.updatedAt.toLocaleString('en-US')
      }))

    const tagsSet = new Set()
    snippets.forEach(element => element.tags.forEach(e => tagsSet.add(e))) // Fetch tags of the snippets and add them to a set
    const tagsArr = [...tagsSet]

    if (filter) { // If a filter is chosen, display the filtered snippets only
      snippets.forEach(element => {
        if (element.tags.includes(filter)) {
          filteredArr.push(element)
        }
      })
      snippets = filteredArr
    }

    const viewData = { snippets, tagsArr, filter }
    res.render('snippets/index', { viewData, title: 'Snippets' })
  } catch (error) {
    next(error)
  }
}

/**
 * Displays add new snippet page, if user is loggend in.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
snippetsController.create = async (req, res, next) => {
  try {
    if (req.session.user) { // check if user is logged in.
      res.render('snippets/create')
    } else {
      res.status(403).render('errors/403', { message: 'Please log in to be able to create a snippet' }) // 403 error, user is not logged in
    }
  } catch (error) {
    next(error)
  }
}

/**
 * Handling creating new post request.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
snippetsController.createPost = async (req, res, next) => {
  try {
    if (req.session.user) {
      const tagsArr = req.body.tags.split(',').filter(function (e) { return e.trim().length > 0 })
      const snippet = new Snippet({
        title: req.body.title,
        creator: req.session.user.username,
        content: req.body.content,
        tags: tagsArr
      })
      await snippet.save() // Add the snippet to DB
      req.session.flash = {
        type: 'success',
        message: 'The snippet has been added successfuly'
      }
      res.redirect('/snippets')
    } else { // 403 error, session time is end or the user logged out
      res.status(403).render('errors/403', { message: 'Your session has expired or you logged out, Please log in again to be able to create the snippet' })
    }
  } catch (error) {
    next(error)
  }
}

/**
 * Displays edit a snippet page, if user is loggend in.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
snippetsController.edit = async (req, res, next) => {
  try {
    const snippet = await Snippet.findOne({ _id: req.params.id }) // find the snippet in DB.
    const viewData = {
      id: snippet._id,
      title: snippet.title,
      tags: snippet.tags,
      content: snippet.content
    }
    if (req.session.user && req.session.user.username === snippet.creator) { // check that the user edit his own snippet and is logged in
      res.render('snippets/edit', { viewData })
    } else if (!req.session.user) { // 403 error, user is not logged in
      res.status(403).render('errors/403', { message: 'Please log in to be able to edit snippets' })
    } else if (req.session.user.username !== snippet.creator) { // 403 error, user try to edit other than his snippets
      res.status(403).render('errors/403', { message: 'You can only edit your own snippets', back: true })
    }
  } catch (error) {
    next(error)
  }
}

/**
 * Handling edit snippet post request.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
snippetsController.update = async (req, res, next) => {
  try {
    if (req.session.user) {
      const tagsArr = req.body.tags.split(',').filter(function (e) { return e.trim().length > 0 })
      const result = await Snippet.updateOne({ _id: req.params.id }, { // update the snippet in DB
        title: req.body.title,
        content: req.body.content,
        tags: tagsArr
      })
      if (result.nModified === 1) { // if updating succeed, show flash msg
        req.session.flash = { type: 'success', message: 'The snippet was updated successfully.' }
      } else {
        req.session.flash = { // updating failed, snippet is no longer available in the DB. Show error flash msg.
          type: 'danger',
          message: 'The snippet you attempted to update was removed by another user.'
        }
      }
      res.redirect('/snippets')
    } else {
      res.status(403).render('errors/403', { message: 'Your session has expired or you logged out, Please log in again to be able to edit the snippet' }) // 403 error, user loggen out or the session has expired.
    }
  } catch (error) {
    req.session.flash = { type: 'danger', message: error.message }
    res.redirect('..')
  }
}

/**
 * Displays delete snippet confirmation page, if user is loggend in.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
snippetsController.remove = async (req, res) => {
  try {
    const snippet = await Snippet.findOne({ _id: req.params.id }) // find the snippet in the DB.
    const viewData = {
      id: snippet._id,
      title: snippet.title
    }
    if (req.session.user && req.session.user.username === snippet.creator) {
      res.render('snippets/remove', { viewData })
    } else if (!req.session.user) {
      res.status(403).render('errors/403', { message: 'Please log in to be able to delete snippets' }) // 403 error, user is not loggend in.
    } else if (req.session.user.username !== snippet.creator) {
      res.status(403).render('errors/403', { message: 'You can only delete your own snippets', back: true }) // 403 error, user try to delete other than his own snippets.
    }
  } catch (error) {
    req.session.flash = { type: 'danger', message: error.message }
    res.redirect('..')
  }
}

/**
 * Handling delete snippet post request.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
snippetsController.deletePost = async (req, res) => {
  try {
    if (req.session.user) {
      const result = await Snippet.deleteOne({ _id: req.params.id }) // Delete the snippet in the dB.
      if (result.deletedCount === 1) { // Deletion succeed
        req.session.flash = { type: 'success', message: 'The snippet was deleted successfully.' }
        res.redirect('..')
      } else if (result.deletedCount === 0) {
        req.session.flash = { // Deletion failed, the snippet is no longer available in the DB.
          type: 'danger',
          message: 'The snippet you attempted to delete was removed by another user.'
        }
        res.redirect('..')
      }
    } else {
      res.status(403).render('errors/403', { message: 'Your session has expired or you logged out, Please log in again to be able to delete the snippet' }) // 403 error, user loggen out or the session has expired.
    }
  } catch (error) {
    req.session.flash = { type: 'danger', message: error.message }
    res.redirect('..')
  }
}

// Exports.
module.exports = snippetsController
