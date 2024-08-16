import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  password: { type: String, required: true },
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  role: { type: String, default: 'user' }
});

// Middleware to hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    console.log('Hashing password for user:', this.email);
    const salt = await bcrypt.genSalt(10);
    this.password = bcrypt.hashSync(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);
export default User;
