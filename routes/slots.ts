import express from 'express';
import Event from '../models/events';
import EventSlot from '../models/event_slots';
import User from '../models/users';
import UserEventBatch from '../models/user_event_batch';
import VerifyToken from '../middlewares/verify_token';
import VerifyUserRole from '../middlewares/verify_user_role';
const router:express.Router = express.Router();


router.post('/add',VerifyToken,VerifyUserRole({collection:'Events',permission:'manage_batches'}),async function(request:express.Request,response:express.Response){
    const {name,meet_link,eventId,date,start_time,end_time} = request.body;
    if(name&&meet_link&&eventId&&date&&start_time&&end_time){
        let findSlot = await EventSlot.findOne({name:name});
        if(!findSlot){
            let findEvent = await Event.findOne({_id:eventId});
            if(findEvent){
                let new_slot = new EventSlot({
                    name:name,
                    meet_link:meet_link,
                    event_id:eventId,
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

router.post('/all-slots',VerifyUserRole({collection:'Events',permission:'manage_batches'}),async function(request:express.Request,response:express.Response){
    const {eventId} = request.body;
    console.log('called')
    if(eventId){
        let slots = await EventSlot.find({event_id:eventId});
        return response.status(200).json({slots:slots})
    }else{
        return response.status(501).json({message:'Enter event code'})
    }
});

router.post('/delete',VerifyUserRole({collection:'Events',permission:'manage_batches'}),async function(request:express.Request,response:express.Response){
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



router.post('/assign-batch',VerifyUserRole({collection:'Events',permission:'manage_participants'}),async function(request:express.Request,response:express.Response){
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
                            let findRecord = await UserEventBatch.findOne({user_id:user._id,event_id:eventId,batch_id:batchId});
                            if(!findRecord){
                                let new_record = new UserEventBatch({
                                    user_id:user._id,
                                    event_id:eventId,
                                    batch_id:batchId
                                });
                                let promise = await new_record.save();
                        }
                        return response.status(200).json({message:'Successfully assigned'})
                    });
                       
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

router.post('/remove-user',VerifyUserRole({collection:'Events',permission:'manage_participants'}),async function(request:express.Request,response:express.Response){
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


export default router;
