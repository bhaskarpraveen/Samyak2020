import {Schema,Document,model} from 'mongoose';


interface ITechTalkSchema extends Document{
    title:String,
    speaker:String,
    speaker_designation:String,
    description:String,
    time:String,
    image?:String,
    organiser:String,
    code:String
}


let TechTalkSchema = new Schema({
    title:{type:String,required:true},
    speaker:{type:String,required:true},
    speaker_designation:{type:String,required:true},
    description:{type:String,required:true},
    time:{type:String,required:true},
    organiser:{type:String,required:true},
    image:{type:String},
    code:{type:String,required:true}
})

export default model<ITechTalkSchema>('tech_talks',TechTalkSchema);