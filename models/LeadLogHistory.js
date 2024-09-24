const mongoose = require("mongoose");

const leadsLogHistorySchema = new mongoose.Schema({
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lead",
    },
    logDate: {
        type: Date,
    },
    status: {
        type: String,
    },
    borrower: {
        type: String,
    },
    leadRemark: {
        type: String,
    },
});

const LogHistory = new mongoose.model("leadloghistory", leadsLogHistorySchema);
export default LogHistory;
