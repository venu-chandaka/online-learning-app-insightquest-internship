import express from 'express';
import { login, register, logout, sendVerifyOtp, verifyAccount, isStAuthenticated, stSendResetOtp, stResetPassword} from '../controllers/stAuthController.js';
import stAuth from '../middleware/stAuth.js';

const stAuthRouter = express.Router();

stAuthRouter.post('/stregister', register);
stAuthRouter.post('/stlogin', login);
stAuthRouter.post('/stlogout', logout);
stAuthRouter.post('/st-send-verify-otp', stAuth , sendVerifyOtp);
stAuthRouter.post('/st-verify-account', stAuth , verifyAccount);
stAuthRouter.post('/is-st-auth', stAuth , isStAuthenticated);
stAuthRouter.post('/st-send-reset-otp', stSendResetOtp);
stAuthRouter.post('/st-reset-password', stResetPassword);

export default stAuthRouter;