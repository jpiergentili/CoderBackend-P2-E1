import passport from "passport";
import local from "passport-local";
import { createHash, isValidPassword } from "../utils.js";
import userModel from "../models/user.model.js";

const LocalStrategy = local.Strategy;

const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, email, password, done) => {
        const { first_name, last_name, age } = req.body; // Elimina `email` de aquí
        try {
          const existingUser = await userModel.findOne({ email: email });
          if (existingUser) {
            console.log("El usuario ya está registrado");
            return done(null, false);
          }

          const newUser = new userModel({
            first_name,
            last_name,
            email, // Usa el argumento `email` directamente
            age,
            password: createHash(password),
          });

          const userCreated = await newUser.save();
          return done(null, userCreated);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    let user = await userModel.findById(id);
    done(null, user);
  });
  passport.use(
    "login",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, email, password, done) => {
        try {
          const user = await userModel.findOne({ email: email });
          if (!user) {
            console.log("Usuario no encontrado");
            return done(null, false, { message: "Usuario no encontrado" }); //no falla pero no encuentra el usuario
          }
          if (!isValidPassword(user, password)) {
            console.log("Contraseña incorrecta");
            return done(null, false, { message: "Contraseña incorrecta" }); //no falla pero la contraseña no es correcta
          }
          return done(null, user); // si encuentra el usuario y la contraseña es correcta devuelve el usuario exitosamente
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};


export default initializePassport;