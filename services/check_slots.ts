import UserEventBatch from '../models/user_event_batch';
import Event from '../models/events';
import User from '../models/users';
import EventSlot from '../models/event_slots';
import UserEventRegistration from '../models/user_event_registrations';
let checkSlots =async function(user:any,event:any){
    //all registerd events of the user
    let registered_events = await UserEventRegistration.find({user_id:user._id}) 
    console.log({registered_events})
    console.log(registered_events.length==0)
    if(registered_events.length==0) return true;
    else{
        //slots of the event user currently trying to register
      let event_slots = await EventSlot.find({event_id:event._id})
      console.log({event_slots})
      if(!event_slots) return true;
      //slots of the user already registered
        let registered_slots:any =[];
        for(let i=0;i<registered_events.length;i++){
            let slots = await EventSlot.find({event_id:registered_events[i].event_id}); //replace event with registered_events[i]
            if(slots) slots.forEach(slot=>{
                registered_slots.push(slot)
            })
            
        
        }

        console.log({registered_slots})
        if(!registered_slots)return true;
        let check=1;
        for(let i=0;i<event_slots.length;i++){
            if(!event_slots[i].multiple_events_allowed){

                let current_slot_start = event_slots[i].date;
                let s_hr =Number(event_slots[i].start_time.split(":")[0])
                let s_min = Number(event_slots[i].start_time.split(":")[1])
                current_slot_start.setHours(s_hr,s_min)
               
                let current_slot_end = event_slots[i].date;
                let e_hr =Number(event_slots[i].end_time.split(":")[0])
                let e_min = Number(event_slots[i].end_time.split(":")[1])
                current_slot_end.setHours(e_hr,e_min)
                
               
                console.log({current_slot_start,s_hr,s_min})
                console.log({current_slot_end,e_hr,e_min})

                // let slot_date = event_slots[i].date
                // let start_hour = Number(event_slots[i].start_time.split(":")[0])
                // let start_min =  Number(event_slots[i].start_time.split(":")[1])
                // let end_hour = Number(event_slots[i].end_time.split(":")[0])
                // let end_min = Number(event_slots[i].end_time.split(":")[1])

                for(let j=0;j<registered_slots.length;j++){
                console.log({registered_slots})
                        if(!registered_slots[j].multiple_events_allowed){
    
                            let registered_slot_start = registered_slots[j].date;
                            let r_s_hr =Number(registered_slots[i].start_time.split(":")[0])
                            let r_s_min = Number(registered_slots[i].start_time.split(":")[1])
                            registered_slot_start.setHours(r_s_hr,r_s_min)
                          
                            let registered_slot_end = registered_slots[j].date;
                            let r_e_hr =Number(registered_slots[i].end_time.split(":")[0])
                            let r_e_min = Number(registered_slots[i].end_time.split(":")[1])
                            registered_slot_end.setHours(r_e_hr,r_e_min)

                            console.log({registered_slot_start,r_s_hr,r_s_min})
                            console.log({registered_slot_end,r_s_hr,r_s_min})
                           
                          if((current_slot_start>=registered_slot_start&&current_slot_start<registered_slot_end)||(current_slot_end>registered_slot_start&&current_slot_end<registered_slot_end)){
                              console.log('false returned')
                              check=0;
                              return false
                          }

                        
                            // let registered_slot_date = registered_slots[i].date
                            // let registered_start_hour = 


                    }
                }
            }
        }
        console.log('Returnd check:'+check)
        return check;

    }
    
}

export default checkSlots;