import { Schema, Document,model }  from "mongoose";



interface IPermission extends Document{
    role_id:Schema.Types.ObjectId,
    permissions:Array<String>
}

let PermissionSchema = new Schema({
    role_id:{type:Schema.Types.ObjectId,required:true},
    permissions:[{type:String}]
})

export default model<IPermission>('Permissions',PermissionSchema);
