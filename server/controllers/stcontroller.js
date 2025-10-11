import stModel from "../models/stModel.js";

export const getStudentData = async (req, res) => {
    try {
        const {stId} = req.body;

        const student = await stModel.findById(stId);
        if(!student){
            return res.json({success: false, message: "Student not found"});
        }
        res.json({success: true,
                 stData :{
                    name: student.name,
                    email: student.email,
                    college: student.college,
                    isAccountVerified: student.isAccountVerified,
                    createdAt: student.createdAt
                 }
        });
    }
    catch (error) {
        return res.json({success: false, message: error.message});
    }
}
