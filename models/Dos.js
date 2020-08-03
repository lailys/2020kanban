const mongoose = require('mongoose')
const Schema = mongoose.Schema

const dosSchema = new Schema({
  pic: {
    type: String,
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deadline: {
    type: Date,
  },
  priority: {
    type: String,
    required: true
  },
  responders: [{
    // type: Schema.Types.ObjectId,
    // ref: 'User'
    type:Schema.Types.Mixed
  }],
  url: {
    type: String,
  },
  stage: {
    type: String,
    required: true
  },
  team: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  teamName: {
    type: String,
    required: true
  },
  position: {
    type: Number,
    //   required:true
  },
  comments: [{
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    commenter: {
      type: String,
      required: true
    },
    comment: {
      type: String,
      required: true,
    },
    date: {
      type: Date
    },
  }]
}, {
  timestamps: true
})

module.exports = mongoose.model('Tasks', dosSchema)
