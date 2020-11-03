import mongoose, { Schema, Document,model } from 'mongoose';

interface IPaymentRequestSchema extends Document{
    user_id:mongoose.Schema.Types.ObjectId,
        id:String
        amount: Number,
        purpose: String,
        status: String,
        send_sms:Boolean,
        send_email: Boolean,
        sms_status: String,
        email_status: String,
        shorturl?: String,
        longurl: String,
        redirect_url: String,
        created_at?:Date,
        modified_at?: Date,
        allow_repeated_payments: Boolean
}

let PaymentRequestSchema = new Schema({
    id:{type:String,required:true},
        user_id:{type:mongoose.Schema.Types.ObjectId,required:true},
        amount: {type:Number,required:true},
        purpose: {type:String,required:true},
        status: {type:String,required:true},
        send_sms:{type:Boolean,default:true},
        send_email: {type:Boolean,default:true},
        sms_status: {type:String,required:true},
        email_status: {type:String,required:true},
        shorturl: {type:String},
        longurl: {type:String,required:true},
        redirect_url: {type:String,required:true},
        created_at:{type:Date},
        modified_at: {type:Date},
        allow_repeated_payments: {type:Boolean,default:false},
})

export default model<IPaymentRequestSchema>('payment_requests',PaymentRequestSchema)