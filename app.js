const express = require('express')
const path = require('path');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer = require('multer');
const cors = require("cors");
const helmet = require('helmet')
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
const https = require('https')


const routes = require('./routes')

const MongoURL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0-m4fqf.mongodb.net/${process.env.DEFAULT}?retryWrites=true`

const app = express()
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'), {
    flags: 'a'
  }
)
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
  app.use(express.static('client/build'));
}
app.use(helmet())
app.use(compression());
app.use(morgan('combined', {
  stream: accessLogStream
}));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json())
app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter
  }).single('picUrl')
);
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(cors());
app.use((req, res, next) => {
  // res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.setHeader('Access-Control-Allow-Headers', 'Origin', 'Accept', 'X-Requested-With', 'Content-Type', 'Access-Control-Request-Method', 'Access-Control-Request-Headers', 'Authorization');
  next()
})
app.use(routes)
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
  });
}
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({
    message: message,
    data: data
  });
});
mongoose.connect(MongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(result => {
    const server = app.listen(process.env.PORT || 8080)
    const io = require("./soket").init(server);
    io.on("connection", (socket) => {
      console.log("client connected");
    });
    // app.listen(8080)
  })
  .catch(err => console.log(err))
