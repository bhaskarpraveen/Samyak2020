import {Schema, Document,model} from 'mongoose';


interface IEventSlotSchema extends Document{
    name:String,
    meet_link :String,
    event:String,
    date:Date,
    start_time:String,
    end_time:String,
    created_at:Date
}

 let EventSlotSchema = new Schema({
    name:{type:String,required:true},
    meet_link :{type:String,required:true},
    event:{type:String,required:true},
    date:{type:Date,required:true},
    start_time:{type:String,required:true},
    end_time:{type:String,required:true},
    created_at:{type:Date,default:Date.now}
})

export default model<IEventSlotSchema>('event_slots',EventSlotSchema)