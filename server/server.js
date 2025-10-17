import express from 'express';
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from './config/mongodb.js';
import stAuthRouter from './routes/stAuthRoutes.js';
import stRouter from './routes/stRoutes.js';
import mentorRouter from './routes/mentorRoutes.js';
import mentorAuthRouter from './routes/mentorAuthRoutes.js';
import courseRouter from "./routes/courseRoutes.js";
import lessonRouter from "./routes/lessonRoutes.js";
const app = express();
const port = process.env.PORT || 4000;
connectDB();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173", // frontend url
    credentials: true,
}));
//Api endpoints
app.get('/', (req, res) => res.send('API WORKING'));
app.use('/api/stauth', stAuthRouter);//student authRouter
app.use('/api/mentor', mentorRouter);
app.use('/api/mentorauth', mentorAuthRouter);
app.use('/api/student', stRouter);
app.use("/api/course", courseRouter);
app.use("/api/lesson", lessonRouter);
app.listen(port, () => {
    console.log(`Server is started on port: ${port}`);
});