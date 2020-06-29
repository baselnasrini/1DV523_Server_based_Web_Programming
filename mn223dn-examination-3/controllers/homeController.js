/**
 * HomeController.
 *
 * @author Mohammed Basel Nasrini
 * @version 1.0.0
 */

'use strict'
const github = require('octonode')
const client = github.client(process.env.Key)
const repoName = '1dv523/mn223dn-examination-3'
const ghrepo = client.repo(repoName)
const crypto = require('crypto')

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
    const context = await fetchIssues()
    res.render('home/index', { context })
  } catch (error) {
    next(error)
  }
}

/**
 * Handling POST requests from Github.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
homeController.post = async (req, res, next) => {
  const changedBody = req.body
  const issuesList = await fetchIssues()
  const content = { changedBody, issuesList }
  if (req.headers['x-github-event'] === 'issues') { // Issue change occurs
    req.io.emit('issue', content)
  } else if (req.headers['x-github-event'] === 'issue_comment') { // Comment change occurs
    req.io.emit('issue_comment', content)
  }
  res.status(200)
  res.send('successfully received')
}

/**
 * Validate the POST request header from Github by the webhook secret.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
homeController.validatePost = async (req, res, next) => {
  const secret = crypto.createHmac('sha1', 'webhooksecret').update(JSON.stringify(req.body))
  const HashSecret = 'sha1=' + secret.digest('hex')

  if (HashSecret === req.headers['x-hub-signature']) { // Validate the signature of the POST request with the hashed secret
    next()
  } else {
    res.sendStatus(400).send('Post signature invalid')
  }
}

homeController.closeIssue = async function (data) {
  await client.issue(repoName, data).updateAsync({
    state: 'closed'
  })
}

/**
 * Async method fetchs the opened issue from the repository and return them in an array
 */
async function fetchIssues () {
  const result = await ghrepo.issuesAsync({ state: 'open' }) // Fetch open issues
  const issues = result[0].map(issue => ({
    id: issue.id,
    number: issue.number,
    user: issue.user.login,
    title: issue.title,
    body: issue.body,
    link: issue.html_url,
    createdAt: issue.created_at.toLocaleString('en-US'),
    updatedAt: issue.updated_at.toLocaleString('en-US'),
    commentCounter: issue.comments
  }))

  const last = issues.map(async issue => {
    const reposIssue = await client.issue(repoName, issue.number)
    const reposComments = await reposIssue.commentsAsync() // Fetch comments for each issue
    const comments = reposComments[0].map(comment => ({
      id: comment.id,
      body: comment.body,
      user: comment.user.login,
      userImage: comment.user.avatar_url,
      updatedAt: comment.updated_at.toLocaleString('en-US')
    }))
    issue.comments = comments
  })
  await Promise.all(last)
  return issues
}

// Exports.
module.exports = homeController
