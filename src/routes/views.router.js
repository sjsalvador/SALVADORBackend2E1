import express from 'express';
import passport from 'passport';
import Product from '../models/Product.js'; 

const router = express.Router();

// Ruta para el registro
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

// Ruta para el login
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Ruta protegida para el home
router.get('/home', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = req.user; // Usuario autenticado
    const products = await Product.find(); // Obtener la lista de productos desde la base de datos

    // Renderizar la vista de home con el nombre del usuario y la lista de productos
    res.render('home', {
      title: `Welcome ${user.first_name}!`,
      user: user.first_name,
      products, 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al cargar los productos' });
  }
});

// Ruta protegida para admin
router.get('/admin', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send('No autorizado');
  }

  // Renderizar la vista de admin
  res.render('admin', { title: 'Admin Dashboard', user: req.user.first_name });
});

export default router;
