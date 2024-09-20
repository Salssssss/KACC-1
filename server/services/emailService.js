//Used this tutorial as a start: https://mailtrap.io/blog/javascript-send-email/#Send-email-using-Nodejs-and-Nodemailer
//If we want to use Outlook we might want to look at this: https://mailtrap.io/blog/outlook-smtp/ 

//Load the admin login credentials
require('dotenv').config(); 
const nodemailer = require('nodemailer');

//Create a transporter object
const transporter = nodemailer.createTransport({
   service: 'Outlook',
   auth: { 
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
   } 
}); 

function sendApprovalRequestEmail(adminEmail, username, email) {
    const mailOptions = {
      //This should be the sender address
      from: process.env.EMAIL_USER, 
      to: adminEmail, 
      subject: 'A New User is Requesting Account Approval',
      text: `A new user as requested to create an account.
  
             Username: ${username}
             Email: ${email}
  
             Please review and approve/deny the request in your dashboard.`
    };
  
    //Sending the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } 
      else {
        console.log('Email sent: ' + info.response);
      }
    });
  }

  module.exports = { sendAccountApprovalEmail };

