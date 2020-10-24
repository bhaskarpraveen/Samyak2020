let formatDate = function(date:Date,time:String):Date{

        let new_date = new Date(date);
        let time_hours = Number(time.charAt(0)+time.charAt(1))
        new_date.setUTCHours(time_hours);
        let time_minutes = Number(time.charAt(3)+time.charAt(4))
        new_date.setUTCMinutes(time_minutes);       
        return new_date;
       
   
}

export default formatDate;