import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import UsersRouter from './routes/users';
import AdminRouter from './routes/administration';

const app:express.Application = express();
dotenv.config();
const PORT = process.env.PORT || 5000;

//Database configurations
const DATABSE_URL = process.env.DATABSE_URL || 'mongodb://127.0.0.1:27017';
mongoose.connect(DATABSE_URL,{useNewUrlParser:true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open',()=>{
    console.log('Connected to mongodb')
})


// Express middlewares
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())

// Routes
app.use('/users',UsersRouter);
app.use('/administration',AdminRouter);

app.listen(PORT,()=>{
    console.log(`Running on port ${PORT}`);
})

export default app;