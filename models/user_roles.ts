import { Schema, Document , model } from 'mongoose';


interface IUserRoleSchema extends Document{
    role_id:Schema.Types.ObjectId,
    user_id:Schema.Types.ObjectId
}
let UserRoleSchema = new Schema({
    user_id :{type:Schema.Types.ObjectId,required:true},
    role_id:{type:Schema.Types.ObjectId,required:true}
});

export default model<IUserRoleSchema>('UserRole',UserRoleSchema);