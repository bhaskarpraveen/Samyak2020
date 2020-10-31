import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import UsersRouter from './routes/users';
import AdminRouter from './routes/administration';
import RoleRouter from './routes/roles';
import EventRouter from './routes/events'
import fileUpload from 'express-fileupload';
import SlotRouter from './routes/slots';
import RegisterRouter from './routes/event_registrations';
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

const corsOpts = {
    origin: '*',
  
    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE'
    ],
  
    allowedHeaders: [
      '*'
    ],
  };
// Express middlewares
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors(corsOpts))
app.use(fileUpload({
    limits:{filesize:50*1024*1024}
}))

// Routes
app.use('/users',UsersRouter);
app.use('/administration',AdminRouter);
app.use('/roles',RoleRouter);
app.use('/events',EventRouter);
app.use('/slots',SlotRouter);
app.use('/register',RegisterRouter);

app.listen(PORT,()=>{
    console.log(`Running on port ${PORT}`);
})

export default app;