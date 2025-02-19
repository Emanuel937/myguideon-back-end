const express =  require('express');
const router  = express.Router();
const db      = require('../config/db');
const sendMail = require('../utils/transporter');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
//const session = require('express-session');
// adding the profil and permission to user
//  Adding the profil and permission to user
router.post('/add', async (req, res) => {

  
  const { name, permissions}  = req.body; // Accès direct si `req.body` est un objet
  // Vérifiez que les données nécessaires sont présentes
  if (!name || !permissions) {
    return res.status(400).json({ error: 'Name and permission are required' });
  }
  const query = 'INSERT INTO equipes (name, permissions) VALUES (?, ?)';


  try {
    // Exécution de la requête
    const [result] = await db.execute(query, [name, JSON.stringify(permissions)]);

    // Vérifiez si l'insertion a été réussie
    if (result.affectedRows > 0) {
      return res.status(200).json({ message: 'Data added successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to add data' });
    }
  } catch (error) {
    console.error('Erreur lors de l’ajout des données :', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/show/admin_user',  async (req, res)=>{
    
  const selectQuery = 'SELECT * FROM user_admin';

  try{
      const [response] = await db.execute(selectQuery);
      res.status(200).json(response);
  }
  catch(error){
    console.log(error);
  }

});

router.get('/',  async(req, res)=>{
    const query =  'SELECT * FROM equipes';
    try {
        // Exécution de la requête
        const [result] = await db.execute(query);
    
        // Vérifiez si l'insertion a été réussie
        if (result) {
          return res.status(200).json({ message: result});
        } else {
          console.log(result);
          return res.status(500).json({ error: 'Failed to add data' });
        }
      } catch (error) {
        console.error('Erreur lors de l’ajout des données :', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
})



router.delete('/delete/:id', async(req, res)=>{
    const id =  req.params.id;
    const query = 'DELETE FROM equipes WHERE id= ?';

    console.log(id);
    try{
    await db.execute(query, [id]);

    }catch(error){
        console.log(error);
    }

});


router.put('/update/:id', async(req, res)=>{
     
    const ID              =  req.params.id;
    const {permissions}   =  req.body;

    const query           = "UPDATE equipes SET permissions = ? WHERE id = ?";
    try{
        await db.execute(query, [ JSON.stringify(permissions), ID]);
        console.log("donne");
        res.status(200).json("200")
    }catch(error){
        console.log(error);
    }

});


router.post('/add/user/admin', async(req, res)=>{

    console.log(req.body);
    const query =  "INSERT INTO user_admin (name, email, password, avatar, profil_id, isfirsttime) VALUES (?, ?, ?, ?, ?, ?)";
    const  {name, email, password, avatar, profileId}  = req.body;



   //check if the email already exist
   const [emailExist] = await db.execute('SELECT  email FROM user_admin  WHERE email = ?', [email]);

   if(emailExist.length > 0)
   {
    return res.status(200).json({ error:true, message: "C'est mail est déja utilisé" });
   }

    var hashedPassword = await bcrypt.hash(password, 10);

    var html = `<h1>  Un compte avec votre mail vient d'être créé </h1>
            <p>vous pouvez dès maintenant vous connecter sur espace utilisateur , voici votre mail:
            ${email} et voici votre mot de pass  ${password}
    
    `

    try{
             
            await db.execute(query,[name, email, hashedPassword, avatar, profileId, 'yes']);
            sendMail(
            email,
            'Sujet de test',
            html,
            
        );

        return res.status(200).json({ error:false, message: " User added successly" });


    }catch(err){
            console.log(error);
    }
           

});



router.put('/update/user/:id', async (req, res) => {
  const { id } = req.params;
  let { name, email, password, avatar, profil_id } = req.body;
  



  try {

      if (password) {
        const isHashed = password.startsWith("$2b$") || password.startsWith("$2a$") || password.startsWith("$2y$");
        if (!isHashed) {
          password = await bcrypt.hash(password, 10); // Hacher uniquement si ce n'est pas déjà fait
        }
      }
      // Mise à jour des informations de l'utilisateur
      const query = `
          UPDATE user_admin 
          SET name = ?, email = ?, password = ?, avatar = ?, profil_id = ?
          WHERE id = ?
      `;
      await db.execute(query, [name, email, password, avatar, profil_id, id]);
      res.status(200).json({ message: "Utilisateur mis à jour avec succès" });

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
  }
});


// Route pour le login
router.post('/login', async (req, res) => {

  const { email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const rows = await db.execute('SELECT * FROM user_admin WHERE email = ?', [email]);
       
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }

        const user = rows[0][0];

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return res.status(401).json({ error: 'Mot de passe incorrect.' });
        }

        /* Créer une session utilisateur (simple exemple)
        req.session.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        };

        console.log(req.session)
          // Ajoutez un log ici pour vérifier l'en-tête Set-Cookie
    res.setHeader('Set-Cookie', req.session.cookie);*/

    res.status(200).json({ message:user.id, isfirstTime:user.isfirsttime});
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      res.status(500).json({ error: 'Erreur interne du serveur.' });
    }

});

// Route pour le mot de passe oublié
router.post('/send_code', async (req, res) => {
 
  
  const { email } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const [rows] = await db.execute('SELECT * FROM user_admin WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    const user = rows[0];

    // Générer un mot de passe temporaire (par exemple 8 caractères alphanumériques)
    const temporaryPassword = Math.random().toString(36).slice(-8);



    // Mettre à jour le mot de passe dans la base de données
    await db.execute('UPDATE user_admin SET password = ? WHERE email = ?', [hashedPassword, email]);

    // Envoyer le mot de passe temporaire par e-mail

    const mailOptions = {
      from: 'votre_email@gmail.com',
      to: email,
      subject: 'Réinitialisation de mot de passe',
      html: `
        <h1>Réinitialisation de votre mot de passe</h1>
        <p>Bonjour ${user.name},</p>
        <p>Votre mot de passe temporaire est : <b>${temporaryPassword}</b></p>
        <p>Nous vous recommandons de le changer dès que possible.</p>
      `,
    };

    sendMail(mailOptions.to, mailOptions.subject, mailOptions.html);

    res.status(200).json({ message: 'Un mot de passe temporaire a été envoyé à votre adresse e-mail.' });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe :', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }


});


// Route pour supprimer un utilisateur par ID
router.delete('/user/delete/:id', (req, res) => {
  const userId = req.params.id; // ID de l'utilisateur à supprimer

  const query = 'DELETE FROM user_admin WHERE id = ?';
  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error('Erreur de suppression:', err);
      return res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  });
});
/*

router.get('/session', (req, res) => {
  console.log('Cookies reçus:', req.session); // Affiche les cookies reçus

  if (req.session.user) {
    console.log('Session trouvée:', req.session.user);
    return res.status(200).json(req.session.user); // Retourne les données de la session
  } else {
    console.log('Aucune session trouvée');
    return res.status(401).json({ error: 'No session found' });
  }
});

*/


router.get('/user_profil/:id', async (req, res)=>{
    const query =  "SELECT * FROM user_admin WHERE id = ?";
    try{
    const response =  await db.execute(query, [req.params.id]);

      res.status(200).json(response);
        
    }catch(error){
       console.log(error);
    }

});




//send code :
// Route pour envoyer un email avec un code de vérification
router.post('/send-reset-code', async (req, res) => {
  const { email } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const [rows] = await db.execute('SELECT * FROM user_admin WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    const user = rows[0];

    // Générer un code de vérification à 6 chiffres
    const resetCode = Math.floor(100000 + Math.random() * 900000);

    // Stocker le code dans la base de données (vous pouvez aussi utiliser Redis)
    await db.execute('UPDATE user_admin SET reset_code = ? WHERE email = ?', [resetCode, email]);

    // Envoyer le code par e-mail
    const mailOptions = {
    
      to: email,
      subject: 'Code de réinitialisation de mot de passe',
      html: `
        <h1>Code de réinitialisation</h1>
        <p>Bonjour ${user.name},</p>
        <p>Votre code de réinitialisation est : <b>${resetCode}</b></p>
        <p>Ce code expirera dans 10 minutes.</p>
      `,
    };

    sendMail(mailOptions.to, mailOptions.subject,  mailOptions.html);

    res.status(200).json({ message: 'Un code de réinitialisation a été envoyé à votre adresse e-mail.' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du code de réinitialisation :', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});


// verify code 
// Route pour vérifier le code de réinitialisation
router.post('/verify-code', async (req, res) => {
  const { email, code } = req.body;

  console.log(req.body);

  try {
    const [rows] = await db.execute('SELECT * FROM user_admin WHERE email = ? AND reset_code = ?', [email, code]);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Code invalide ou expiré.' });
    }

    res.status(200).json({ message: 'Code vérifié avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la vérification du code :', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

//reset code 
// Route pour réinitialiser le mot de passe
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe dans la base de données
    await db.execute('UPDATE user_admin SET password = ?, reset_code = NULL, isfirsttime = NULL WHERE email = ?', [hashedPassword, email]);

    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès.' });

    var html = `
    <h1>Mot de passe changé</h1>
    <p>Bonjour; </p>
    <p>Votre mot de passe a été changé : </p>
  
  `;
    sendMail(
      email,
      'Changement de mot de pase',
      html,
      
  );
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe :');
    res.status(500).json({ error: `Erreur interne du serveur.${error}` });
  }
});


// user update information from user 
router.put('/update/user/own/:id', async (req, res) => {
  const { id } = req.params;
  let { name, email, password, avatar, profil_id } = req.body;
  
  try {

      if (password) {
        const isHashed = password.startsWith("$2b$") || password.startsWith("$2a$") || password.startsWith("$2y$");
        if (!isHashed) {
          password = await bcrypt.hash(password, 10); // Hacher uniquement si ce n'est pas déjà fait
        }
      }
      // Mise à jour des informations de l'utilisateur
      const query = `
          UPDATE user_admin 
          SET name = ?, email = ?, password = ?, avatar = ?
          WHERE id = ?
      `;
      await db.execute(query, [name, email, password, avatar, id]);
      res.status(200).json({ message: "Utilisateur mis à jour avec succès" });

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
  }
});


module.exports = router;