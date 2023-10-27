const mongoose = require('mongoose');

// Store datatype to schema
const patientSchema = new mongoose.Schema({ 

    firstName:{type: String,required: true, lowercase: true, trim: true}, 
    lastName:{type:String,required: true, lowercase: true, trim: true},
    email:{type: String, required: true, unique: true},
    screenName:{type:String,required: true, unique: true},
    password:{type:String, required:true},	
    yearOfBirth:{type: Number, required: true, min: 1900, max: 2022},
    textBio:{type: String, required: true},
    supportMessage:{type:String},
    
    records:[{type:mongoose.Schema.Types.ObjectId, ref: "Record", required: true}],
    eRate:{type:Number,min:0,max:1},
    clinician: {type:String, required: true},
    role: { type: String, default: "patient" },
    requireData: {
        bgl: { type: Boolean, required: true, default: true},
        doit: { type: Boolean, required: true, default: true},
        exercise: { type: Boolean, required: true, default: true},  
        weight: { type: Boolean, required: true, default: true},
    },
},
    {timestamps:{createdAt: "createTime",updatedAt:"updateTime"}
});
const Patient = mongoose.model('Patient', patientSchema); 
module.exports = Patient; 


