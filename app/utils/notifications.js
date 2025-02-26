const sendMail = require('./emailSender');
const db = require('../config/db');
const hostLink = require('../constant/host');

exports.notifyTheAuthor = async (status, destinationID, authorID) => {
    if (status.toLowerCase().includes("published")) {
        const query = 'SELECT email FROM user_admin WHERE id = ?';
        const [author] = await db.execute(query, [authorID]);

        if (author.length > 0) {
            const html = `<h1>Votre destination ${destinationID} a été publiée</h1>
                          <p>Consultez-la ici : <a href="${hostLink}/destination/overview/${destinationID}">${hostLink}/destination/overview/${destinationID}</a></p>`;

            sendMail(author[0].email, 'Destination publiée', html);
        }
    }
};

exports.notifyAllAdmin = async (status, destinationID) => {
    if (!status.toLowerCase().includes('pending validation')) return;

    const query = 'SELECT email FROM user_admin';
    const [admins] = await db.execute(query);

    const html = `<h1>Validation requise</h1>
                  <p>Une destination (${destinationID}) attend validation.</p>
                  <p><a href="${hostLink}/admin?page=list_destination&isEdit=yes&destinationID=${destinationID}">Valider</a></p>`;

    admins.forEach(admin => sendMail(admin.email, "Validation requise", html));
};
