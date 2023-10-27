const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const Patient = require("./models/Patient.js");
const Clinician = require("./models/clincian.js");

module.exports = (passport) => {

  // following two functions are needed by passport to store user information in and retrieve user info from session
  passport.serializeUser((user, done) => {
    done(null, {_id: user._id, role: user.role});
  });

  passport.deserializeUser((people, done) => {
    if (people.role === "patient") {
      Patient.findById(people._id, (err, user) => {
        return done(err, user);
      })
    } else if (people.role === "clinician") {
      Clinician.findById(people._id, (err, user) => {
        return done(err, user);
      })

    }else {
      return done("This user is not a patient or clinician", null);
    } 

  })

  //checking database with input user and password for patient

  passport.use(
    "patient_verify", 
    new LocalStrategy({
        usernameField: "username",
        passwordField: "password",
        passReqToCallback : true
    },
    (req, username, password, done) => {
        process.nextTick(() => {
            // Find the user associated with the email provided by the user
            Patient.findOne({'email': username.toLowerCase()}, 
            async(err, patient) => {
              if (err) {
                return done(err);
              // return fail message if no user or password match in database
              } else if (!patient || !await bcrypt.compare(password, patient.password)) {
                return done(null, false, req.flash('reminder', 'Incorrect user or password'));

              } else {
                return done(null, patient, req.flash('reminder', 'Login successful'));
              }
            });
        })
    })
  )

  //checking database with input user and password for clinician

  passport.use(
    "clinician_verify", 
    new LocalStrategy({
        usernameField: "username",
        passwordField: "password",
        passReqToCallback : true
    },
    (req, username, password, done) => {
        process.nextTick(() => {
            // Find the user associated with the email provided by the user
            Clinician.findOne({email: username.toLowerCase()}, 
            async(err, clinician) => {
              if (err) {
                return done(err);
              // return fail message if no user or password match in database
              } else if (!clinician || !await bcrypt.compare(password, clinician.password)) {
                return done(null, false, req.flash('reminder', 'Incorrect user or password'));
              
              } else {

                return done(null, clinician, req.flash('reminder', 'Login successful'));
              }
            });
        })
    })
  )



  
}