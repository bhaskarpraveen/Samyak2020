import  { Schema, Document,model } from 'mongoose';


interface IEvent extends Document{
    name:String,
    department:String,
    organiser:String,
    description:String,
    multiple_events_allowed:Boolean,
    time?:String,
    attending_link?:String,
    status:Number,
    created_at:Date
    updated_at?:Date,
    venue?:String,
    registration_price?:Number,
    type:Schema.Types.ObjectId,
    code:String
}
let EventSchema = new Schema({
    name:{type:String,required:true},
    department:{type:String,required:true},
    organiser:{type:String,required:true},
    description:{type:String,required:true},
    multiple_events_allowed:{type:Number,default:1},
    time:{type:String},
    attending_link:{type:String},
    status:{type:Number,default:1},
    created_at:{type:Date,default:Date.now},
    updated_at:{type:Date},
    venue:{type:String},
    registration_price:{type:Number},
    type:{type:Schema.Types.ObjectId,required:true},
    code:{type:String,required:true}
})

export default  model<IEvent>('Events',EventSchema)