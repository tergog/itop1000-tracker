const config = require('../config.json');
const mongoose = require('mongoose');
const connectionOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
mongoose.connect(process.env.MONGODB_URI || config.mongoURI, connectionOptions);
mongoose.Promise = global.Promise;

module.exports = {
    Account: require('../accounts/accounts.model'),
    isValidId
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValidId(id);
}
