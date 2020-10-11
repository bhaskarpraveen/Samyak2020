import User from '../models/users';

let generateSamyakId = async function(){
    let id_string:String = 'SMK2K';
    let id_num = 20000000 ;
    let total =  await User.find({}).sort('-samyak_id').limit(1);
    let num:number ;
    if (total.length==0) num=0;
    else{
       num = total[0].samyak_id;
       num = Number(num.toString().slice(7))+1;
    }
    id_string = id_string+String( id_num + num)
    return id_string
};

export default generateSamyakId;