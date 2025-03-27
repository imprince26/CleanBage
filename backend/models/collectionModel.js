import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema({
    userId:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    collectorId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        default : null
    },
    garbageType : {
        type : String,
        required : true,
        enum:["Plastic", "Glass", "Metal", "Paper", "Organic","mixed", "Others"]
    },
    address : {
        type : String,
        required : true
    },
    status : {
        type : String,
        required : true
    },
    date : {
        type : Date,
        required : true
    },
})