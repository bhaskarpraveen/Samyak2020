import UserEventBatch from '../models/user_event_batch';
import Event from '../models/events';
import User from '../models/users';
import EventSlot from '../models/event_slots';
import UserEventRegistration from '../models/user_event_registrations';
let checkSlots =async function(user:any,event:any){
    //all registerd events of the user
    let registered_events = await UserEventRegistration.find({user_id:user._id})
    if(!registered_events)return true;
    else{
        //slots of the event user currently trying to register
      let event_slots = await EventSlot.find({event_id:event._id})
      if(!event_slots) return true;
      //slots of the user already registered
        let registered_slots =[];
        for(let i=0;i<registered_events.length;i++){
            let slots = await EventSlot.find({event_id:event._id});
            registered_slots.push(slots)
        }
        if(!registered_slots)return true;
        let check=1;
        for(let i=0;i<event_slots.length;i++){
            if(!event_slots[i].multiple_events_allowed){
                for(let j=0;j<registered_slots.length;j++){
                    if(!registered_slots[i].multiple_events_allowed){


                        let current_slot_start = event_slots[i].date;
                        current_slot_start.setHours(Number(event_slots[i].start_time.split(":")[0]))
                        current_slot_start.setMinutes(Number(event_slots[i].start_time.split(":")[1]))
                        let current_slot_end = event_slots[i].date;
                        current_slot_end.setHours(Number(event_slots[i].end_time.split(":")[0]))
                        current_slot_end.setMinutes(Number(event_slots[i].end_time.split(":")[1]))

                        let registered_slot_start = registered_slots[i].date;
                        registered_slot_start.setHours(Number(registered_slots[i].start_time.split(":")[0]))
                        registered_slot_start.setMinutes(Number(registered_slots[i].start_time.split(":")[1]))
                        let registered_slot_end = registered_slots[i].date;
                        registered_slot_end.setHours(Number(registered_slots[i].end_time.split(":")[0]))
                        registered_slot_end.setMinutes(Number(registered_slots[i].end_time.split(":")[1]))
                      if((current_slot_start>registered_slot_start&&current_slot_start<registered_slot_end)||(current_slot_end>registered_slot_start&&current_slot_end<registered_slot_end)){
                          check=0;
                          return false
                      }


                    }
                }
            }
        }
        return check;

    }
    
}

export default checkSlots;