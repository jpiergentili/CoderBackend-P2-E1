import { Router } from "express";
import { createHash } from '../utils.js'
import  { isLoggedIn, isLoggedOut} from '../middlewares/auth.js';
import passport from "passport";
import jwt from 'jsonwebtoken';

const router = Router();

router.get('/current', passport.authenticate('current', { session: false }), (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json({
    status: "success",
    user: {
      id: req.user._id,
      email: req.user.email,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      age: req.user.age,
      role: req.user.role
    }
  });
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => {});

router.get('/githubcallback', passport.authenticate('github', {
  failureRedirect: '/api/session/faillogin'
}), (req, res) => {
  const token = jwt.sign(
      { id: req.user._id },
      "mysecret",
      { expiresIn: "1h" }
  );

  res.cookie('token', token, { httpOnly: true });
  req.session.user = {
      id: req.user._id,
      email: req.user.email,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      age: req.user.age,
      role: req.user.role
  };
  res.redirect('/api/session/perfil');
});

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

    // Generar el token JWT
    const token = jwt.sign(
      { id: user._id },
      "mysecret",
      { expiresIn: "1h" }
    );

    // Guardar el token en una cookie y devolver una respuesta
    res.cookie('token', token, { httpOnly: true }).json({
      status: "success",
      message: "Usuario registrado y sesión iniciada"
    });
  })(req, res, next);
});

// Ruta para mostrar la vista de inicio de sesión
router.get('/login', isLoggedOut, (req, res) => {
  res.render("login");
});

// Ruta para cargar el form de login
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

      // Generar el token JWT
      const token = jwt.sign(
        { id: user._id },
        "mysecret",
        { expiresIn: "1h" }
      );

      // Guardar el token en una cookie y devolver una respuesta
      res.cookie('token', token, { httpOnly: true }).json({
        status: "success",
        message: "Sesión iniciada correctamente"
      });
    });
  })(req, res, next);
});

// Ruta para mostrar la vista de perfil
router.get('/perfil', isLoggedIn, (req, res) => {
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
