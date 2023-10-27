const mongoose = require('mongoose');

// Store datatype to schema
const messageSchema = new mongoose.Schema({ 
    patientId: {type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true},
    clinicianId: {type: mongoose.Schema.Types.ObjectId, ref: "Clinician", required: true},
    createdAt: {type: Date, required: true},
    message:{type: String},
}); 

const SupportMessage = mongoose.model('SupportMessage', messageSchema); 
module.exports = SupportMessage;