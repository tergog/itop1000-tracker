const {Schema, model} = require('mongoose');
const projectSchema = require('../_schemas/project.schema');

const schema = new Schema({
    email: { type: String },
    passwordHash: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    activeProjects: { type: [projectSchema] },
    dateCreated: { type: Date, default: Date.now },
    dateUpdated: { type: Date }
})

module.exports = model('Accounts', schema)
