import passport from "passport";
import local from "passport-local";
import GithubStrategy from 'passport-github'
import { createHash, isValidPassword } from "../utils.js";
import userModel from "../models/user.model.js";

const LocalStrategy = local.Strategy;

const initializePassport = () => {
  passport.use('github', new GithubStrategy({
    clientID: 'Iv1.2dd0364c45a5ab8e',
    clientSecret: '8078d71c11f25b2654b01941c606afe25b121146',
    callbackURL: 'http://localhost:8080/api/session/githubcallback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log(profile);
  
      // Verificar si el email existe; de lo contrario, generar uno ficticio
      const email = profile._json.email || `${profile.username}@github.com`;
  
      let user = await userModel.findOne({ email });
      if (!user) { 
        const newUser = {
          first_name: profile.displayName || profile.username,
          last_name: "GitHub",
          age: 18,
          email, // Usa el email existente o el ficticio
          password: "Autenticado por terceros"
        };
        let newUserCreated = await userModel.create(newUser);
        done(null, newUserCreated);
      } else {
        done(null, user);
      }
    } catch (error) {
      return done(error);
    }
  }));  
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
  passport.serializeUser((user, done) => {
    // Serializar el ID del usuario
    done(null, user._id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
        // Buscar el usuario por ID en la base de datos
        const user = await userModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
  });
};


export default initializePassport;