import { Router } from "express";
import userModel from "../models/user.model.js";
import { signedCookie } from "cookie-parser";

const router = Router();


router.get("/setCookie",(req, res) =>{
    res.cookie("nombre", "javier", {maxAge: 900000});
    res.send("cookie establecida correctamente")
})

router.get("/getCookie",(req, res) =>{
    const nombre = req.cookies.nombre;
    res.send("El valor del nombre de la cookie es: " + nombre)
})

router.get("/setSignedCookie",(req, res) =>{
    res.cookie("signedCookie", "javier123", {maxAge: 900000, signed: true});
    res.send("cookie firmada establecida correctamente")
})

router.get("/getSignedCookie",(req, res) =>{
    const signedCookieValue = req.signedCookies.signedCookie;
    if (signedCookieValue) {
        res.send("El valor de signedCookieValue es: " + signedCookieValue)        
    } else {
        res.send("El valor de signedCookieValue ha sido alterado")
    }
})

router.get("/deleteCookie",(req, res) =>{
    res.clearCookie("nombre")
    res.send("Se borro la cookie nombre")
})

// Ruta para la vista de registro de usuarios
router.get("/register", (req, res) => {
  res.render("registerUser", { title: "Registro de Usuario", style: "register.css" });
});

// Ruta para crear un nuevo usuario
router.post("/", async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;

  try {
    // Validar si ya existe un usuario con el mismo email
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El correo electrónico ya está registrado" });
    }

    // Crear el nuevo usuario
    const newUser = new userModel({
      first_name,
      last_name,
      email,
      age,
      password, // Asegúrate de implementar hash de contraseña en el futuro
    });

    await newUser.save();
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
});

// Ruta para obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    const users = await userModel.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los usuarios" });
  }
});

// Ruta para obtener un usuario específico por ID
router.get("/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    const user = await userModel.findById(uid);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
});

// Ruta para actualizar un usuario
router.put("/:uid", async (req, res) => {
  const { uid } = req.params;
  const { first_name, last_name, email, age, password } = req.body;

  try {
    const updatedUser = await userModel.findByIdAndUpdate(
      uid,
      { first_name, last_name, email, age, password },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
});

// Ruta para eliminar un usuario
router.delete("/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    const deletedUser = await userModel.findByIdAndDelete(uid);
    if (!deletedUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar el usuario" });
  }
});

export default router;
