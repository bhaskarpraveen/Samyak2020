import mongoose, { Schema, Document, model } from 'mongoose';

interface IUserEventRegistrationSchema extends Document{
    user_id:String,
    event_id:String,
    created_at:Date,
    updated_at?:Date
}

let UserEventRegistrationSchema = new Schema({
    user_id:{type:Schema.Types.ObjectId,required:true},
    event_id:{type:Schema.Types.ObjectId,required:true},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date },
});

export default model<IUserEventRegistrationSchema>('userEventRegistrations',UserEventRegistrationSchema);