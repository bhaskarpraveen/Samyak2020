import { Schema, Document,model } from "mongoose";

interface IDepartmentSchema extends Document{
    name:String
}
let DepartmentSchema =  new Schema({
    name:{type:String,required:true}
})

export default model<IDepartmentSchema>('Departments',DepartmentSchema);