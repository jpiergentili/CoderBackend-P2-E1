export const isLoggedIn = (req, res, next) => {
  if (req.session.user) {
      next();
  } else {
      res.redirect('/api/session/login');
  }
};

export const isLoggedOut = (req, res, next) => {
  if (req.session && req.session.user) {
      console.log("Usuario autenticado, redirigiendo al perfil");
      res.redirect('/api/session/perfil');
  } else {
      console.log("No hay sesión activa, permitiendo acceso");
      next();
  }
};