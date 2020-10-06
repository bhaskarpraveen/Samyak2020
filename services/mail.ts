import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';



interface emailData{
    html:string,
    replacements:Object,
    from:string,
    to:string
    subject:string
}


//email service
let SendMail = async function(data:emailData){

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'praveennaidu264@gmail.com',
            pass: process.env.PASS
        }
    });
    
try{
    let html =await fs.readFileSync('templates/'+data.html,{encoding:'utf-8'})
       
    var template = handlebars.compile(html);    

    var htmlToSend = template(data.replacements);
    
    var mailOptions = {
        from: data.from,
        to:data.to, 
        subject: data.subject,
        html: htmlToSend
    };
   
    await transporter.sendMail(mailOptions);
    return {status:200,message:'Successfully sent'};
}
  catch(e){
    return {status:501,message:e};

  }
        


}
  




export default SendMail;