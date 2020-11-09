import {Schema, Document,model} from 'mongoose';


interface IEventSlotSchema extends Document{
    name:String,
    meet_link :String,
    event_id:String,
    date:Date,
    start_time:String,
    multiple_events_allowed:Number
    end_time:String,
    created_at:Date
}

 let EventSlotSchema = new Schema({
    name:{type:String,required:true},
    meet_link :{type:String,required:true},
    event_id:{type:String,required:true},
    date:{type:Date,required:true},
    multiple_events_allowed:{type:Number,default:1},
    start_time:{type:String,required:true},
    end_time:{type:String,required:true},
    created_at:{type:Date,default:Date.now}
})

export default model<IEventSlotSchema>('event_slots',EventSlotSchema)