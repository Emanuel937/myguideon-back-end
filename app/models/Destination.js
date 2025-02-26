const AbstractModel = require('../../database/AbstractModel');

class Destination extends AbstractModel {
    constructor() {
        super({ table: 'destination' });
    }

    async add(basicInfo, author) {
        const query = 'INSERT INTO destination (basic_info, author) VALUES (?, ?)';
        const [result] = await db.execute(query, [JSON.stringify(basicInfo), author]);
        return result.insertId;
    }

    async update(id, updatedBasicInfo) {
        const query = 'UPDATE destination SET basic_info = ? WHERE id = ?';
        await db.execute(query, [JSON.stringify(updatedBasicInfo), id]);
    }

    
}

module.exports = new Destination();
