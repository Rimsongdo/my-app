const mongoose=require('mongoose')

const adminSchema=new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        passwordHashed: { type: String, required: true },
        fullName: { type: String, required: true },
        role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' }
    }
)

module.exports = mongoose.model('Admin', adminSchema);