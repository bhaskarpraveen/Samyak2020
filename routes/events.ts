import express from 'express';
import Event from '../models/events';
import EventType from '../models/event_types';
import VerifyUserRole from '../middlewares/verify_user_role'
import VerifyToken from '../middlewares/verify_token';
import mongoose from 'mongoose';
import User from '../models/users';
import UserRole from '../models/user_roles';
import Role from '../models/roles';
import fs from 'fs';
import csvtojson from 'csvtojson';
import Department from '../models/departments';
import EventSlot from '../models/event_slots';
const router:express.Router = express.Router();


//interface 
interface jwt_request extends express.Request{
    tokenData?:{userId?:String}
}

//Add an event type
router.post('/add-eventType',VerifyToken,VerifyUserRole({collection:'Events',permission:'add'}),async function(request:express.Request,response:express.Response){
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
router.get('/all-eventTypes',VerifyToken,VerifyUserRole({collection:'Events',permission:'view'}),async function(request:express.Request,response:express.Response){
    let eventTypes = await EventType.find({})
    return response.status(200).json(eventTypes)
})

//Formatted event types and departments for home page
router.get('/event-types',async function(request:express.Request,response:express.Response){
    let eventTypes = await EventType.find({})
    let records:Object[]=[]
    for(let i=0;i<eventTypes.length;i++){
        if(eventTypes[i].name=='Technical'){
            let department = await Event.find({type:eventTypes[i]._id}).distinct('department')
            department.map(async dep=>{
                let temp=await Department.findOne({_id:dep.department})
                dep =temp?.name
            })
        records.push({type:eventTypes[i].name,departments:department})
        }else{
            records.push({type:eventTypes[i].name})
        }
        
    }
   
    return response.status(200).json({events:records})
})
//delete an event type
router.post('delete-eventType',VerifyToken,VerifyUserRole({collection:'Events',permission:'delete'}),async function(request:express.Request,response:express.Response){
    const {typeId} = request.body;
    if(typeId){
        let FindEvent = await EventType.findOne({_id:typeId});
        if(FindEvent){
            let find = await Event.findOne({type:typeId});
            if(!find){
                let promise = EventType.deleteOne({_id:typeId});
                promise.then(()=>{
                    return response.status(200).json({message:'Successfully deleted'})
                })
                promise.catch(err=>{
                    return response.status(501).json({message:err.message})
                })
            }else{
                return response.status(501).json({message:'Event with type exists'})
            }
 
        }else{
            return response.status(501).json({message:'Event not found'})
        }
    }else{
        return response.status(501).json({message:'Enter valid Details'})
    }
});

//edit an event
router.post('/edit-eventType',VerifyToken,VerifyUserRole({collection:'Events',permission:'edit'}),async function(request:express.Request,response:express.Response){
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
router.post('/add-event',VerifyToken,VerifyUserRole({collection:'Events',permission:'add'}),async function(request:express.Request,response:express.Response){
    const { name,
    department,
    organiser,
    description,
    // multiple_events_allowed,
    venue,
    type,
    code,
    faculty_organiser,
    faculty_contact,
    image
    } = request.body;

    if(name&&department&&description&&type&&code){
        let FindEvent = await Event.findOne({$or:[{name:name},{code:code}]});
        if(!FindEvent){
            if(mongoose.Types.ObjectId.isValid(type)){
                let FindEventType = await EventType.findOne({_id:type});
            if(FindEventType){
               let findDepartment = await Department.findOne({name:department})
                if(findDepartment){
                    let event = new Event({
                        name:name,
                        department:findDepartment._id,
                        organiser:organiser.trim(),
                        description:description,
                        // multiple_events_allowed:multiple_events_allowed,
                        venue:venue,
                        type:type,
                        code:code,
                        faculty_organiser:faculty_organiser || '-',
                        faculty_contact:faculty_contact|| '-',
                        image:image
                    })
    
                    let promise = event.save();
                    promise.then(doc=>{
                        
                        return response.status(200).json({message:'Successfully added',doc:doc})
                    });
        
                    promise.catch(err=>{
                        return response.status(501).json({message:err.message})
                    })

                }else{
                    return response.status(501).json({message:'Department not found'})
                }
                
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
router.get('/all-events',VerifyToken,async function(request:jwt_request,response:express.Response){
  
    if(request.tokenData){
        const {userId} = request.tokenData;
        const user = await User.findOne({_id:userId})
        if(user){
            let FindRole = await UserRole.findOne({user_id:user._id});
            if(FindRole){
                let allRoles= await Role.aggregate([
                    {
                       
                        $match:{_id:FindRole.role_id}
                       
    
                    },

                    {
                        $lookup:{
                            from: 'permissions',
                            localField: "_id",
                            foreignField: "role_id",
                            as: "permissions"        
                        }
                    },
                   
                    {
                
                    $project:{
                        'permissions._id':0,
                        'permissions.role_id':0,
                        '__v':0,
                        'permissions.__v':0,
                        
                    }
                    }
                
                ]);
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
                        $lookup:{
                            from: 'departments',
                            localField: "department",
                            foreignField: "_id",
                            as: "department"        
                        }
                    },
                    {
                
                    $project:{
                        '__v':0,
                        'type.__v':0,
                        'department.__v':0
                    }
                    }
                ])
                if(allRoles[0].permissions[0].permissions['Events']['view']){
                return response.status(200).json(events)
                }else{
                    events = events.filter(event=>event.organiser==user.samyak_id);
                    return response.status(200).json(events)
                }
                }else{
                    return response.status(500).json({message:'Authorization failed'});
                }
}}
})

//delete an event
router.post('/delete-event',VerifyToken,VerifyUserRole({collection:'Events',permission:'delete'}),async function(request:jwt_request,response:express.Response){
    const {eventId} = request.body;
    if(eventId){
        let FindEvent = await Event.findOne({_id:eventId});
        if(FindEvent){
        let code = FindEvent._id
            let promise = Event.deleteOne({_id:eventId});
            promise.then(async()=>{
                await EventSlot.deleteMany({event:code});
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
router.post('/edit-event',VerifyToken,VerifyUserRole({collection:'Events',permission:'edit'}),async function(request:jwt_request,response:express.Response){
    const { 
        eventId,
        name,
        department,
        organiser,
        description,
        // multiple_events_allowed,
        venue,
        type,
        code,
        faculty_organiser,
        faculty_contact,
        image,
        } = request.body;

        if(eventId&&name&&department&&description&&type&&code){
            let FindEvent = await Event.findOne({_id:eventId});
            if(FindEvent){
                let FindEventType = await EventType.findOne({_id:type});
                if(FindEventType){
                    let findDepartment = await Department.findOne({name:department});
                    if(findDepartment){
                        let promise = Event.updateOne({_id:eventId},{$set:{
                            name:name,
                            department:findDepartment._id,
                            organiser:organiser.trim(),
                            description:description,
                            // multiple_events_allowed:multiple_events_allowed,
                            venue:venue,
                            type:type,
                            code:code,
                            faculty_organiser:faculty_organiser ||'-',
                            faculty_contact:faculty_contact||'-',
                            image:image
                        }}) ;
                        promise.then(doc=>{
                            return response.status(200).json({message:'Successfully updated',response:doc})
                        })
                        promise.catch(err=>{
                            return response.status(501).json({message:err.message})
                        })
                    }else{
                        return response.status(501).json({message:'Invalid department'})
                    }
                
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

router.post('/add-csvEvents',VerifyToken,VerifyUserRole({collection:'Events',permission:'add'}),async function(request:jwt_request,response:express.Response){
    if(request.files){
        const {newfile} = request.files;

        fs.writeFileSync(__dirname+'/events.csv',newfile.data);
        let data = await csvtojson().fromFile(__dirname+'/events.csv')
        data.forEach(async event=>{
            let findEvent = await Event.findOne({code:event.code});
            if(!findEvent){
                let findType = await EventType.findOne({name:event.type})
                if(findType){
                    let findDepartment = await Department.findOne({name:event.department});
                    if(findDepartment){
                        let newevent = new Event({
                            name:event.name,
                            department:findDepartment._id,
                            organiser:event.organiser.trim(),
                            description:event.description,
                            // multiple_events_allowed:event.multiple_events_allowed,
                            venue:event.venue,
                            type:findType._id,
                            code:event.code,
                            faculty_organiser:event.faculty_organiser||'-',
                            faculty_contact:event.faculty_contact||'-'
                        })
    
                    await newevent.save();
                    }
                }      
            }
            })
            fs.unlinkSync(__dirname+'/events.csv');
            return response.status(200).json({message:'successfull'})
 
    }else{
        return response.status(501).json({message:'Not added'})
    }
  
})

router.post('/edit-csvEvents',VerifyToken,VerifyUserRole({collection:'Events',permission:'edit'}),async function(request:jwt_request,response:express.Response){
    if(request.files){
        const {newfile} = request.files;

        fs.writeFileSync(__dirname+'/events.csv',newfile.data);
        let data = await csvtojson().fromFile(__dirname+'/events.csv')
        response.send(data)
        data.forEach(async event=>{
            let findDepartment = await Department.findOne({name:event.department});
            if(findDepartment){
                let newevent =  await Event.updateOne({code:event.code},{$set:{
                    name:event.name,
                        department:findDepartment._id,
                        organiser:event.organiser.trim(),
                        description:event.description,
                        // multiple_events_allowed:event.multiple_events_allowed,
                        venue:event.venue,
                        type:event.type,
                        code:event.code,
                        faculty_organiser:event.faculty_organiser||'-',
                        faculty_contact:event.faculty_contact||'-'
                }},{ upsert: false })
            }
         
        })
        fs.unlinkSync(__dirname+'/events.csv');
        return response.status(200).json({message:'successfull'})
    }
  
});



router.get('/get-events',async function(request:express.Request,response:express.Response){
    const {event_department,event_type} = request.query;
    if(event_department&&event_type){
        let type = await EventType.findOne({name:String(event_type)});
         
        if(type){
          
            if(event_department=='all'){
                // await Event.find({type:type._id});
                let all_events = await Event.aggregate([
                    {
                        $match:{type:type._id}
                    },
                    {
                        $lookup:{
                            from: 'departments',
                            localField: "department",
                            foreignField: "_id",
                            as: "department"        
                        }
                    },
                ])
                return response.status(200).json({events:all_events})
            }else{
                let dept = await Department.findOne({name:String(event_department)})
               let  events = await Event.aggregate([
                    {
                        $match:{type:type._id,department:dept?._id}
                    },
                    {
                        $lookup:{
                            from: 'departments',
                            localField: "department",
                            foreignField: "_id",
                            as: "department"        
                        }
                    },
                ])
    
                return response.status(200).json({events:events})
            }
           
        }else{
        return response.status(501).json({message:'Query invalid'})
        } 
    }else{
        return response.status(501).json({message:'Query not found'})
    }
})

router.post('/add-department',VerifyToken,async function(request:jwt_request,response:express.Response){
    const {name} = request.body;
    if(name){
        const findDepartment = await Department.findOne({name:name});
        if(!findDepartment){
            let department = new Department({
                name:name.trim()
            });
            let promise = department.save()
            promise.then(doc=>{
                return response.status(200).json({message:'Successfully added',doc:doc})
            });

            promise.catch(err=>{
                return response.status(501).json({message:err.message})
            })
        }else{
            return response.status(501).json({message:'Department already found'})
        }
    }else{
        return response.status(501).json({message:'Enter valid department name'})
    }
});


router.post('/edit-department',VerifyToken,async function(request:jwt_request,response:express.Response){
    const {departmentId,name} = request.body;
    if(name&&departmentId){
        const findDepartment = await Department.findOne({_id:departmentId});
        if(findDepartment){
          
            let promise = Department.updateOne({_id:departmentId},{$set:{name:name}})
            promise.then(doc=>{
                return response.status(200).json({message:'Successfully updated',doc:doc})
            });

            promise.catch(err=>{
                return response.status(501).json({message:err.message})
            })
        }else{
            return response.status(501).json({message:'Department not found'})
        }
    }else{
        return response.status(501).json({message:'Enter valid department name'})
    }
});



router.post('/delete-department',VerifyToken,VerifyUserRole({collection:'Events',permission:'delete'}),async function(request:jwt_request,response:express.Response){
    const {departmentId} = request.body;
    if(departmentId){
        let FindDepartment = await Department.findOne({_id:departmentId});
        if(FindDepartment){
        let code = FindDepartment._id
            let promise = Department.deleteOne({_id:departmentId});
            promise.then(async()=>{
                await Event.deleteMany({department:code});
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



router.get('/all-departments',VerifyToken,async function(request:jwt_request,response:express.Response){
    let departments = await Department.find({});
    return response.status(200).json(departments)
})
export default router;