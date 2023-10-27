const mongoose = require('mongoose');

// Store datatype to schema
const noteSchema = new mongoose.Schema({ 
    patientId: {type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true},
    clinicianId: {type: mongoose.Schema.Types.ObjectId, ref: "Clinician", required: true},
    createdAt: {type: Date, required: true},
    noteDate: {type: String, required: true},
    note:{type: String},
}); 
const ClinicalNote = mongoose.model('ClinicalNote', noteSchema); 
module.exports = ClinicalNote;


