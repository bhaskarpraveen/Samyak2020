import express from 'express';
import Event from '../models/events';
import EventType from '../models/event_types';
import VerifyUserRole from '../middlewares/verify_user_role'
import VerifyToken from '../middlewares/verify_token';
import mongoose from 'mongoose';
import fs from 'fs';
import EventSlot from '../models/event_slots';
import csvtojson from 'csvtojson';
import formatDate from '../services/date_formate';
const router:express.Router = express.Router();


router.post('/add',async function(request:express.Request,response:express.Response){
    const {name,meet_link,event,date,start_time,end_time} = request.body;
    if(name&&meet_link&&event&&date&&start_time&&end_time){
        let findSlot = await EventSlot.findOne({name:name});
        if(findSlot){
            let findEvent = await Event.findOne({code:event});
            if(findEvent){
                let new_slot = new EventSlot({
                    name:name,
                    meet_link:meet_link,
                    event:event,
                    date:date,
                    start_time:start_time,
                    end_time:end_time
                });

                let promise = new_slot.save();
                promise.then(doc=>{
                    return response.status(200).json({message:'Successfully added',doc:doc})
                });
    
                promise.catch(err=>{
                    return response.status(501).json({message:err.message})
                })
            }else{
                return response.status(501).json({message:'Invalid event code'});
            }
           

        }else{
            return response.status(501).json({message:'Slot already exists'})
        }
    }else{
        return response.status(501).json({message:'enter all details'})
    }
})

router.get('/all-slots',async function(request:express.Request,response:express.Response){
    const {eventCode} = request.body;
    if(eventCode){
        let slots = await EventSlot.find({event:eventCode});
        return response.status(200).json({slots:slots})
    }else{
        return response.status(501).json({message:'Enter event code'})
    }
});

router.post('/delete',async function(request:express.Request,response:express.Response){
    const {slotId} = request.body;
    if(slotId){
        let FindSlot = await EventSlot.findOne({_id:slotId});
        if(FindSlot){
            let promise = EventSlot.deleteOne({_id:slotId});
            promise.then(()=>{
                return response.status(200).json({message:'Successfully deleted'})
            })
            promise.catch(err=>{
                return response.status(501).json({message:err.message})
            })
        }else{
            return response.status(501).json({message:'Slot not found'})
        }
    }else{
        return response.status(501).json({message:'Enter valid slot id'})
    }
})
export default router;