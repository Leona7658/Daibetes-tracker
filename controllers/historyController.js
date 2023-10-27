const Record = require("../models/record.js");
const Patient = require("../models/Patient.js");
const Clinician = require("../models/clincian.js");

const ClinicalNote = require("../models/clinicalNote.js");
const supportMessage = require("../models/supportMessage.js");

const Controller = require("./Controller.js");
const SupportMessage = require("../models/supportMessage.js");

// display all comments entered by patients 
const renderCommentHistory = async(req, res)=>{
    try{
      const patientId = req.params.id;
      // extracting patient information
      const patient = await Patient.findOne({_id:patientId })
      .populate({
        path: "records",
        options: { lean: true },
      })
      .lean();
  
      res.render("clinician-comment.hbs", {patient:patient});
      
    }catch(err){
      console.log("error happens in render record history: ", err);
    }
  };

//adding support message to database
async function addSupportMessage(message, patient, clinician) {
    try {
        // update new support message to patient
        patient.supportMessage = message;
        await patient.save();
        // create new support message in database
        const newMessage = new supportMessage({
            patientId: patient.id,
            clinicianId: clinician.id,
            message: message,
            createdAt: new Date(),
        });
        
        const supportM = await newMessage.save();
        //update support message in clinican database
        await Clinician.findOneAndUpdate(
            {_id: clinician.id}, 
            {$push: {supportMessage: supportM}},
            
        );    
        return supportM.id;

    }catch(err) {
        console.log("error occurs in add support message: ", err);

    }
};

async function addClinicalNote(note, patient, clinician) {
    try {
        //create new clinical notes
        const newNote = new ClinicalNote({
            patientId: patient.id,
            clinicianId: clinician.id,
            note: note,
            noteDate: new Date().toLocaleString("en-US", 
            {timeZone: "Australia/Melbourne", year: 'numeric', month: 'numeric', 
            day: 'numeric', hour: '2-digit', minute:'2-digit'}).replace(/\//g, "-"),
            createdAt: new Date(),
        });

        const clinNote = await newNote.save();
        //add clinical note to matching clinician database
        await Clinician.findOneAndUpdate(
            {_id: clinician.id}, 
            {$push: {clinicalNote: clinNote}},
        );    
        return clinNote.id;
            
    }catch(err) {
        console.log("error occurs in add clinical notes: ", err);

    }
};

 


const addSuppMsgAndCliNote = async(req, res) => {
    try{
        // inatlise all data available in database
        const patientId = req.params.id;
        const patient = await Patient.findById(patientId);
        const patientDoc = await Patient.findById(patientId).lean()

        const clinician = await Clinician.findOne({email:patient.clinician});
        const message = req.body.supportMsg;
        const note = req.body.note;
        const record = await Record.findOne({patientId:patientId, recordDate: new Date().toDateString()}).lean();
        // check exisiting support message and clinical notes
        if (message && note) {
            // add to database 
            const newMessageId = await addSupportMessage(message, patient, clinician);
            const newNoteId = await addClinicalNote(note, patient, clinician);

            const newMessage = await SupportMessage.findById(newMessageId).lean();
            const newNote = await ClinicalNote.findById(newNoteId).lean();
            return res.render("patient_details(clinican).hbs", {patient:patientDoc, message:newMessage, notes: newNote, record: record});

        }
        //only support message exist
        else if (message){
            // finds most recent exsiting clinical notes 
            const allNotes = await ClinicalNote.find({patientId: patientId}).sort({createdAt:-1}).lean();
            const notes = allNotes[0];
            // add to database 
            const newMessageId = await addSupportMessage(message, patient, clinician);

            const newMessage = await SupportMessage.findById(newMessageId).lean();
            if (notes) {
                return res.render("patient_details(clinican).hbs", {patient:patientDoc, message:newMessage, notes: notes,record: record});

            } else {
                return res.render("patient_details(clinican).hbs", {patient:patientDoc, message:newMessage, record: record});

            }
         
        } 
        //only clinical notes exist
        else if (note) {
            // find most recent exisiting support message 
            const allMsg = await SupportMessage.find({patientId: patientId}).sort({createdAt:-1}).lean();
            const msg = allMsg[0];
            // add to database 

            const newNoteId = await addClinicalNote(note, patient, clinician);
            const newNote = await ClinicalNote.findById(newNoteId).lean();  
            if (msg){
                return res.render("patient_details(clinican).hbs", {patient:patientDoc, message:msg, notes: newNote,record: record});

            } else{
                return res.render("patient_details(clinican).hbs", {patient:patientDoc, notes: newNote, record: record});
            }
        }        
    
    }catch(err){
        console.log("error occurs in add support message or clinical notes: ", err);


    }
};


// displaying todays' record and last updated support message and clinical note
const renderPatientDetail = async(req, res) => {
    try{
        // find all most recent data for support message and clinical note
        const patientId = req.params.id;
        const allMsg = await SupportMessage.find({patientId: patientId}).sort({createdAt:-1}).lean();
        const msg = allMsg[0];
        const allNotes = await ClinicalNote.find({patientId: patientId}).sort({createdAt:-1}).lean();
        const notes = allNotes[0];

        const patient = await Patient.findById(patientId).lean();
        //today's patient record 
        await Controller.searchAndCreateRecord(patientId);
        const record = await Record.findOne({patientId:patientId, recordDate: new Date().toDateString()}).lean();
        //render patient detail with or without support message or clincial notes 
        if (msg && notes){
            return res.render("patient_details(clinican).hbs", {patient:patient, message:msg, notes: notes, record: record});
        }
        else if (notes) {
            return res.render("patient_details(clinican).hbs", {patient:patient, notes: notes, record: record});
        } else if (msg) {
            return res.render("patient_details(clinican).hbs", {patient:patient, message: msg, record: record});
        } else{
            return res.render("patient_details(clinican).hbs", {patient:patient, record: record});
        }

    }catch(err){
        console.log("error happens in render patient detail: ", err);

    }
};


//display all health records
const renderDataHistory = async(req, res) =>{
    try{
        //assign values needed 
        const userId = req.user.id;
        // try find equivalent patient 
        const patient = await Patient.findById(userId).populate({
            path: "records",
            options: { lean: true },
          }).lean();
        //try find equiivalent clinician 
        const clinician = await Clinician.findById(userId).lean();
        //this is use if is render in clinicain view
        const reqPatient = req.params.id;
        // patient view
        if (patient) {
            const records = patient.records;
            return res.render("History_of_recording.hbs", {patient:patient, user:patient, records:records});
        //clinician view
        }else if (clinician && reqPatient){
            const targetPat = await Patient.findById(reqPatient).populate({
                path: "records",
                options: { lean: true },
            }).lean();
            const records=targetPat.records;
            return res.render("History_of_recording.hbs", {patient:targetPat, user:clinician, records:records});
        }

    }catch(err){
        console.log("error happens in render health data history: ", err);

    }
};

// filter records in time range
async function findRecordsInTimeRange(range, patientId){
    try{
        //const reqRecords = [];
        const today = new Date();
        // records in last three days (including today)
        if (range == "3 days"){
            // find the start date 
            const fromDate = new Date(today.setDate(today.getDate()-3));

            return filterInTimeRange(patientId, fromDate, false);
        // records in last week (including today)
        }else if (range == "a week") {
            const fromDate = new Date(today.setDate(today.getDate()-7));

            return filterInTimeRange(patientId, fromDate, false);
        // records in last month (including today)

        }else if (range == "a month") {
            const fromDate = new Date(today.setMonth(today.getMonth()-1));

            return filterInTimeRange(patientId, fromDate, false);
        // records in last three months (including today)

        }else if (range == "3 months") {
            const fromDate = new Date(today.setMonth(today.getMonth()-3));

            return filterInTimeRange(patientId, fromDate, false);
        // records in last six months (including today)

        }else if (range == "6 months") {
            const fromDate = new Date(today.setMonth(today.getMonth()-6));

            return filterInTimeRange(patientId, fromDate, false);
        //all records 
        }else {
            const all = await Record.find({patientId: patientId}).lean();
            return all;
        }
    }catch(err){
        console.log("error happens in finding records in time range: ", err);

    }
};

// select data in this time range 
const dataHistoryInRange = async(req, res) =>{
    try{
        // assgin data required to check 
        const userId = req.user.id;
        const patient = await Patient.findById(userId).populate({
            path: "records",
            options: { lean: true },
          }).lean();
        const clinician = await Clinician.findById(userId).lean();
        const reqPatient = req.params.id;
        const range = req.body.timeRange;
          // patient view
        if (patient) {
            if (range) {
                const reqRecords = await findRecordsInTimeRange(range, userId); 
                return res.render("History_of_recording.hbs", {patient:patient, user:patient, records:reqRecords});
            }
        //clinician view
        }else if (clinician && reqPatient){
            const targetPat = await Patient.findById(reqPatient).populate({
                path: "records",
                options: { lean: true },
            }).lean();
            if (range) {
                const reqRecords = await findRecordsInTimeRange(range, reqPatient); 

                return res.render("History_of_recording.hbs", {patient:targetPat, user:patient, records:reqRecords});
            }
        }
    }catch(err){
        console.log("error happens in render health data history: ", err);

    }
};

//display clinical note history 
const renderClinicalNoteHistory = async(req, res) =>{
    try{
        const patientId = req.params.id;
        const patient = await Patient.findById(patientId).lean();
        const notes = await ClinicalNote.find({patientId:patientId}).lean();

        res.render("clinical-note-history.hbs", {patient:patient, notes:notes});

    }catch(err){
        console.log("error happens in render clinical note history: ", err);

    }
};


// filter clinical notes in time range
async function findNotesInTimeRange(range, patientId){
    try{
        //const reqNotes = [];
        const today = new Date();
        // notes in last three days (including today)
        if (range == "3 days"){
            // find the start date 
            const fromDate = new Date(today.setDate(today.getDate()-3));
            return filterInTimeRange(patientId, fromDate, true);
        // records in last week (including today)
        }else if (range == "a week") {
            const fromDate = new Date(today.setDate(today.getDate()-7));

            return filterInTimeRange(patientId, fromDate, true);
        // records in last month (including today)

        }else if (range == "a month") {
            const fromDate = new Date(today.setMonth(today.getMonth()-1));

            return filterInTimeRange(patientId, fromDate, true);
        // records in last three months (including today)

        }else if (range == "3 months") {
            const fromDate = new Date(today.setMonth(today.getMonth()-3));

            return filterInTimeRange(patientId, fromDate, true);
        // records in last six months (including today)

        }else if (range == "6 months") {
            const fromDate = new Date(today.setMonth(today.getMonth()-6));

            return filterInTimeRange(patientId, fromDate, true);
        //all notes 
        }else {
            const all = await ClinicalNote.find({patientId: patientId}).lean();
            return all;
        }
    }catch(err){
        console.log("error happens in finding note in time range: ", err);

    }
};

// clinician selected specific time range or exact time
const noteHistoryInRange = async(req, res) =>{
    try{
        // assign values for search
        const patientId = req.params.id;
        const patient = await Patient.findById(patientId).lean();
        const notes = await ClinicalNote.find({patientId:patientId}).lean();
        const range = req.body.timeRange;
        // time range selected
        if(range) {
            const reqNotes = await findNotesInTimeRange(range, patientId);
            return res.render("clinical-note-history.hbs", {patient:patient, notes:reqNotes});
        }
       
        return res.render("clinical-note-history.hbs", {patient:patient, notes:notes});


    }catch(err){
        console.log("error happens in render clinical note history in time range: ", err);

    }
};

// helper function to create an array of required records or notes in specific time range 
async function filterInTimeRange(patientId, fromDate, noteNotRecord) {
    try{
        const array = [];
        // clinical note history is requestd 
        if (noteNotRecord==true) {
            const notes = await ClinicalNote.find({patientId: patientId}).lean();
            // iterate all possible notes and filter out records not in range
            for (let i=0; i<notes.length;i++){
                const noteDate = new Date(notes[i].noteDate);
                if (noteDate > fromDate) {
                    array.push(notes[i]);
                }
            }
            return array;
        // health data history is requested 
        }else{
            const records = await Record.find({patientId: patientId}).lean();
            // iterate all possible notes and filter out records not in range
            for (let i=0; i<records.length;i++){
                const recordDate = new Date(records[i].recordDate);
                if (recordDate > fromDate) {
                    array.push(records[i]);
                }
            }
            return array;
        }

    }catch(err) {
        console.log("error happens in filter data in time range: ", err);

    }
};

  module.exports= {
      renderCommentHistory,
      renderPatientDetail,
      addSuppMsgAndCliNote,
      renderDataHistory,
      dataHistoryInRange,
      renderClinicalNoteHistory,
      noteHistoryInRange,
    
  };