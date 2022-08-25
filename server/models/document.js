const { Schema, model } = require('mongoose');

const Document = new Schema({
    _id: String,
    user: {
        type: String,
        required: true,
    },
    course: {
        type: String,
        required: true,
    },
    data: Object,
});

module.exports = model('Document', Document);