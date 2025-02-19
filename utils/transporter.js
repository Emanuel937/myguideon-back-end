const nodemailer = require('nodemailer');

// Configurer le service de mail
const transporter = nodemailer.createTransport({
  host: 'xs.codaby.fr', // Hôte SMTP
  port: 465,            // Port SMTP sécurisé
  secure: true,         // Utiliser SSL/TLS
  auth: {
    user: 'contact@xs.codaby.fr', // Votre adresse e-mail
    pass: 'Emanuel10abi',   // Mot de passe de l'e-mail
  },
});


async function sendEmail(to, subject, html) {
  try {
    const mailOptions = {
      from: 'contact@xs.codaby.fr', // Adresse e-mail de l'expéditeur
      to,                           // Destinataire(s)
      subject,                      // Sujet de l'e-mail
      html,                         // Corps en HTML (facultatif)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail envoyé avec succès :', info.messageId);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
  }
}

// Exemple d'appel


// Exporter le transporteur pour l'utiliser ailleurs
module.exports = sendEmail;
