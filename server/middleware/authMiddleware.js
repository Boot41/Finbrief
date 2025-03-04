const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const protect = (req, res, next) => {
  const token = req.headers.token ;
  const decodedData = jwt.verify(token ,process.env.JWT_SECRET)

  if(decodedData){
    req.userId = decodedData.userId
    next();
  }

  else{
    res.staus(403).json({
      message: "Incorrect Credential"
    })
  }
};

module.exports = protect;