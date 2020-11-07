import express from 'express';
import Event from '../models/events';
import User from '../models/users';
import UserEventRegistration from '../models/user_event_registrations';
import EventType from '../models/event_types';
import VerifyUserRole from '../middlewares/verify_user_role'
import VerifyToken from '../middlewares/verify_token';
import mongoose from 'mongoose';
import fs from 'fs';
import EventSlot from '../models/event_slots';
import UserEventBatch from '../models/user_event_batch';
import csvtojson from 'csvtojson';
import formatDate from '../services/date_formate';
import Payment from '../models/payments';
const router:express.Router = express.Router();


//interface 
interface jwt_request extends express.Request{
    tokenData?:{userId?:String}
}
router.post('/event-register',VerifyToken,async function(request:jwt_request,response:express.Response){
    if(request.tokenData){
        const {userId} = request.tokenData;
        const {eventId} = request.body;
        
        if(userId&&eventId){
            let event = await Event.findOne({_id:eventId});
            if(event){
                let user = await User.findOne({_id:userId});
                if(user){
                    let payment = await Payment.findOne({user_id:user._id,status:'Credit'})
                    if(payment){
                        let FindRegistration = await UserEventRegistration.findOne({user_id:userId,event_id:eventId});
                    if(!FindRegistration){
                        let new_registration = new UserEventRegistration({
                            user_id:userId,
                            event_id:eventId
                        });
                        let promise = new_registration.save();
                        promise.then(doc=>{
                            return response.status(200).json({message:'succesfully added',doc:doc})
                        })
                        promise.catch(err=>{
                            return response.status(501).json({message:err.message})
                        })
                    }else{
                        return response.status(501).json({message:'User already registered'})
                    }
                    }else{
                        return response.status(501).json({message:'user has not payed yet'})
                    }
    
                }else{
                    return response.status(501).json({message:'User not found'})
                }
            }else{
                return response.status(501).json({message:'Event not found'})
            }
        }else{
            return response.status(501).json({message:'Enter all details'})
        }
    }else{
        return response.status(501).json({message:'Token not found'})
    }

});

router.get('/event-registrations',async function(request:express.Request,response:express.Response){
    const {eventId} = request.query;
    if(eventId){
        let registrations = await UserEventRegistration.aggregate([
            {
                $lookup:{
                    from: 'users',
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user"        
                }
            },
            // {
            //     $lookup:{
            //         from: 'event_slots',
            //         localField: "user_id",
            //         foreignField: "user_id",
            //         as: "slot"        
            //     }
            // },
            {
        
            $project:{
                'user.password':0,
                'user.created_at':0,
                'user.updated_at':0,
                '__v':0,
                'user.__v':0,
            }
            }
        
        ]);
        let record = registrations.filter(reg=>reg.event_id==eventId);
       
       for(let i=0;i<record.length;i++){
        record[i].user[0].slot=[];
           let slot = await UserEventBatch.find({user_id:record[i].user_id,event_id:record[i].event_id});
           for(let j=0;j<slot.length;j++){
            let batch = await EventSlot.findOne({_id:slot[j].batch_id});
            record[i].user[0].slot.push({name:batch?.name,id:batch?._id})
           }
           
       }
    
        return response.status(200).json({registrations:record});
    }else{
        return response.status(501).json({message:'Enter event id'});
    }
})

router.get('/user-events',VerifyToken,async function(request:jwt_request,response:express.Response){
    if(request.tokenData){
        const {userId} = request.tokenData;
        if(userId){
            const user = await User.findOne({_id:userId});
            if(user){
                let events = await UserEventRegistration.find({user_id:user._id})
                let event_obj=[]
                for(let i=0;i<events.length;i++){
                    let temp_event = await Event.findOne({_id:events[i].event_id})
                    event_obj.push(temp_event);
                }

                return response.status(200).json(event_obj);
            }else{
                return response.status(501).json({message:'User not found'})
            }
        }else{
            return response.status(501).json({message:'Enter valid user id'})
        }
    }else{
        return response.status(501).json({message:'Token not found'})
    }
})
export default router;