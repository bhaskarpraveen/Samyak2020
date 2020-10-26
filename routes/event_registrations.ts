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
import csvtojson from 'csvtojson';
import formatDate from '../services/date_formate';
const router:express.Router = express.Router();

router.post('/event-register',async function(request:express.Request,response:express.Response){
        const {userId,eventId} = request.body;
        
        if(userId&&eventId){
            let event = await Event.findOne({_id:eventId});
            if(event){
                let user = await User.findOne({_id:userId});
                if(user){
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
                    return response.status(501).json({message:'User not found'})
                }
            }else{
                return response.status(501).json({message:'Event not found'})
            }
        }else{
            return response.status(501).json({message:'Enter all details'})
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
        return response.status(200).json({registrations:record});
    }else{
        return response.status(501).json({message:'Enter event id'});
    }
})

export default router;