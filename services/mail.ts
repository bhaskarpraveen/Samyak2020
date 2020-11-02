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
        host: process.env.MAIL_HOST,
        port: 465,
        secure: true,
        auth: {
            user: 'notification@klsamyak.in',
            pass: process.env.PASS
        }
    });
    
try{
    let html =await fs.readFileSync('templates/'+data.html,{encoding:'utf-8'})
       
    let template = handlebars.compile(html);    

    let htmlToSend = template(data.replacements);
    
    let mailOptions = {
        from: 'notification@klsamyak.in',
        to:data.to, 
        subject: data.subject,
        html: htmlToSend
    };
   
   transporter.sendMail(mailOptions);
    return {status:200,message:'Successfully sent'};
}
  catch(e){
    return {status:501,message:e};

  }
        


}
  




export default SendMail;
