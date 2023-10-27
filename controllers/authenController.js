const Record = require("../models/record.js");
const Patient = require("../models/Patient.js");
const Clinician = require("../models/clincian.js");
const bcrypt = require("bcryptjs");
const Controller = require("./Controller.js");

const SALT_FACTOR = 10;

// logout part in patient_dashboard
  const logout = (req, res) => {
    req.logout();
    res.redirect("/login_page");
  };
  
  //login page for patient
  const renderLoginPatient = (req, res) => {
    res.render("login_portal_patient.hbs", req.session.flash);
  
  };
  
  //login page for clinician
  const renderLoginClinician= (req, res) => {
    res.render("login_portal_clinician.hbs", req.session.flash);
  };

  //displaying  register form 
  const registerPatient = async(req, res)=>{
    try{
      res.render("register_detail.hbs");
  
    }catch(err){
      console.log("error happens in render registering patient: ", err);
    }
  }

  //adding new patient to database
  const addNewPatient = async(req, res)=>{
    try{
      //email can't be duplicate
      if (await Patient.findOne({email:req.body.email}) ){
        const message = "email already been registered!"
        return res.render("register_detail.hbs", {message:message, data: req.body});

      }
      //clinician email has to be valid 
      if (! await Clinician.findOne({email:req.body.clinician}) ){
        const message = "wrong clinician email!"
        return res.render("register_detail.hbs", {message:message, data: req.body});

      }
      // password has to be the same for both confirm and original
      if (req.body.pwd == req.body.confirm) {
        const newPatient = new Patient({
          firstName: req.body.fname,
          lastName: req.body.lname,
          screenName: req.body.scrname,
          email: req.body.email,
          password: await bcrypt.hash(req.body.confirm, SALT_FACTOR), 
          yearOfBirth: req.body.birthyear,
          textBio: req.body.biotext,
          clinician: req.body.clinician,
        });
    // add patient to equivalent clinician side 
        const patient = await newPatient.save()
        await Clinician.findOneAndUpdate(
          {email: patient.clinician},
          {$push: {patient: patient.id}},
        );
        await Controller.searchAndCreateRecord(patient.id)
        res.redirect("/home/clinician_dashboard");
      } else{
        const message = "confirm password is different to password!"
        return res.render("register_detail.hbs", {message:message, data: req.body});
      }
      
    }catch(err){
      console.log("error happens in register patient: ", err);
    }
  };

// change passwor for patient 
  const changePassword = async (req, res) => {
    try {
      //find current patient 
      const patient = await Patient.findOne({_id: req.user._id});
      // old password has to be confirm  
      if (!(await bcrypt.compare(req.body.old, patient.password))) {
        return res.render("changeNewPassword.hbs", {
          message: "Wrong password! please try again",
        });
      }
      // incase of accidently typed incorrect new password
      if (!(req.body.new == req.body.confirm)) {
        return res.render("changeNewPassword.hbs", {
          message: "New password is different to new confirm password, try again",
        });
      }
      // new password  can't be the same as old password

      if (req.body.old == req.body.new) {
        return res.render("changeNewPassword.hbs", {
          message: "New password can not be the same as old password!",
        });
      }
      // otherwise change password 
      patient.password = await bcrypt.hash(req.body.confirm, SALT_FACTOR);
      await patient.save();
      res.render("changeNewPassword.hbs", {
        message: "Password update Successful!" });

    } catch (err) {
      console.log("error occurs in update password: ", err);
      res.send("error occurs in update password");
    }
  };

  const rendernewPassword = (req, res) => {
    res.render("changeNewPassword.hbs");
  };
  


  module.exports = {
    renderLoginPatient,
    renderLoginClinician,
    logout,
    addNewPatient,
    registerPatient, 
    changePassword,
    rendernewPassword,
  }