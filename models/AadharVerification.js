import mongoose from 'mongoose';

const aadharVerificationSchema = new mongoose.Schema({
    requestID: {
        type: String,
        required: true, // Fixed spelling: 'required' instead of 'require'
    }
}, { timestamps: true });

const AadharVerification = mongoose.model("AadharVerification", aadharVerificationSchema);

export default AadharVerification;
