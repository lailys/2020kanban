const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  console.log(req.get('Authorization'), "req.get('Authorization')")
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'innizbogzaradpasbogzar');
  } catch (err) {
    console.log(err, "jwt.verify")
    //   err.statusCode = 500;
    //   throw err;
    res.send({
      msg: "jwt has been expired"
    })
  }
  if (!decodedToken) {
    console.log("!decodedToken")
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken._id;

  next();
}
