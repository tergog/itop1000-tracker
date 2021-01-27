const expressJwt = require('express-jwt');
const { secret } = require('../../config.json');
const db = require('../_db/db');

module.exports = authorize;

function authorize() {

  return [
    // authenticate JWT token and attach user to request object (req.user)
    expressJwt({ secret, algorithms: ['HS256'] }),

    // authorize based on user role
    async (req, res, next) => {
      const account = await db.Account.findById(req.user);
      if (!account) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      next();
    }
  ];
}
