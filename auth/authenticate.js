const jwt = require('jsonwebtoken');

const jwtKey =
  process.env.JWT_SECRET ||
  'add a .env file to root of project with the JWT_SECRET variable';



// implementation details
function authenticate(req, res, next) {
  const token = req.get('Authorization');

  if (token) {
    jwt.verify(token, jwtKey, (err, decoded) => {
      if (err) return res.status(401).json(err);

      req.decoded = decoded;

      next();
    });
  } else {
    return res.status(401).json({
      error: 'No token provided, must be set on the Authorization Header',
    });
  }
}


const genToken = user => {
  return new Promise((res, rej) => {
    jwt.sign(
      user,
      process.env.JWT_SECRET,
      { expiresIn: 1000 * 60 * 60 * 5 }, //5 hours
      (err, token) => {
        if (err) {
          rej(err);
        } else {
          res(token);
        }
      }
    );
  });
};

// quickly see what this file exports
module.exports = {
  authenticate,
  genToken
};