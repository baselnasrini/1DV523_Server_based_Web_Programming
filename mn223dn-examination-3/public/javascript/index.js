/**
 * Client index.
 *
 * @author Mohammed Basel Nasrini
 * @version 1.0.0
 */

'use strict'
var socket = io.connect()

const notiContainer = document.querySelector('#notification-container')
const notiLbl = document.querySelector('#noti-label')
const notiTemp = document.querySelector('template#noti-temp')
const closeButton = document.querySelectorAll('#btnCloseIssue')

const issuesCont = document.querySelector('#issues-container')
const issueTemp = document.querySelector('template#issue-temp')
const issueCard = document.importNode(issueTemp, true).content
const issueTitle = issueCard.querySelector('#issueTitle')
const issueUsername = issueCard.querySelector('#issueUsername')
const issueBody = issueCard.querySelector('#issueBody')
const issueCreate = issueCard.querySelector('#issueCreatedAt')
const issueUpdate = issueCard.querySelector('#issueUpdatedAt')
const issueGhLink = issueCard.querySelector('#issueLink')
const commentsContainer = issueCard.querySelector('#commentsContainer')
const closeIssueBtn = issueCard.querySelector('#btnCloseIssue')

const commentTemp = document.querySelector('template#comment-temp')
const commentCard = document.importNode(commentTemp, true).content
const commentImg = commentCard.querySelector('#commentImg')
const commentBody = commentCard.querySelector('#commentBody')
const commentUser = commentCard.querySelector('#commentUser')
const commentUpdate = commentCard.querySelector('#commentUpdatedAt')

const title = document.querySelector('#title')

socket.on('connect', function (data) {
  console.log('Connected...')

  closeButton.forEach(button => {
    button.addEventListener('click', function () {
      socket.emit('closeIssue', button.classList[button.classList.length - 1])
    })
  })
})

socket.on('issue', function (data) {
  addNewNotification('issue', data.changedBody)
  updateRepoList(data.issuesList)
})

socket.on('issue_comment', function (data) {
  addNewNotification('issue_comment', data.changedBody)
  updateRepoList(data.issuesList)
})

/**
 * A method handels adding new notification in the page
 *
 * @param {string} type - Change type define the changes in Issue or Issue  comment
 * @param {JSON body} data - The POST request body
 */
function addNewNotification (type, data) {
  const notiCard = document.importNode(notiTemp, true).content
  const notiBody = notiCard.querySelector('#noti-body')

  if (type === 'issue') {
    if (data.action === 'opened') {
      notiBody.textContent = 'New issue "' + data.issue.title + '" added by (' + data.issue.user.login + ')'
      notiBody.classList.add('alert-success')
    } else if (data.action === 'edited') {
      if (data.changes.title) {
        notiBody.textContent = 'The title of the issue "' + data.changes.title.from + '" has been edited by (' + data.issue.user.login + ')'
        notiBody.classList.add('alert-info')
      } else if (data.changes.body) {
        notiBody.textContent = 'Issue "' + data.issue.title + '" has been edited by (' + data.issue.user.login + ')'
        notiBody.classList.add('alert-info')
      }
    } else if (data.action === 'closed') {
      notiBody.textContent = 'Issue "' + data.issue.title + '" has been closed by (' + data.issue.user.login + ')'
      notiBody.classList.add('alert-danger')
    } else if (data.action === 'locked') {
      notiBody.textContent = 'Issue "' + data.issue.title + '" has been locked by (' + data.issue.user.login + ')'
    } else if (data.action === 'unlocked') {
      notiBody.textContent = 'Issue "' + data.issue.title + '" has been unlocked by (' + data.issue.user.login + ')'
    } else if (data.action === 'reopened') {
      notiBody.textContent = 'Issue "' + data.issue.title + '" has been reopened by (' + data.issue.user.login + ')'
      notiBody.classList.add('alert-warning')
    } else if (data.action === 'labeled') {
      notiBody.textContent = 'Issue "' + data.issue.title + '" has been labeled by (' + data.issue.user.login + ')'
    } else if (data.action === 'unlabeled') {
      notiBody.textContent = 'Issue "' + data.issue.title + '" has been unlabeled by (' + data.issue.user.login + ')'
    } else {
      return
    }
  } else if (type === 'issue_comment') {
    if (data.action === 'created') {
      notiBody.textContent = 'New comment "' + data.comment.body + '" has been added to "' + data.issue.title + '" by (' + data.comment.user.login + ')'
      notiBody.classList.add('alert-success')
    } else if (data.action === 'edited') {
      notiBody.textContent = 'The comment "' + data.changes.body.from + '" in "' + data.issue.title + '" has been edited by (' + data.comment.user.login + ')'
      notiBody.classList.add('alert-info')
    } else if (data.action === 'deleted') {
      notiBody.textContent = 'The comment "' + data.comment.body + '" in "' + data.issue.title + '" has been deleted by (' + data.comment.user.login + ')'
      notiBody.classList.add('alert-danger')
    }
  }
  notiContainer.insertBefore(notiCard.cloneNode(true), notiLbl.nextElementSibling)
}

/**
 * A method updates the issues list after each new POST method.
 *
 * @param {Array} data - An array of issues
 */
function updateRepoList (data) {
  issuesCont.innerHTML = ''

  if (data.length > 0) {
    title.textContent = 'Opened issues in the repository :'
  } else {
    title.textContent = 'No opened issues in the repository'
  }
  data.forEach(issue => {
    issueTitle.textContent = issue.title
    issueUsername.textContent = 'By: ' + issue.user
    issueBody.textContent = issue.body
    issueCreate.textContent = 'Created at: ' + issue.createdAt
    issueUpdate.textContent = 'Last updated on: ' + issue.updatedAt

    closeIssueBtn.setAttribute('number', issue.number)
    closeIssueBtn.addEventListener('click', function () {
      socket.emit('closeIssue', closeIssueBtn.getAtribute('number'))
    })

    issueGhLink.href = issue.link
    commentsContainer.innerHTML = ''
    issue.comments.forEach(comment => {
      commentImg.src = comment.userImage
      commentBody.textContent = comment.body
      commentUser.textContent = 'By: ' + comment.user
      commentUpdate.textContent = 'Last updated on: ' + comment.updatedAt
      commentsContainer.appendChild(commentCard.cloneNode(true))
    })

    issuesCont.appendChild(issueCard.cloneNode(true))
  })
}
