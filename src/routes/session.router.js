import { Router } from "express";
import userModel from "../models/user.model.js";
/* import { signedCookie } from "cookie-parser"; */

const router = Router();

// Ruta para mostrar la vista de registro
router.get("/register", (req, res) => {
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

    const newUser = new userModel({ first_name, last_name, email, age, password });
    await newUser.save();
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
});

// Ruta para mostrar la vista de inicio de sesión
router.get("/login", (req, res) => {
  res.render("login");
});

// Ruta para iniciar sesión
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    req.session.user = { id: user._id, email: user.email, role: user.role };
    res.status(200).json({ message: "Inicio de sesión exitoso" });
  } catch (err) {
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

export default router;
