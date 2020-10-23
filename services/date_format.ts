let formatDate = function(date:Date,time:String):Date{

        let new_date = new Date(date);
        let new_time = Number(time.charAt(0)+time.charAt(1))
        new_date.setHours(new_time)
        return new_date
    
   
}

export default formatDate;