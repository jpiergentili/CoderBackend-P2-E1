import express from "express";
import path from "path";
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import mongoose from "mongoose";
import cookieParser from "cookie-parser"
import session from "express-session";
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import usersRouter from './routes/users.router.js';

const uri = 'mongodb+srv://jp2:Q1w2e3r4@jp-backend-coder01.bavi18s.mongodb.net/backendP1-EntregaFinal';
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.use(cookieParser("aaasssbbb"))
app.use(session({
  //resave permite mantener la session activa en caso de que la sesion se mantenga inactiva. Si se deja en false, la sesion morira al salir.
  resave: true, 
  //saveUninitialized permite guardar cualquier session aun cuando el objeto de la session no tenga ningun contenido.
  saveUninitialized: true
}))

mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
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
app.use('/api/users', usersRouter);

app.get('/carts', async (req, res) => {
  const carts = await cartModel.find();
  res.render('carts', { carts });
});

app.get('/api/carts/:cid', async (req, res) => {
  const cart = await cartModel.findById(req.params.cid).populate('cartProducts.product');
  res.render('cartDetails', { cart });
});

app.get('/session', (req, res) =>{
  //si al conectar la session ya existe entonces aumentar el contador
  if (req.session.counter) {
    req.session.counter++;
    res.send(`se ha visitado el sitio ${req.session.counter} veces.`)
    } else {
    req.session.counter = 1;
    res.send('Bienvenido!')
  }
})

app.get("/logout", (req, res) =>{
  req.session.destroy(err => {
    if(!err){
      res.send("Logout exitoso!")
    }else{
      res.send({status:"Logout ERROR", body: err})}
  })
})

// Inicializar el servidor http
app.listen(8080, () => {
  console.log("Servidor escuchando en el puerto 8080");
});
