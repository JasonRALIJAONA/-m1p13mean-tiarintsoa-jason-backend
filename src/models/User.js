const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        role: {
            type: String,
            enum: ['admin', 'boutique', 'acheteur'],
            default: 'acheteur'
        },
        nom: {
            type: String,
            required: true,
            trim: true
        },
        prenom: {
            type: String,
            required: true,
            trim: true
        },
        isApproved: {
            type: Boolean,
            default: function() {
                // Auto-approve admins and acheteurs, but not boutiques
                return this.role !== 'boutique';
            }
        },
        approvedAt: {
            type: Date
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
