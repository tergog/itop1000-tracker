const screenshotSchema = {
    link: { type: String },
    dateCreated: { type: Date, default: Date.now() }
}

module.exports = screenshotSchema;

