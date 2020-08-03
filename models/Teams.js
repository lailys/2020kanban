const mongoose = require('mongoose')
const Schema = mongoose.Schema

const teamSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  color: {
    type: String,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requested: [{
    type: Schema.Types.ObjectId,
    ref: 'Tasks'
  }],
  inprogress: [{
    type: Schema.Types.ObjectId,
    ref: 'Tasks'
  }],
  done: [{
    type: Schema.Types.ObjectId,
    ref: 'Tasks'
  }],
})

module.exports = mongoose.model('Team', teamSchema)
