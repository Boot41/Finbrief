const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const protect = (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(403).json({ message: 'Incorrect Credential' });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET || 'testsecret');
    if (decodedData) {
      req.userId = decodedData.userId;
      next();
    } else {
      return res.status(403).json({ message: 'Incorrect Credential' });
    }
  } catch (err) {
    return res.status(403).json({ message: 'Incorrect Credential' });
  }
};

module.exports = protect;