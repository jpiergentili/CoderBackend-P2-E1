import passport from "passport";
import local from "passport-local";
import GithubStrategy from 'passport-github';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { createHash, isValidPassword } from "../utils.js";
import userModel from "../models/user.model.js";

const LocalStrategy = local.Strategy;

const initializePassport = () => {
  // Estrategia de GitHub
  passport.use('github', new GithubStrategy({
    clientID: 'Iv1.2dd0364c45a5ab8e',
    clientSecret: '8078d71c11f25b2654b01941c606afe25b121146',
    callbackURL: 'http://localhost:8080/api/session/githubcallback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log(profile);

      const email = profile._json.email || `${profile.username}@github.com`;

      let user = await userModel.findOne({ email });
      if (!user) { 
        const newUser = {
          first_name: profile.displayName || profile.username,
          last_name: "GitHub",
          age: 18,
          email,
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
  passport.use('current', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromExtractors([(req) => req?.cookies?.token]),
    secretOrKey: "mysecret"
  }, async (jwt_payload, done) => {
    try {
      const user = await userModel.findById(jwt_payload.id);
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
  // Estrategia local para registro
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, email, password, done) => {
        const { first_name, last_name, age } = req.body;
        try {
          const existingUser = await userModel.findOne({ email });
          if (existingUser) {
            return done(null, false);
          }

          const newUser = new userModel({
            first_name,
            last_name,
            email,
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

  // Estrategia local para login
  passport.use(
    "login",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, email, password, done) => {
        try {
          const user = await userModel.findOne({ email });
          if (!user) {
            return done(null, false, { message: "Usuario no encontrado" });
          }
          if (!isValidPassword(user, password)) {
            return done(null, false, { message: "Contraseña incorrecta" });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialización y deserialización de usuarios
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userModel.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

export default initializePassport;
