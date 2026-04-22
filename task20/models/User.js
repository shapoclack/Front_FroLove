const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false // Отключаем поле __v
});

// Простой счетчик для автоинкремента ID
userSchema.pre('save', async function (next) {
    if (!this.isNew) {
        return next();
    }
    
    try {
        const lastUser = await this.constructor.findOne({}, {}, { sort: { 'id': -1 } });
        if (lastUser && lastUser.id) {
            this.id = lastUser.id + 1;
        } else {
            this.id = 1;
        }
        next();
    } catch (err) {
        next(err);
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
