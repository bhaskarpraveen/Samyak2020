import mongoose, { model,Document,Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import generateSamyakId from '../services/samyak_id_generation';

//schema fields and methods
interface IUser extends Document{
    samyak_id: number,
    name:string,
    password:string,
    email:string,
    mobile:string,
    college: string,
    current_year:  string,
    branch:  string,
    gender:  string,
    college_id:  string,
    status: Number,
    email_verified:  Number,
    role:   string,
    created_at: Date ,
    updated_at?: Date 
    isValid(password:String):Boolean,
    isVerified():Number,
    verifyStatus():Number
}

//schema statics
interface IUserModel extends Model<IUser>{
    hashPassword(password:String):String, 
}

let userSchema =   new mongoose.Schema({
    name: { type: String, required: true },
    password:{type:String,required:true},
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    college: { type: String, required: true },
    current_year: { type: String, required: true },
    branch: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    college_id: { type: String, required: true },
    status: { type: Number, default: 1 },
    email_verified: { type: Number, default: 0 },
    role: { type: String, enum: ['Admin', 'Organiser', 'Student'], default: 'Student' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date },
    samyak_id:{type:String}
});

//returns hashed password
userSchema.statics.hashPassword=function hashPassword(password: string){
    return bcrypt.hashSync(password,12)
}
//validates the password
userSchema.methods.isValid=function isValid(password: string){
   return bcrypt.compareSync(password,this.password)
}

//return if the email is verified
userSchema.methods.isVerified=function isVerified(){
    return this.email_verified
}
//returns if the user is active/blocked
userSchema.methods.verifyStatus=function verifyStatus(){
    return this.status
}

//creates a unique samyak id 
userSchema.pre('save',async  function(done){
    let id_string=await generateSamyakId();
    this.set('samyak_id',id_string);
    
    done();
}) 
export default model<IUser,IUserModel>('User',userSchema);