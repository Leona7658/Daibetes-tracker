const express = require("express");
const controller = require("../controllers/Controller.js");
const authenController = require("../controllers/authenController.js");
const passport = require("passport");
const loginChecker = require("./loginChecker.js");
const historyController = require("../controllers/historyController.js");
require('../passport.js')(passport);


const Router = express.Router();

//patient part
Router.get("/patient_dashboard", loginChecker.loggedIn, controller.renderPatientDashboard);
//display and update record today's data
Router.get("/record_health_data", loginChecker.loggedIn,controller.renderRecordData);
Router.post("/record_health_data", loginChecker.loggedIn, controller.updateRecordData);

//patient data history (patient view)
Router.get("/health_history", loginChecker.loggedIn, historyController.renderDataHistory);
Router.post("/health_history", loginChecker.loggedIn, historyController.dataHistoryInRange);

//patient change password 
Router.get("/changePassword", loginChecker.loggedIn, authenController.rendernewPassword);
Router.post("/changePassword", loginChecker.loggedIn, authenController.changePassword);

//displaying leaderboard
Router.get("/leaderboard", loginChecker.loggedIn,controller.renderLeaderBoard);

//------------------------------------------------------------------------------------------------


//clinican part
Router.get("/clinician_dashboard", controller.renderClinicianDashboard);

Router.get("/all_comment/:id", loginChecker.loggedIn, historyController.renderCommentHistory);
//adding new patient to database
Router.get("/register", loginChecker.loggedIn, authenController.registerPatient);
Router.post("/register", loginChecker.loggedIn, authenController.addNewPatient);

//patient details (support message and clinical notes)
Router.get("/patient_details/:id", loginChecker.loggedIn, historyController.renderPatientDetail);
Router.post("/patient_details/:id", loginChecker.loggedIn, historyController.addSuppMsgAndCliNote);

// edit patient details (thresholds and select require data)
Router.get("/edit_details/:id", loginChecker.loggedIn, controller.renderEditDetails);
Router.post("/edit_details/:id", loginChecker.loggedIn, controller.updateEditDetails);

//health data history (clinician view)
Router.get("/health_history/:id", loginChecker.loggedIn, historyController.renderDataHistory);
Router.post("/health_history/:id", loginChecker.loggedIn, historyController.dataHistoryInRange);

// clinical note history
Router.get("/note_history/:id", loginChecker.loggedIn, historyController.renderClinicalNoteHistory);
Router.post("/note_history/:id", loginChecker.loggedIn, historyController.noteHistoryInRange);


//------------------------------------------------------------------------------------------------




//login part
Router.get("/login_patient", loginChecker.notLoggedInPat, authenController.renderLoginPatient);
Router.get("/login_clinician", loginChecker.notLoggedInClin, authenController.renderLoginClinician);

//patient login and verify with database
Router.post("/login_patient",
  loginChecker.notLoggedInPat,
  passport.authenticate("patient_verify", {
    successRedirect: "/home/patient_dashboard",
    failureRedirect: "/home/login_patient",
    failureflash: true,
  })
);

//clinician login and verify with database
Router.post("/login_clinician",
  loginChecker.notLoggedInClin,
  passport.authenticate("clinician_verify", {
    successRedirect: "/home/clinician_dashboard",
    failureRedirect: "/home/login_clinician",
    failureflash: true,
  })
);
//log out 
Router.post("/logout", loginChecker.loggedIn, authenController.logout);

module.exports = Router;
