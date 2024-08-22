import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/User.js';

const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({ first_name, last_name, email, age, password: hashedPassword });

    await newUser.save();

    // Generar un token JWT
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, 'secretkey', { expiresIn: '1h' });

    // Establecer el token en una cookie y redirigir al home
    res.cookie('token', token, { httpOnly: true }).redirect('/home');
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Ruta de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.log('Usuario no encontrado');
      return res.status(400).json({ status: 'error', message: 'Invalid credentials' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      console.log('Contraseña incorrecta');
      return res.status(400).json({ status: 'error', message: 'Invalid credentials' });
    }

    // Generar un token JWT
    const token = jwt.sign({ id: user._id, role: user.role }, 'secretkey', { expiresIn: '1h' });

    // Establecer el token en una cookie y redirigir al home
    res.cookie('token', token, { httpOnly: true }).redirect('/home');
  } catch (error) {
    console.log('Error en el proceso de login:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Ruta de logout
router.post('/logout', (req, res) => {
  res.clearCookie('token'); // Elimina la cookie que contiene el token
  res.status(200).send(); // Envía una respuesta exitosa
});

// ruta: /api/sessions/current
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Si el usuario está autenticado, devuelve sus datos
  res.json({
    status: 'success',
    user: {
      id: req.user._id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      age: req.user.age,
      role: req.user.role,
    },
  });
});

export default router;
