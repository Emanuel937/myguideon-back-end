const nodemailer = require('nodemailer');



const transporter = nodemailer.createTransport({
  host: 'xs.codaby.fr', 
  port: 465,           
  secure: true,         
  auth: {
    user: 'contact@xs.codaby.fr',
    pass: 'Emanuel10abi',  
  },
});


async function sendEmail(to, subject, html) {
  try {
    const mailOptions = {
      from: 'contact@xs.codaby.fr',
      to,                           
      subject,                      
      html,                         
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail envoyé avec succès :', info.messageId);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
  }
}


module.exports = sendEmail;
