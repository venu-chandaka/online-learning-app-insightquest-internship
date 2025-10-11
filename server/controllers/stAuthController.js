import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import stModel  from '../models/stModel.js';
import transporter from '../config/nodeMailer.js';

export const register = async (req, res) => {
    const {name, email, password} = req.body;
    if(!name || !email || !password){
        return res.json({success: false, message: "Please fill all the fields"});
    }
    try {
        const existingUser = await stModel.findOne({email});
        if(existingUser){
            return res.json({success: false, message: "Student already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const student = new stModel({name, email, password: hashedPassword});
        await student.save();
        const token = jwt.sign({studentId: student._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.cookie('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none': 'strict', // if we want to deploy then this value should be 'none'
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        // sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Our InsightQuestLearner Community!',
            text: `Hi ${name},\n\nThank you for registering at InsightQuestLearner! We're excited to have you on board.\n\nBest regards,\nCh.Venu The InsightQuestLearner Team`
        }
        await transporter.sendMail(mailOptions);
        return res.json({success: true});
    }catch (error) {
        console.log(error);
        return res.json({success: false, message: error.message});
    }

}
export const login = async (req, res)  => {
    const {email, password} = req.body;

    if(!email || !password){
        return res.json({success: false, message: "Please fill all the fields"});
    }
    try{
        const student = await stModel.findOne({email});
        if(!student){
            return res.json({success: false, message: "Invalid email"});
        }
        const isPasswordValid = await bcrypt.compare(password, student.password);
        if(!isPasswordValid){
            return res.json({success: false, message: "Invalid password"});
        }
        const token = jwt.sign({studentId: student._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.cookie('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none': 'strict', // if we want to deploy then this value should be 'none'
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.json({success: true});
    }catch (error) {
        console.log(error);
        return res.json({success: false, message: error.message});
    }
} 
export const logout = (req, res) => {
    try{
        res.clearCookie('token', {
             httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none': 'strict',
        });
        return res.json({success: true , message: "Logged out successfully"});
    }catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// send otp verifcation to student email
export const sendVerifyOtp = async (req, res) => {
    try{
        // Accept stId from body or from middleware (req.stId). Normalize if it's accidentally wrapped.
        let stId = req.body && req.body.stId ? req.body.stId : req.stId;
        if (!stId) {
            return res.json({ success: false, message: "Student id is required" });
        }
        // If stId was passed as an object like { stId: '...' } (client/middleware mistake), unwrap it
        if (typeof stId === 'object') {
            stId = stId.stId || stId.id || stId.toString();
        }
        const student = await stModel.findById(stId);
        if(student.isAccountVerified){
            return res.json({success: false, message: "Account already verified"});
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();   
        student.verifyOtp = otp;
        student.verifyOtpExpireAt = Date.now() + 24*60*60*1000; // 1 day from now
        await student.save();
        // send otp to student email
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: student.email,
            subject: 'Your OTP for Email Verification',
            text: `Hi ${student.name},\n\nYour OTP for email verification is ${otp}. It is valid for 24 hours.\n\nBest regards,\nCh.Venu The InsightQuestLearner Team`
        }
        await transporter.sendMail(mailOption);
        res.json({success: true, message: "OTP sent to your email"});
    }
    catch (error){
        res.json({success: false, message: error.message});
    }
}
export const verifyAccount = async (req, res) => {
        let {stId, otp} = req.body;
        // fall back to req.stId if middleware set it there
        stId = stId || req.stId;
        if(!stId || !otp){
            return res.json({success: false, message: "Please provide all the details"});
        }
        try{
            // Normalize stId if it's accidentally an object
            if (typeof stId === 'object') {
                stId = stId.stId || stId.id || stId.toString();
            }
            const student = await stModel.findById(stId);
            if(!student){
                return res.json({success: false, message: "Student not found"});    
            }
            if(student.isAccountVerified){
                return res.json({success: false, message: "Account already verified"});
            }
            // OTP must match
            if(student.verifyOtp !== otp){
                return res.json({success: false, message: "Invalid OTP"});
            }
            if(student.verifyOtpExpireAt < Date.now()){
                return res.json({success: false, message: "otp expired"});
            }
            student.isAccountVerified = true;
            student.verifyOtp ="";
            student.verifyOtpExpireAt=0;
            await student.save();
            return res.json({success: true, message: "email verified successfully"});
        }
        catch (error){
            return res.json({success: false, message: error.message});
        }
    }
// check if the st is authenticated 
export const isStAuthenticated = async (req, res) => {
    try{
        return res.json({success: true, message: "Student is authenticated"});
    }
    catch (error){
        return res.json({success: false, message: error.message});
    }
}
// send password reset otp
export const stSendResetOtp = async (req, res)=>{
    const {email}= req.body;

    if(!email){
         return res.json({success: false, message: "email is required"});
    }
    try {
        const student = await stModel.findOne({email});
        if(!student){
            return res.json({success: false, message: "Student not found"});
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();   
        student.resetOtp = otp;
        student.resetOtpExpireAt = Date.now() + 5*60*1000; // 5 minutes  from now
        await student.save();
         const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: student.email,
            subject: 'Your OTP for reset password',
            text: `Hi ${student.name},\n\nYour OTP for email verification is ${otp}. It is valid for 5 minutes.\n\nBest regards,\nCh.Venu The InsightQuestLearner Team`
        }

        await transporter.sendMail(mailOption);
        res.json({success: true, message: "OTP sent to your email"});
    }
    catch(error){
        return res.json({success: false, message: error.message});
    }
}
//reset student password
export const stResetPassword = async (req, res) => {
    const {email, otp, newPassword} = req.body;
    
    if(!email || !otp || !newPassword){
        return res.json({success: false, message: "Email , otp , and new password is required"});
    }
    try{
        const student = await stModel.findOne({email});
        if(!student){
            return res.json({success: false, message: "student is not found"});
        }
        if(student.resetOtp ==="" || student.resetOtp !== otp){
           return res.json({success: false, message: "Invalid otp"});
        }
        if(student.resetOtpExpireAt< Date.now()){
            return res.json({success: false, message: "otp expired"});
        }
        const hashedPassword = await bcrypt.hash(newPassword,10);
        student.password = hashedPassword;
        student.resetOtp = "";
        student.resetOtpExpireAt=0;
        await student.save();

        return res.json({success: true, message: "password has been reset successfully"});
    }
    catch(error){
        return res.json({success: false, message: error.message});
    }
}