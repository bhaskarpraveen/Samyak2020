import { Schema, model,Document } from 'mongoose';
import Permission from './permissions'
interface IRole extends Document{
    name:String
}

let RoleSchema = new Schema({
    name:{type:String,required:true}
});

RoleSchema.pre('save',async function(){
    let  new_permission = new Permission({
        role_id:this._id
    });

    await new_permission.save()
});

RoleSchema.pre('remove',async function(){
    console.log('called')

})
export default model<IRole>('Role',RoleSchema);