import express from 'express';
import Event from '../models/events';
import EventType from '../models/event_types';
import VerifyUserRole from '../middlewares/verify_user_role'
import VerifyToken from '../middlewares/verify_token';
import mongoose from 'mongoose';
import fs from 'fs';
import csvtojson from 'csvtojson';
import formatDate from '../services/date_formate';
const router:express.Router = express.Router();




//Add an event type
router.post('/add-eventType',async function(request:express.Request,response:express.Response){
    const {name} = request.body;
    if(name){
        let FindName = await EventType.findOne({name:name});
        if(!FindName){
            let newEventType = new EventType({
                name:name
            });
            let promise = newEventType.save();

            promise.then(doc=>{
                return response.status(200).json({message:'Successfully added',doc:doc})
            });

            promise.catch(err=>{
                return response.status(501).json({message:err.message})
            })

        }else{
            return response.status(501).json({message:'Event type already exists'})
        }
    }else{
        return response.status(501).json({message:'Enter valid name'})
    }
});

//get all event types
router.get('/all-eventTypes',async function(request:express.Request,response:express.Response){
    let eventTypes = await EventType.find({});
    return response.status(200).json(eventTypes)
})

//delete an event type
router.post('delete-eventType',async function(request:express.Request,response:express.Response){
    const {typeId} = request.body;
    if(typeId){
        let FindEvent = await EventType.findOne({_id:typeId});
        if(FindEvent){
            let promise = Event.deleteOne({_id:typeId});
            promise.then(()=>{
                return response.status(200).json({message:'Successfully deleted'})
            })
            promise.catch(err=>{
                return response.status(501).json({message:err.message})
            })
        }else{
            return response.status(501).json({message:'Event not found'})
        }
    }else{
        return response.status(501).json({message:'Enter valid Details'})
    }
});

//edit an event
router.post('/edit-event',async function(request:express.Request,response:express.Response){
    const {typeId,name} = request.body;
    if(typeId&&name){
        let FindEvent = await EventType.findOne({_id:typeId});
        if(FindEvent){
            let promise = Event.updateOne({_id:typeId},{$set:{name:name}});
            promise.then((doc)=>{
                return response.status(200).json({message:'Successfully deleted',doc:doc})
            })
            promise.catch(err=>{
                return response.status(501).json({message:err.message})
            })
        }else{
            return response.status(501).json({message:'Event not found'})
        }
    }else{
        return response.status(501).json({message:'Enter valid Details'})
    }
});

//Add an event
router.post('/add-event',VerifyToken,VerifyUserRole({collection:"Events",permission:"add"}),async function(request:express.Request,response:express.Response){
    const { name,
    department,
    organiser,
    description,
    multiple_events_allowed,
    venue,
    registration_price,
    type,
    code,
    } = request.body;

    if(name&&department&&description&&multiple_events_allowed&&type&&code){
        let FindEvent = await Event.findOne({$or:[{name:name},{code:code}]});
        if(!FindEvent){
            if(mongoose.Types.ObjectId.isValid(type)){
                let FindEventType = await EventType.findOne({_id:type});
            if(FindEventType){
               
            
                let event = new Event({
                    name:name,
                    department:department,
                    organiser:organiser,
                    description:description,
                    multiple_events_allowed:multiple_events_allowed,
                    venue:venue,
                    registration_price:registration_price,
                    type:type,
                    code:code
                })

                let promise = event.save();
                promise.then(doc=>{
                    
                    return response.status(200).json({message:'Successfully added',doc:doc})
                });
    
                promise.catch(err=>{
                    return response.status(501).json({message:err.message})
                })
            }else{
                return response.status(501).json({message:'Invalid Event type'})
            }
            
            }else{
                return response.status(501).json({message:'Invalid Event type'})
            }
            
        }else{
            return response.status(501).json({message:'An event with similar Name/Code already exists'})
        }
    }else{
        return response.status(501).json({message:'Enter all details'})
    }

})
//get all events
router.get('/all-events',async function(request:express.Request,response:express.Response){
    let events = await Event.aggregate([
        {
            $lookup:{
                from: 'eventtypes',
                localField: "type",
                foreignField: "_id",
                as: "type"        
            }
        },
        {
    
        $project:{
            '__v':0,
            'type.__v':0,
            
        }
        }
    ])
    return response.status(200).json(events)
})

//delete an event
router.post('/delete-event',VerifyToken,VerifyUserRole({collection:'Events',permission:'delete'}),async function(request:express.Request,response:express.Response){
    const {eventId} = request.body;
    if(eventId){
        let FindEvent = await Event.findOne({_id:eventId});
        if(FindEvent){
            let promise = Event.deleteOne({_id:eventId});
            promise.then(()=>{
                return response.status(200).json({message:'Successfully deleted'})
            })
            promise.catch(err=>{
                return response.status(501).json({message:err.message})
            })
        }else{
            return response.status(501).json({message:'Event not found'})
        }
    }else{
        return response.status(501).json({message:'Enter valid Details'})
    }
})

//Edit an event
router.post('/edit-event',VerifyToken,VerifyUserRole({collection:'Events',permission:'edit'}),async function(request:express.Request,response:express.Response){
    const { 
        eventId,
        name,
        department,
        organiser,
        description,
        multiple_events_allowed,
        venue,
        registration_price,
        type,
        code,
        } = request.body;

        if(eventId&&name&&department&&description&&multiple_events_allowed&&type&&code){
            let FindEvent = await Event.findOne({_id:eventId});
            if(FindEvent){
                let FindEventType = await EventType.findOne({_id:type});
                if(FindEventType){
                let promise = Event.updateOne({_id:eventId},{$set:{
                    name:name,
                    department:department,
                    organiser:organiser,
                    description:description,
                    multiple_events_allowed:multiple_events_allowed,
                    venue:venue,
                    registration_price:registration_price,
                    type:type,
                    code:code
                }}) ;
                promise.then(doc=>{
                    return response.status(200).json({message:'Successfully updated',response:doc})
                })
                promise.catch(err=>{
                    return response.status(501).json({message:err.message})
                })
            }else{
                return response.status(501).json({message:'Invalid Event type'})
            }
            }else{
                return response.status(501).json({message:'Event not found'})
            }
        }else{
        return response.status(501).json({message:'Enter valid Details'})
    }


})

router.post('/add-csvEvents',async function(request:express.Request,response:express.Response){
    if(request.files){
        const {newfile} = request.files;

        fs.writeFileSync(__dirname+'/events.csv',newfile.data);
        let data = await csvtojson().fromFile(__dirname+'/events.csv')
        data.forEach(async event=>{
            let findEvent = await Event.findOne({code:event.code});
            if(!findEvent){
                let findType = await EventType.findOne({name:event.type})
                if(findType){
                    let newevent = new Event({
                        name:event.name,
                        department:event.department,
                        organiser:event.organiser,
                        description:event.description,
                        multiple_events_allowed:event.multiple_events_allowed,
                        venue:event.venue,
                        registration_price:event.registration_price,
                        type:findType._id,
                        code:event.code
                    })

                await newevent.save();
                }      
            }
            })
            fs.unlinkSync(__dirname+'/events.csv');
            return response.status(200).json({message:'successfull'})
 
    }else{
        return response.status(501).json({message:'Not added'})
    }
  
})

router.post('/edit-csvEvents',async function(request:express.Request,response:express.Response){
    if(request.files){
        const {newfile} = request.files;

        fs.writeFileSync(__dirname+'/events.csv',newfile.data);
        let data = await csvtojson().fromFile(__dirname+'/events.csv')
        response.send(data)
        data.forEach(async event=>{
           let newevent =  await Event.updateOne({code:event.code},{$set:{
                name:event.name,
                    department:event.department,
                    organiser:event.organiser,
                    description:event.description,
                    multiple_events_allowed:event.multiple_events_allowed,
                    venue:event.venue,
                    registration_price:event.registration_price,
                    type:event.type,
                    code:event.code
            }},{ upsert: false })
        })
        fs.unlinkSync(__dirname+'/events.csv');
        return response.status(200).json({message:'successfull'})
    }
  
})
export default router;