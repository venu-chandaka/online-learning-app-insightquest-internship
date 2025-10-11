import express from 'express';
import stAuth from '../middleware/stAuth.js';
import { getStudentData } from '../controllers/stcontroller.js';


const stRouter = express.Router();

stRouter.get('/stData', stAuth, getStudentData);

export default stRouter;