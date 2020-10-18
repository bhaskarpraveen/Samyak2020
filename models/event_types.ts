import {Schema, Document,model} from 'mongoose';


interface IEventType extends Document{
    name:String
}

let EventTypeSchema = new Schema({
    name:{type:String,required:true}
});


export default model<IEventType>('EventTypes',EventTypeSchema)