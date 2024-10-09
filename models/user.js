const mongoose = require('mongoose');

// Transaction Schema
const transactionSchema = new mongoose.Schema({
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    },
    amount: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true,
    },
});

// User Schema
const userSchema = new mongoose.Schema({ 
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    passwordHashed: { type: String, required: true },
    filiere: { type: String, required: true },
    carteID: { type: String, required: true, unique: true },
    solde: { type: Number, default: 0 },
    transactionHistory: {
        type: [transactionSchema],
        default: [],
    },   
});

// Transform the JSON output
userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject.passwordHashed; // Optionally remove hashed password
    },
});

module.exports = mongoose.model('User', userSchema);
