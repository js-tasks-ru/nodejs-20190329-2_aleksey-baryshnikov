const mongoose = require('mongoose');

// https://mongoosejs.com/docs/guide.html
// https://mongoosejs.com/docs/schematypes.html
// https://mongoosejs.com/docs/validation.html

const schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        validate: [
            {
                validator(value) {
                    return /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(value);
                },
                message: 'некорректный email'
            }
        ],
        unique: true,
        lowercase: true,
        trim: true
    },
    displayName: {
        type: String,
        required: true,
        trim: true
    }
}, {
        collection: 'users',
        timestamps: true
    });

module.exports = mongoose.model('User', schema);
