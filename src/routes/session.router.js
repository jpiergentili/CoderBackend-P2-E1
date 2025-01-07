import { Router } from "express";
import userModel from "../models/user.model.js";
import { createHash, isValidPassword } from '../utils.js'
import  { isLoggedIn, isLoggedOut} from '../middlewares/auth.js';

const router = Router();

// Ruta para mostrar la vista de registro
router.get('/register', isLoggedOut, (req, res) => {
  res.render("register");
});

// Ruta para crear un nuevo usuario
router.post("/register", async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El correo electrónico ya está registrado" });
    }

    const newUser = new userModel({ 
      first_name, 
      last_name, 
      email, 
      age, 
      password: createHash(password) // Guardar la contraseña encriptada
    });

    await newUser.save();
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
});

// Ruta para mostrar la vista de inicio de sesión
router.get('/login', isLoggedOut, (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }
    if (!isValidPassword(user, password)) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }
    
    // Guardar todos los datos necesarios en la sesión
    req.session.user = {
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      age: user.age,
      role: user.role
    };
    
    res.status(200).json({ message: "Inicio de sesión exitoso" });
  } catch (err) {
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// Ruta para mostrar la vista de perfil
router.get('/perfil', isLoggedIn, (req, res) => {
  if (!req.session.user) {
    return res.redirect("/api/session/login");
  }

  // Pasar todos los datos del usuario a la vista
  res.render("perfil", {
    user: req.session.user
  });
});

router.get('/restore-password', isLoggedOut, (req, res) => {
  res.render('restorePassword');
})

//Restaurar contraseña
router.post('/restore-password', async (req, res) => {
  const {email, newPassword} = req.body;
  try{
      const user = await User.findOne({ email: email });
      if (!user) {
          return res.status(400).send({ status: 'error', message: 'User not found' });
      }

      user.password = createHash(newPassword);
      await user.save();

      return res.redirect('/api/session/login');

  }catch (error) {
      return res.status(500).send({ status: 'error', message: 'Internal server error' });
  }
})

// Ruta para cerrar sesión
router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: "No se pudo cerrar la sesión" });
    }
    res.clearCookie("connect.sid");
    res.redirect("/api/session/login");
  });
});

export default router;
