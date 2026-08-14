const {askDatabase} = require("../ai/sqlAgent");

const askDatabaseController = async(req,res)=>{
    try{
        const {question} = req.body;
        if(!question){
            return res.status(400).json({
                success:false,
                message:"Question is required"
            });
        }
        const answer = await askDatabase(question);
        return res.status(200).json({
            success:true,
            message:"Question answered successfully",
            data:{answer}
        });
    }catch(error){
        console.error("Error in askDatabaseController:", error);
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
};
module.exports = {
    askDatabaseController
};