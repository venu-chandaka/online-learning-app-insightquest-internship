import express from 'express';
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from './config/mongodb.js';
import stAuthRouter from './routes/stAuthRoutes.js';
import stRouter from './routes/stRoutes.js';
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
app.use('/api/auth', stAuthRouter);//student authRouter
app.use('/api/student', stRouter);
app.listen(port, () => {
    console.log(`Server is started on port: ${port}`);
});