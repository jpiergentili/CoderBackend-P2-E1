import express from "express";
import path from "path";
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import mongoose from "mongoose";
import MongoStore from 'connect-mongo';
import cookieParser from "cookie-parser";
import session from "express-session";
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import sessionRouter from './routes/session.router.js';
import passport from 'passport';
import initializePassport from './config/passport.config.js';

const uri = 'mongodb+srv://jp2:Q1w2e3r4@jp-backend-coder01.bavi18s.mongodb.net/';
const MONGO_DBNAME = "backendP1-EntregaFinal"
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.use(cookieParser("aaasssbbb"))

//Grabación de las sessions
app.use(session({
  store: MongoStore.create({
    mongoUrl: uri,
    dbName: MONGO_DBNAME,
    ttl: 60 * 60 * 24,
  }),
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false,
}));

mongoose.set('strictQuery', false);

//configuracion de passport
initializePassport()
app.use(passport.initialize());
app.use(passport.session())

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {dbName: MONGO_DBNAME});
    console.log('DB connected!');
  } catch (error) {
    console.log("No se pudo conectar con la base de datos!!", error);
  }
};

connectDB();

// Configuración de Handlebars
app.engine("handlebars", handlebars.engine({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
}));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "handlebars");

// Registrar los routers
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);
app.use('/api/session', sessionRouter);

app.get('/carts', async (req, res) => {
  const carts = await cartModel.find();
  res.render('carts', { carts });
});

app.get('/api/carts/:cid', async (req, res) => {
  const cart = await cartModel.findById(req.params.cid).populate('cartProducts.product');
  res.render('cartDetails', { cart });
});

// Inicializar el servidor http
app.listen(8080, () => {
  console.log("Servidor escuchando en el puerto 8080");
});