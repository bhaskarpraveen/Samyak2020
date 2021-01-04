import { Schema, Document, model } from 'mongoose';

interface IUserEventBatchSchema extends Document{
    user_id:String ,
    event_id:String ,
    batch_id:String,
    created_at:Date,
    updated_at?:Date
}

let UserEventBatchSchema = new Schema({
    user_id:{type:Schema.Types.ObjectId,required:true},
    event_id:{type:Schema.Types.ObjectId,required:true},
    batch_id:{type:Schema.Types.ObjectId,required:true},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date },
});

export default model<IUserEventBatchSchema>('userEventBatch',UserEventBatchSchema);