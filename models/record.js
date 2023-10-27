const mongoose = require('mongoose');

// Store datatype to schema
const recordSchema = new mongoose.Schema({ 


    patientId: {type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true},
    recordDate: {type: String, required: true},
    data:{
        bgl:{	
            fullName:{type:String,default: "blood glocose level", immutable: true},	
            status:{type:String,enum: ["recorded", "unrecorded", "unrequired"], default: "unrecorded"},
            value:{type: Number, default: -1},	
            comment:{type:String,default:""},
            createdAt:{type:String,default:null},
            valueMin: {type:Number, default: 100},
            valueMax: {type:Number, default: 140},
            
        },
        weight:{	
            fullName:{type:String,default: "weight", immutable: true},	
            status:{type:String,enum: ["recorded", "unrecorded", "unrequired"], default: "unrecorded"},
            value:{type: Number, default: -1},	
            comment:{type:String,default:""},
            createdAt:{type:String,default:null},
            valueMin: {type:Number, default: 60},
            valueMax: {type:Number, default: 75},
        },
        doit:{	
            fullName:{type:String,default: "doses of insulin taken", immutable: true},	
            status:{type:String,enum: ["recorded", "unrecorded", "unrequired"], default: "unrecorded"},
            value:{type: Number, default: -1},	
            comment:{type:String,default:""},
            createdAt:{type:String,default:null},
            valueMin: {type:Number, default: 1},
            valueMax: {type:Number, default: 2},
        },
        exercise:{	
            fullName:{type:String,default: "exercise", immutable: true},	
            status:{type:String,enum: ["recorded", "unrecorded", "unrequired"], default: "unrecorded"},
            value:{type: Number, default: -1},	
            comment:{type:String,default:""},
            createdAt:{type:String,default:null},
            valueMin: {type:Number, default: 2000},
            valueMax: {type:Number, default: 20000},
        },
    }
}); 
const Record = mongoose.model('Record', recordSchema); 
module.exports = Record;


