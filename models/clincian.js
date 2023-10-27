const mongoose = require('mongoose');


// Store datatype to schema
const clinicanSchema = new mongoose.Schema({ 

    
    firstName:{type: String,required: true, lowercase: true, trim: true}, 
    lastName:{type:String,required: true, lowercase: true, trim: true},
    email:{type: String, required: true, unique: true},
    password:{type:String, required:true},	
    yearOfBirth:{type: Number, required: true, min: 1900, max: 2022},
    patient: [{type:mongoose.Schema.Types.ObjectId, ref: "Patient"}], 
    clinicalNote:[{type:mongoose.Schema.Types.ObjectId, ref: "ClinicalNote"}],
    suportMessage: [{type:mongoose.Schema.Types.ObjectId, ref:"SupportMessage"}],
    role: {type: String, default: "clinician" },

},
    {timestamps:{createdAt: "createTime",updatedAt:"updateTime"}
});
const Clinician = mongoose.model('Clinician', clinicanSchema); 
module.exports = Clinician; 


