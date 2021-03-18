import express from 'express';
import Event from '../models/events';
import EventSlot from '../models/event_slots';
import User from '../models/users';
import UserEventBatch from '../models/user_event_batch';
import VerifyToken from '../middlewares/verify_token';
import VerifyUserRole from '../middlewares/verify_user_role';
const router:express.Router = express.Router();
import dotenv from 'dotenv';
dotenv.config();

interface jwt_request extends express.Request{
    tokenData?:{userId?:String}
}

router.post('/add',VerifyToken,VerifyUserRole({collection:'Events',permission:'manage_batches'}),async function(request:jwt_request,response:express.Response){
    const {name,meet_link,eventId,date,start_time,end_time, multiple_events_allowed} = request.body;
    if(name&&meet_link&&eventId&&date&&start_time&&end_time&&( multiple_events_allowed!=null)){
        let findEvent = await Event.findOne({_id:eventId});
        if(findEvent){
            let findSlot = await EventSlot.findOne({name:name,event_id:findEvent._id});
           
            if(!findSlot){
                let new_slot = new EventSlot({
                    name:name,
                    meet_link:meet_link,
                    event_id:eventId,
                    date:date,
                    start_time:start_time,
                    multiple_events_allowed: multiple_events_allowed,
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
                return response.status(501).json({message:'Slot already exists'});
            }
           

        }else{
            return response.status(501).json({message:'Invalid event code'})
        }
    }else{
        return response.status(501).json({message:'enter all details'})
    }
})

router.post('/all-slots',VerifyToken,VerifyUserRole({collection:'Events',permission:'manage_batches'}),async function(request:jwt_request,response:express.Response){
    const {eventId} = request.body;
    if(eventId){
        let slots = await EventSlot.find({event_id:eventId});
        return response.status(200).json({slots:slots})
    }else{
        return response.status(501).json({message:'Enter event code'})
    }
});

router.post('/delete',VerifyToken,VerifyUserRole({collection:'Events',permission:'manage_batches'}),async function(request:jwt_request,response:express.Response){
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
});



router.post('/assign-batch',VerifyToken,VerifyUserRole({collection:'Events',permission:'manage_participants'}),async function(request:jwt_request,response:express.Response){
        const {eventId,batchId} = request.body;
        let {users} = request.body;
        let check=1;
        try{
            users = eval(users)
        }catch{
            check=0;
        }
            
        if(users&&check&&eventId&&batchId){
                let event = await Event.findOne({_id:eventId});
                if(event){
                    let batch = await EventSlot.findOne({_id:batchId});
                    if(batch){
                        users.forEach(async (user:any) => {
                            let findRecord = await UserEventBatch.findOne({user_id:user.user_id,event_id:eventId,batch_id:batchId});
                            if(!findRecord){
                                let new_record = new UserEventBatch({
                                    user_id:user.user_id,
                                    event_id:eventId,
                                    batch_id:batchId
                                });
                                let promise = await new_record.save();
                        }
                       
                    });
                    
                    return response.status(200).json({message:'Successfully assigned'})
                    }else{
                        return response.status(501).json({message:'batch not found'})

                    }
                }else{
                    return response.status(501).json({message:'event not found'})
                }
            }
        else{
            return response.status(501).json({message:'Enter valid details'})
        }
});

router.post('/remove-user',VerifyToken,VerifyUserRole({collection:'Events',permission:'manage_participants'}),async function(request:jwt_request,response:express.Response){
    const {userId,eventId,batchId} = request.body;
    if(userId&&eventId&&batchId){
        let user = await User.findOne({_id:userId});
        if(user){
            let event = await Event.findOne({_id:eventId});
            if(event){
                let batch = await EventSlot.findOne({_id:batchId});
                if(batch){
                    let promise =  UserEventBatch.deleteOne({user_id:userId,event_id:eventId,batch_id:batchId});
                    promise.then(()=>{
                        return response.status(200).json({message:'Successfully deleted'})
                    })
                    promise.catch(err=>{
                        return response.status(501).json({message:err.message})
                    })
                }else{
                    return response.status(501).json({mesage:'Batch not found'})
                }
            }else{
                return response.status(501).json({mesage:'Event not found'})
            }
        }else{
            return response.status(501).json({mesage:'user not found'})
        }
    }else{
        return response.status(501).json({mesage:'Enter all details'})
    }
})

router.post('/edit-slot',VerifyToken,VerifyUserRole({collection:'Events',permission:'manage_batches'}),async function(request:jwt_request,response:express.Response){
    const {_id,name,meet_link,date,start_time,end_time,multiple_events_allowed} = request.body;
    if(_id&&name&&meet_link&&date&&start_time&&end_time&&( multiple_events_allowed!=null)){
        let findSlot = await EventSlot.findOne({_id:_id});
        if(findSlot){
            let t_date = new Date(date);
            t_date.setDate(t_date.getDate()+1)
            let update = EventSlot.updateOne({_id:_id},{$set:{
                name:name,
                meet_link:meet_link,
                date:t_date,
                start_time:start_time,
                end_time:end_time,
                multiple_events_allowed:multiple_events_allowed
            }});
            update.then(doc=>{
                return response.status(200).json(doc)
            });
            update.catch(err=>{
                return response.status(501).json({message:err.message})
            })
        }else{
            return response.status(501).json({message:'slot not found'})
        }
    }else{
        return response.status(501).json({message:'Enter valid details'})
    }

})

export default router;
