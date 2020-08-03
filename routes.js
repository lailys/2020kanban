const express = require('express')
const controller = require('./controller')
const User = require('./models/User')
const checkAuth = require('./checkAuth')

const {
  body
} = require('express-validator')


const router = express.Router()


/* Team--------------- */
router.post('/teams', controller.postTeam)
router.get('/teams', controller.getTeams)
router.delete('/teams/:_id', checkAuth, controller.postDeleteTeam);
router.get('/team/:_id', controller.getTeamTasks)
router.put('/team-push/:_id', controller.postPushTask)
router.put('/team-remove/:_id', controller.postRemoveTask)
/* ----------------------------------------------------------- */
/* Task--------------- */
router.post('/tasks', checkAuth, controller.postTask)
router.get('/tasks', controller.getTasks)
router.get('/comments/:_id', controller.getComments)
router.post('/task-comment', checkAuth, controller.postComment)
router.post('/update-task', controller.postUpdateTask)
router.delete('/tasks/:_id', checkAuth, controller.postDeleteTask)
router.get('/task-members/:_id', controller.getTaskMember)
router.post('/task-members', checkAuth, controller.postTaskMember)
router.post('/task-members/remove', checkAuth, controller.postTaskMemberRemove)
router.post('/taskImg/:_id', checkAuth, controller.posttaskImg)
/* ----------------------------------------------------------- */
/* User--------------- */
router.get('/allUsers', controller.getUsers)
router.get('/user/:_id', controller.getUser)
router.post('/userImg/:_id', controller.postUserImg)
router.post('/login', controller.postLogin)
router.post('/users',
  [
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .custom((value, {
      req
    }) => {
      return User.findOne({
        email: value
      }).then(user => {
        if (user) {
          return Promise.reject("this Email already exists!")
        }
      })

    }).normalizeEmail(),
    body('password').trim().isLength({
      min: 6
    }).withMessage('password needs to have minimum 6 character.'),

    body('name').trim().not().isEmpty()
  ], controller.postSignUser)

/* ----------------------------------------------------------- */
/* Pssword--------------- */
router.post('/update-pass-request', controller.postPassReq)
router.post('/update-pass/:_id', controller.postNewPass)
/* ----------------------------------------------------------- */
/* Task--------------- */
/* ----------------------------------------------------------- */
/* User--------------- */
/* ----------------------------------------------------------- */



// router.get('/todos',controller.getTodos)
// router.post('/todos',controller.postTodos)

module.exports = router
