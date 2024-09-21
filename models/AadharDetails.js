import mongoose, { mongo } from "mongoose";

const aadharSchema = new mongoose.Schema({
        leadId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Lead"
        } , 
        data : {
            type : Object,
            require : true
        }
},{timestamps :  true});

const AadharDetails = mongoose.model("Aadhar",aadharSchema);
export default AadharDetails;