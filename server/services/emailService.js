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

//function to send approval request to admin
function sendApprovalRequestEmail(adminEmail, username, email) {
    const mailOptions = {
      //This should be the sender address
      from: process.env.EMAIL_USER, 
      to: adminEmail, 
      subject: 'New Profile Approval Request',
      text: `A new user as requested to create an profile.
  
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

  module.exports = { sendApprovalRequestEmail };

  //function for sending an approval anouncment to user
  function sendApprovalAcceptanceEmail(adminEmail, username, email) {
    const mailOptions = {
      from: adminEmail, 
      to: email, 
      subject: 'New Profile Approved',
      text: `Hello ${username}, the admin has aproved your requested to create an profile.
  
             Username: ${username}
             Email: ${email}

             Use this link to log in: http://localhost:3000/login
            
             Thank you for creating an profile with us.`,

      html: '<body><h1>Welcome</h1><p>Hello' + username + ', the admin has aproved your requested to create an profile.</p><p>Username: ' + username + '</p><p>Email: ' + email + '</p><p>Use this link to log in: </p><a href="http://localhost:3000/login">Link</a><p>Thank you for creating an profile with us.</p></body>'
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

  module.exports = { sendApprovalAcceptanceEmail };

  //function for sending emails in general
  function sendEmail(senderEmail, reciverEmail, subject, body) {
    const mailOptions = {
      from: senderEmail, 
      to: reciverEmail, 
      subject: subject,
      text: body
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

  module.exports = { sendEmail };

