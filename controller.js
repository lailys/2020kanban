const Dos = require('./models/Dos')
const Team = require('./models/Teams')
const User = require('./models/User')
const helper = require('./file')
const io = require('./soket');
const moment = require('moment'); // require




const {
  validationResult
} = require('express-validator')
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require('jsonwebtoken');

const nodemailer = require("nodemailer");
const sgTransport = require('nodemailer-sendgrid-transport');
const {
  populate,
  exists
} = require('./models/Dos');


const mailer = nodemailer.createTransport(sgTransport({
  auth: {
    api_key: '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'
  }
}));

/* Team--------------- */
exports.postTeam = (req, res, next) => {
  const title = req.body.title
  const color = req.body.color
  const creator = req.body.user
  const tasks = []
  const team = new Team({
    title: title,
    color: color,
    tasks: tasks,
    creator: creator
  })
  team.save()
    .then(result => {
      io.getIO().emit('team', {
        action: 'create',
        team: result
      })
      res.status(201).json({
        message: 'a new team has been added',
        team: result
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}
exports.getTeams = (req, res, next) => {
  Team.find()
    .then(teams => {
      res
        .status(200)
        .json({
          message: 'Fetched teams successfully.',
          teams: teams
        });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}
exports.postDeleteTeam = (req, res, next) => {
  Team.findById(req.params._id)
    .then(team => {
      return Team.findByIdAndRemove(team._id);
    })
    .then(result => {
      Team.find()
        .then(teams => {
          res.status(200).json({
            message: 'team has been deleted successfully.',
            teams: teams
          });
        })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });

}
exports.getTeamTasks = (req, res, next) => {
  Team.findById(req.params._id.split('-')[1])
    .populate('requested')
    .populate('inprogress')
    .populate('done')
    .then(team => {
      if (req.params._id.split('-')[2] === "na" || req.params._id.split('-')[2] === "undefined" || !req.params._id.split('-')[2]) {
        res.status(200).json({
          message: 'all tasks has been fetched.',
          tasks: {
            "REQUESTED": team.requested,
            "INPROGRESS": team.inprogress,
            "DONE": team.done
          }
        });
      } else {
        let temp = []
        if (req.params._id.split('-')[3] === "STANDARD") {
          temp = team[req.params._id.split('-')[2].toLowerCase()].slice(0).filter(task => task.priority === "#0aa7f5")
        } else
        if (req.params._id.split('-')[3] === "FIXED") {
          temp = team[req.params._id.split('-')[2].toLowerCase()].slice(0).filter(task => task.priority === "#EDF67D")
        } else
        if (req.params._id.split('-')[3] === "EXPEDITE") {
          temp = team[req.params._id.split('-')[2].toLowerCase()].slice(0).filter(task => task.priority === "#ff006e")
        } else
        if (!req.params._id.split('-')[3]) {
          temp = team[req.params._id.split('-')[2].toLowerCase()]
        }
        res.status(200).json({
          message: 'the specific tasks have been fetched',
          tasks: temp
        });
      }
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}
/* ----------------------------------------------------------- */
/* Task--------------- */

exports.postTask = (req, res, next) => {
  const title = req.body.title
  const description = req.body.description
  const creator = req.body.creator
  const priority = req.body.priority
  const responder = req.body.responder
  const stage = req.body.stage
  const url = req.body.url
  const team = req.body.team._id
  const teamName = req.body.team.title
  const pic = ""
  if (req.body.datetime) {
    if (new Date(req.body.datetime) > new Date()) {
      const todo = new Dos({
        deadline: req.body.datetime,
        title: title,
        description: description,
        creator: creator,
        priority: priority,
        responder: responder,
        stage: stage,
        url: url,
        team: team,
        teamName: teamName,
        pic: pic
      })
      todo.save()
        .then(result => {
          Team.findById(team)
            .then(team => {
              team.requested.push(result)
              team.save()
                .then(added => {
                  User.findById(creator)
                    // populate()
                    .then(user => {
                      user.requested.push(result)
                      user.save()
                        .then(finalized => {
                          io.getIO().emit('task', {
                            action: 'create'
                          })
                          res.status(201).json({
                            message: 'the task request has been submitted',
                            post: result,
                            done: 1
                          })
                        })
                    })
                })
            })
        })
        .catch(err => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    } else {
      res.status(200).json({
        message: 'date has to be in future.',
        done: 0
      });
    }
  } else {
    const todo = new Dos({
      deadline: "",
      title: title,
      description: description,
      creator: creator,
      priority: priority,
      responder: responder,
      stage: stage,
      url: url,
      team: team,
      teamName: teamName,
      pic: pic
    })
    todo.save()
      .then(result => {
        Team.findById(team)
          .then(team => {
            team.requested.push(result)
            team.save()
            User.findById(creator)
              .then(user => {
                user.requested.push(result)
                user.save()
                io.getIO().emit('task', {
                  action: 'create',
                  task: result
                })
                res.status(201).json({
                  message: 'the task request has been submitted',
                  post: result,
                  done: 1
                })
              })
          })
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  }
}
exports.postUpdateTask = (req, res, next) => {
  const title = req.body.title
  const description = req.body.description
  const priority = req.body.priority
  const url = req.body.url
  const deadline = req.body.deadline
  Dos.findById(req.body.id)
    .then(task => {
      if (task.creator.toString() === req.body.user) {
        if (req.body.deadline) {
          if (new Date(req.body.deadline) > new Date()) {
            task.title = title
            task.description = description
            task.priority = priority
            task.url = url
            task.deadline = deadline
            task.save()
              .then(result => {
                res.status(201).json({
                  message: 'the update to this task has been submitted',
                  post: result,
                  done: 1
                })
              })
              .catch(err => {
                if (!err.statusCode) {
                  err.statusCode = 500;
                }
                next(err);
              });
          } else {
            res.status(200).json({
              message: 'date has to be in future.',
              done: 0
            });
          }
        } else {
          task.title = title
          task.description = description
          task.priority = priority
          task.url = url
          task.deadline = deadline
          task.save()
            .then(result => {
              res.status(201).json({
                message: 'the update to this task has been submitted',
                post: result,
                done: 1
              })
            })
            .catch(err => {
              if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
            });
        }
      } else {
        res.status(201).json({
          message: 'you dont have the right to make any updates in the info of this task',
          done: 0
        })
      }
    })
}
exports.getTasks = (req, res, next) => {
  Dos.find()
    .sort({
      updatedAt: -1
    })
    .then(tasks => {
      res.status(201).json({
        message: 'all tasks has been fetched.',
        tasks: tasks
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}
exports.postComment = (req, res, next) => {

  Dos.findById(req.body.taskId)
    .then(task => {
      if (req.body.responders.filter(responder => responder._id === req.body.user).length > 0) {
        User.findById(req.body.user)
          .then(user => {
            task.comments.push({
              id: req.body.comment.id,
              commenter: user.name,
              comment: req.body.comment.comment,
              date: req.body.date
            })
            task.save()
            io.getIO().emit('taskComment', {
              action: 'create'
            })
            res.status(201).json({
              message: 'comment has been posted successfully',
              done: 1
            });
          })
      } else {
        res.status(201).json({
          message: 'you are not part of this project yet',
          done: 0
        });
      }
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}
exports.getComments = (req, res, next) => {
  Dos.findById(req.params._id)
    .then(task => {
      res.status(201).json({
        message: 'all comments of this task has been fetched.',
        comments: task.comments
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}
exports.postPushTask = (req, res, next) => {
  Team.findById(req.params._id)
    .then(team => {
      Dos.findById(req.body.card._id)
        .then(task => {
          task.stage = req.body.board
          task.save()
            .then(taskResult => {
              team[req.body.board.toLowerCase()].push(taskResult)
              team.save()
                .then(result => {
                  io.getIO().emit('taskChange', {
                    action: 'create'
                  })
                  res.status(200).json({
                    message: 'task has been pushed.',
                    done: 1
                  });
                })
            })
        })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });


}
// exports.postRemoveTask = (req, res, next) => {
//   console.log(req.params,"postRemoveTask",req.body,"-----------")
//   Team.findById(req.params._id)
//     .then(team => {
//       team[req.body.board.toLowerCase()].splice(req.body.index, 1)
//       team.save()
//         .then(result => {
//           io.getIO().emit('taskChange', {
//             action: 'create'
//           })
//           res.status(200).json({
//             message: 'task has been pushed.',
//             done: 1
//           });
//         })
//     })
//     .catch(err => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });


// }
exports.postRemoveTask = (req, res, next) => {
  console.log(req.params,"postRemoveTask",req.body,"-----------")
  
    Team.findById(req.params._id)
    .then(team=>{
      const index=team[req.body.board.toLowerCase()].indexOf(req.body.index)
      console.log(index,"indexxxxxx")
      team[req.body.board.toLowerCase()].splice(index, 1)
      team.save()
      .then(result=>{
        io.getIO().emit('taskChange', {
          action: 'create'
        })
        res.status(200).json({
          message: 'task has been pushed.',
          done: 1
        });
    })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
  
  
  }
exports.getUser = (req, res, next) => {
  User.findById(req.params._id)
    .populate('requested')
    .populate('responded')
    .populate('done')
    .then(user => {
      res.status(200).json({
        message: 'user info has been fetched successfully.',
        done: 1,
        user: user
      });
    })
}
exports.postDeleteTask = (req, res, next) => {
  Dos.findById(req.body.task)
    .then(task => {
      if (task.creator.toString() === req.body.user) {
        Team.findById(req.body.team)
          .then(team => {
            team[req.body.stage.toLowerCase()].splice(req.body.i, 1)
            team.save()
            User.findById(task.creator)
              .then(user => {
                helper.deleteFile(task.pic)
                const indexRq = JSON.parse(JSON.stringify(user)).requested.indexOf(req.body.task)
                const indexRs = JSON.parse(JSON.stringify(user)).responded.indexOf(req.body.task)
                user.requested.splice(indexRq, 1)
                user.responded.splice(indexRs, 1)
                user.save()
                io.getIO().emit('taskChange', {
                  action: 'create'
                })
                return Dos.findByIdAndRemove(req.body.task);
              })
              .then(result => {
                io.getIO().emit('taskChange', {
                  action: 'create'
                })
                res.status(200).json({
                  message: 'task has been deleted successfully.',
                  done: 1
                });
              })
          })
      } else {
        res.status(200).json({
          message: "you dont have the right to delet this",
          done: 0
        });
      }
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

exports.getTaskMember = (req, res, next) => {
  Dos.findById(req.params._id)
    .then(task => {
      res.status(200).json({
        message: "you have been added or have been part of this project",
        members: task.responders
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}
exports.postTaskMember = (req, res, next) => {
  Dos.findById(req.body.task._id)
    // .populate('responders')
    .then(task => {
      const exists = task.responders.filter(responder => responder._id.toString() === req.body.user)
      if (exists.length === 0) {
        User.findById(req.body.user)
          .then(user => {
            task.responders.push(user)
            task.save()
            user.responded.push(task)
            user.save()
            io.getIO().emit('taskMember', {
              action: 'create'
            })
            res.status(200).json({
              message: "you have been added ",
              done: 1
            });
          })
      } else {
        res.status(200).json({
          message: "you are already part of this project",
        });
      }
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });

}
exports.postTaskMemberRemove = (req, res, next) => {
  Dos.findById(req.body.task)
    .then(task => {
      if (task.creator.toString() === req.body.user) {
        const resIndex = JSON.parse(JSON.stringify(task)).responders.indexOf(req.body.user)
        task.responders.splice(resIndex, 1)
        task.save()
        User.findById(req.body.user)
          .then(user => {
            const index = JSON.parse(JSON.stringify(user)).responded.indexOf(req.body.task)
            user.responded.splice(index, 1)
            user.save()
            // .then(result=>{
            io.getIO().emit('taskMember', {
              action: 'delete'
            })
            res.status(200).json({
              message: "you are out of the project successfully ",
              members: task.responders,
              done: 1
            });
            // })
          })
      } else {
        res.status(200).json({
          message: "you dont have the right to remove this member ",
          done: 0
        });
      }
    })
}
exports.posttaskImg = (req, res, next) => {
  if (!req.file) {
    res.status(200).json({
      message: "no image has been submited",
      done: 0
    });
  } else {
    Dos.findById(req.params._id.split('-')[1])
      .then(task => {
        if (task.creator.toString() === req.params._id.split('-')[0]) {
          helper.deleteFile(task.pic)
          task.pic = req.file.path
          task.save()
          io.getIO().emit('taskImg', {
            action: 'create',
            img: task.pic
          })
          res.status(200).json({
            message: "image has been submitted successfully",
            done: 1
          })
        } else {
          res.status(200).json({
            message: "you do not have the right to submit an image for this page",
            done: 0
          });
        }
      })
  }
}
/* ----------------------------------------------------------- */
/* User--------------- */
exports.postSignUser = (req, res, next) => {
  const name = req.body.name
  const email = req.body.email
  const password = req.body.password
  const confirmPassword = req.body.confirmPassword
  const pic = ""
  const color = req.body.color
  const errors = validationResult(req)
  if (!errors.isEmpty() || password !== confirmPassword) {
    const error = new Error('validation failed');
    let allErrs = []
    if (password !== confirmPassword) {
      allErrs = [...errors.array(), {
        value: "passwords need to match",
        msg: "Password confirmation does not match password"
      }]
    }
    error.data = allErrs
    throw error
  }
  bcrypt.hash(password, 12)
    .then(hashedPass => {
      const user = new User({
        name: name,
        email: email,
        password: hashedPass,
        status: "Verification",
        pic: pic,
        color: color
      })
      return user.save()
    })
    .then(result => {
      mailer.sendMail({
        to: `${email}`,
        from: 'laily@lailys.com',
        subject: 'Signup Confirmation',
        html: '<p>yey<p/>'
      });
      io.getIO().emit('signup', {
        action: 'create'
      })
      res.status(201).json({
        message: "user has been signed up, next step is verification",
        user: result._id
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}
exports.postUserImg = (req, res, next) => {
  if (req.params._id.split('-')[1] === req.params._id.split('-')[0]) {
    if (!req.file) {
      res.status(200).json({
        message: "no image has been submited",
        done: 0
      });
    } else {
      User.findById(req.params._id.split('-')[1])
        .then(user => {
          helper.deleteFile(user.pic)
          user.pic = req.file.path
          user.save()
            .then(
              result => {
                if (result) {
                  io.getIO().emit('userImg', {
                    action: 'create',
                    data: user.pic
                  })
                  res.status(200).json({
                    message: "image has been submitted successfully",
                    done: 1
                  })
                } else {
                  res.status(200).json({
                    message: "image has been submitted successfully",
                    done: 0
                  })
                }
              }
            )
        })
        .catch(err => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    }
  } else {
    res.status(200).json({
      message: "you do not have the right to submit an image for this page",
      done: 0
    });
  }
}
exports.getUsers = (req, res, next) => {
  User.find()
    .populate('requested')
    .populate('responded')
    .then(users => {
      res.status(201).json({
        message: "all users has been fetched",
        users: users
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}
exports.postLogin = (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    res.json({
      err: [{
        value: "something went wrong",
        msg: "Please fill the form!"
      }],
    })
  } else {

    User.findOne({
        email: req.body.email
      })
      .then(user => {
        if (!user) {
          res.json({
            err: [{
              value: "something went wrong",
              msg: "this email dosnt exists!"
            }],
          })
        } else {
          bcrypt.compare(req.body.password, user.password).then((doMatch) => {
            if (!doMatch) {
              res.send({
                err: [{
                  value: "something went wrong",
                  msg: "either email or password is wrong!"
                }],
              });
            } else
            if (doMatch) {
              const token = jwt.sign({
                  email: user.email,
                  _id: user._id.toString()
                },
                'innizbogzaradpasbogzar', {
                  expiresIn: '1h'
                }
              );
              io.getIO().emit('loggedin', {
                action: 'create',
              })
              res.status(201).json({
                message: "user successfully logged in",
                token: token,
                _id: user._id.toString()

              })
            }
          });
        }
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  }
}

/* ----------------------------------------------------------- */
/* Password--------------- */
exports.postPassReq = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      res.json({
        err: [{
          value: "something went wrong",
          msg: err
        }],
      })
    }
    const token = buffer.toString("hex");
    User.findOne({
        email: req.body.email
      })
      .then((user) => {
        if (!user) {
          res.json({
            err: [{
              value: "something went wrong",
              msg: "this email dosnt exists!"
            }],
          })
        } else {
          user.resetToken = token;
          user.resetTokenEXP = Date.now() + 3600000;
          return user.save();
        }
      })
      .then((result) => {
        res.json({
          token: token
        })
        mailer.sendMail({
          to: `${req.body.email}`,
          from: 'laily@lailys.com',
          subject: 'password update',
          html: `<p>To update your password please click on this<a href="http://localhost:3000/password-Update/${token}">link</a>to set a new password.</p>`
        });
      })
  })
}
exports.postNewPass = (req, res, next) => {
  const password = req.body.confirmPassword
  const confirmPassword = req.body.confirmPassword
  User.findOne({
      resetToken: req.params._id,
      resetTokenEXP: {
        $gt: Date.now()
      },
    })
    .then((result) => {
      if (password !== confirmPassword) {
        res.send({
          err: [{
            value: "passwords need to match",
            msg: "Password confirmation does not match password"
          }]
        });
      }
      bcrypt.hash(password, 12)
        .then((hasedPass) => {
          result.password = hasedPass;
          result.save().then((p) => {
            res.status(201).json({
              message: "user has been signed up, next step is verification",
              user: p._id
            })
          });
        })
    })
}
/* ----------------------------------------------------------- */
/* User--------------- */
/* ----------------------------------------------------------- */
