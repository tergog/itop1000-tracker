const screenshotSchema = require('./screenshot.schema');

const projectSchema = {
    title: { type: String },
    employerId: { type: String },
    screenshotsPerHour: { type: Number },
    workTime: { type: Object },
    hoursPerWeek: { type: Number },
    interval: { type: Number },
    dateCreated: { type: Date, default: Date.now() },
    dateUpdated: { type: Date }
}

module.exports = projectSchema;
