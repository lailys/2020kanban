const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  pic: {
    type: String,
  },
  color: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  team: {
    type: Schema.Types.ObjectId,
    ref: 'Teams'
  },
  requested: [{
    type: Schema.Types.ObjectId,
    ref: 'Tasks'
  }],
  responded: [{
    type: Schema.Types.ObjectId,
    ref: 'Tasks'
  }],
  status: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenEXP: Date,
}, {
  timestamps: true
})

module.exports = mongoose.model('User', userSchema)
