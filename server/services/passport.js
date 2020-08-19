const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const mongoose = require("mongoose");
const keys = require("../config/keys");

const User = mongoose.model("users");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback",
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      /* when we do some operation from mongodb, the operation is asynchronized.
         so we can not let a const to hold our result like const user = User.findOne({googleId: profile.id})*/
      const existingUser = await User.findOne({ googleId: profile.id });

      if (existingUser) {
        //we already have a record with the give profile Id
        done(null, existingUser);
      }

      //we don't have a user record with this ID, make a new record.
      const user = await new User({ googleId: profile.id }).save();
      done(null, user);
    }
  )
);
