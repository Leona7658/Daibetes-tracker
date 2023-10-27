// middleware to check patient is logged in
function notLoggedInPat(req, res, next) {
    if (req.isAuthenticated() && req.user.role == "patient"){
      return res.redirect('/home/patient_dashboard');
    }
    next();
  }
// middleware to check clinician is logged in
function notLoggedInClin(req, res, next) {
    if (req.isAuthenticated() && req.user.role == "clinician" ){
      return res.redirect('/home/clinician_dashboard');
    }
    next();
  }
  
  function loggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    // if not logged in, redirect to login form
    res.redirect('/login_page');
  }

  module.exports = {
    notLoggedInPat,
    notLoggedInClin,
    loggedIn,
  }