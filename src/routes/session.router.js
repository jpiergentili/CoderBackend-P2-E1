import { Router } from "express";
import { createHash, isValidPassword } from '../utils.js'
import  { isLoggedIn, isLoggedOut} from '../middlewares/auth.js';
import passport from "passport";

const router = Router();

// Ruta para mostrar la vista de registro
router.get('/register', isLoggedOut, (req, res) => {
  res.render("register");
});

// Ruta para crear un nuevo usuario
router.post("/register", async (req, res, next) => {
  passport.authenticate("register", (err, user, info) => {
    if (err) {
      console.error("Error en el registro:", err);
      return res.status(500).json({ error: "Error interno al registrar el usuario." });
    }
    if (!user) {
      return res.status(400).json({ error: "El usuario ya está registrado." });
    }

    console.log("Usuario registrado exitosamente");
    return res.redirect("/api/session/login");
  })(req, res, next);
});

// Ruta para mostrar la vista de inicio de sesión
router.get('/login', isLoggedOut, (req, res) => {
  res.render("login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("login", (err, user, info) => {
    if (err) {
      console.error("Error en el login:", err);
      return res.status(500).json({ error: "Error interno al iniciar sesión." });
    }
    if (!user) {
      return res.status(400).json({ error: "Credenciales inválidas." });
    }

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: "Error al iniciar sesión." });
      }

      req.session.user = {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        age: user.age,
        role: user.role,
      };
      return res.json({ status: "success", payload: req.session.user });
    });
  })(req, res, next);
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

router.get('/faillogin',(req, res) => {
  res.send({ error: "Error al iniciar sesión" })
})

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
