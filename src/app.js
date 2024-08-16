import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { engine } from 'express-handlebars';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { passportConfig } from './config/passport.js';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/cart.router.js';
import authRouter from './routes/auth.router.js';
import viewsRouter from './routes/views.router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = 8080;

// Conectar a MongoDB
mongoose.connect('mongodb+srv://sjsalvadorit:coderhouse@cluster0.nhcqpqe.mongodb.net/ecommerce')
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); 
  });


app.engine('handlebars', engine({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware para manejar JSON, formularios y cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configurar Passport
passportConfig(passport);
app.use(passport.initialize());

// Rutas estáticas para archivos públicos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la API y Autenticación
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/auth', authRouter);
app.use('/', viewsRouter);

// Iniciar servidor
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

// Configurar Socket.io
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

export { app, io };
