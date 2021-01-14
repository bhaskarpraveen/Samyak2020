import mongoose, { Schema, Document,model } from 'mongoose';

interface IPaymentSchema extends Document{
   
    user_id:mongoose.Schema.Types.ObjectId,
    payment_id:String,
    payment_request_id:String,		
    status:String,
    created_at:Date,
    updated_at:Date,
    amount:Number
}

let PaymentSchema = new Schema({

    user_id:{type:mongoose.Schema.Types.ObjectId,required:true}, 
    payment_id:{type:String,required:true},
    payment_request_id:{type:String,required:true},	
    status:{type:String,required:true},
    instrument_type: {type:String,required:true},
    amount:{type:String,required:true},
    billing_instrument: {type:String,required:true},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date },
})

export default model<IPaymentSchema>('payments',PaymentSchema)