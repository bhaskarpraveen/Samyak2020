import mongoose, { Schema, Document,model } from 'mongoose';

interface IPaymentSchema extends Document{
    amount:Number,
    user_id:mongoose.Schema.Types.ObjectId,
    currency:String,
    fees:Number,	
    longurl:String	, 
    mac	:String,
    payment_id:String,
    payment_request_id:String,	
    purpose:String,	
    shorturl:String,	
    status:String,
    created_at:Date,
    updated_at:Date
}

let PaymentSchema = new Schema({
    amount:Number,
    user_id:mongoose.Schema.Types.ObjectId,
    currency:String,
    fees:Number,	
    longurl:String	, 
    mac	:String,
    payment_id:String,
    payment_request_id:String,	
    purpose:String,	
    shorturl:String,	
    status:String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date },
})

export default model<IPaymentSchema>('paymant_requests',PaymentSchema)