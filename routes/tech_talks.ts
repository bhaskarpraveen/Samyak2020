import express from 'express';
import Event from '../models/events';
import EventType from '../models/event_types';
import VerifyUserRole from '../middlewares/verify_user_role'
import VerifyToken from '../middlewares/verify_token';
import mongoose, { version } from 'mongoose';
import User from '../models/users';
import UserRole from '../models/user_roles';
import Role from '../models/roles';
import fs from 'fs';
import csvtojson from 'csvtojson';
import EventSlot from '../models/event_slots';
import TechTalk from '../models/tech_talks';
const router:express.Router = express.Router();
import dotenv from 'dotenv';
dotenv.config();

//interface 
interface jwt_request extends express.Request{
    tokenData?:{userId?:String}
}

router.post('/add-talk',VerifyToken,VerifyUserRole({collection:'Events',permission:'add'}),async function(request:jwt_request,response:express.Response){
    const {
        title,
        speaker,
        speaker_designation,
        description,
        time,
        organiser,
        code,
        image
    }= request.body;
    if(title&&speaker&&speaker_designation&&description&&time&&organiser&&code){
        let FindOrganiser = await User.findOne({samyak_id:organiser});
        if(FindOrganiser){
            let FindTalk = await TechTalk.findOne({$or:[{title:title},{code:code}]})
            if(!FindTalk){
                let talk = new TechTalk({
                    title:title,
                    speaker:speaker,
                    speaker_designation:speaker,
                    description:description,
                    time:time,
                    organiser:organiser,
                    code:code,
                    image:image
                })
                let promise = talk.save();
                promise.then(doc=>{
                    
                    return response.status(200).json({message:'Successfully added',doc:doc})
                });
    
                promise.catch(err=>{
                    return response.status(501).json({message:err.message})
                })
            }else{
                return response.status(501).json({message:'Tech talk with same title/code exists'})
            }
        }else{
            return response.status(501).json({message:'Organizer Not available'})
        }
    }else{
        return response.status(501).json({message:'Enter all details'})
    }

})


router.post('/edit-talk',VerifyToken,VerifyUserRole({collection:'Events',permission:'edit'}),async function(request:jwt_request,response:express.Response){
    const {
        title,
        speaker,
        speaker_designation,
        description,
        time,
        organiser,
        code,
        image
    }= request.body;
    if(title&&speaker&&speaker_designation&&description&&time&&organiser&&code){
        let FindOrganiser = await User.findOne({samyak_id:organiser});
        if(FindOrganiser){
            let FindTalk = await TechTalk.findOne({title:title,code:code})
            if(FindTalk){
                let promise = TechTalk.updateOne({code:code},{$set:{
                    title:title,
                    speaker:speaker,
                    speaker_designation:speaker,
                    description:description,
                    time:time,
                    organiser:organiser.trim(),
                    code:code,
                    image:image
                }});
                
                promise.then(doc=>{
                    
                    return response.status(200).json({message:'Successfully updated',doc:doc})
                });
    
                promise.catch(err=>{
                    return response.status(501).json({message:err.message})
                })
            }else{
                return response.status(501).json({message:'Tech talk not found'})
            }
        }else{
            return response.status(501).json({message:'Organizer Not available'})
        }
    }else{
        return response.status(501).json({message:'Enter all details'})
    }
})

router.get('/all-talks',VerifyToken,VerifyUserRole({collection:'Events',permission:'view'}),async function(request:jwt_request,response:express.Response){

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
                let talks = await TechTalk.find({});
                if(allRoles[0].permissions[0].permissions['Events']['view']){
                return response.status(200).json(talks)
                }else{
                    talks = talks.filter(event=>event.organiser==user.samyak_id);
                    return response.status(200).json(talks)
                }
                }else{
                    return response.status(500).json({message:'Authorization failed'});
                }
            }
        }else{
            return response.status(500).json({message:'Authorization failed'});
        }
})


router.post('/delete-talk',VerifyToken,VerifyUserRole({collection:'Events',permission:'delete'}),async function(request:jwt_request,response:express.Response){
    const {talkId} = request.body;
    if(talkId){
        let FindTalk = await TechTalk.findOne({_id:talkId});
        if(FindTalk){
            let promise = TechTalk.deleteOne({_id:talkId});
            promise.then(async()=>{
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


router.post('/add-csvTalks',VerifyToken,VerifyUserRole({collection:'Events',permission:'add'}),async function(request:jwt_request,response:express.Response){
    if(request.files){
        const {newfile} = request.files;

        fs.writeFileSync(__dirname+'/talks.csv',newfile.data);
        let data = await csvtojson().fromFile(__dirname+'/talks.csv')
        data.forEach(async talk=>{
            let findtalk = await TechTalk.findOne({code:talk.code});
            if(!findtalk){
    
                    let newtalk = new TechTalk({
                        title:talk.title,
                        speaker:talk.speaker,
                        speaker_designation:talk.speaker,
                        description:talk.description,
                        time:talk.time,
                        organiser:talk.organiser.trim(),
                        code:talk.code,
                    })

                await newtalk.save();
                    
            }
            })
            fs.unlinkSync(__dirname+'/talks.csv');
            return response.status(200).json({message:'successfull'})
 
    }else{
        return response.status(501).json({message:'Not added'})
    }
  
})

router.post('/edit-csvTalks',VerifyToken,VerifyUserRole({collection:'Events',permission:'edit'}),async function(request:jwt_request,response:express.Response){
    if(request.files){
        const {newfile} = request.files;

        fs.writeFileSync(__dirname+'/talks.csv',newfile.data);
        let data = await csvtojson().fromFile(__dirname+'/talks.csv')
        data.forEach(async talk=>{
           let newevent =  await Event.updateOne({code:talk.code},{$set:{
            title:talk.title,
            speaker:talk.speaker,
            speaker_designation:talk.speaker,
            description:talk.description,
            time:talk.time,
            organiser:talk.organiser.trim(),
            code:talk.code,
            }},{ upsert: false })
        })
        fs.unlinkSync(__dirname+'/talks.csv');
        return response.status(200).json({message:'successfull'})
    }
  
});





//Returns all tech talks for website
router.get('/get-talks',async function(request:express.Request,response:express.Response){
    let talks = await TechTalk.find({})
    return response.status(200).json({talks:talks})
})
export default router;