import mongoose, { Schema, Document,model } from 'mongoose';

interface IPaymentSchema extends Document{
   
    user_id:mongoose.Schema.Types.ObjectId,
    payment_id:String,
    payment_request_id:String,		
    status:String,
    created_at:Date,
    updated_at:Date
}

let PaymentSchema = new Schema({

    user_id:mongoose.Schema.Types.ObjectId, 
    payment_id:String,
    payment_request_id:String,	
    status:String,
    instrument_type: String,
    billing_instrument: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date },
})

export default model<IPaymentSchema>('paymant_requests',PaymentSchema)