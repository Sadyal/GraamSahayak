const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretpanchayatkey123', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
