const db = require("./client");

class AbstractModel {
    constructor({ table }) {
        this.table = table;
    }

    async findAll() {
        const [rows] = await db.query(`SELECT * FROM ${this.table}`);
        return rows;
    }

    async findById(id) {
        const [rows] = await db.query(`SELECT * FROM ${this.table} WHERE id = ?`, [id]);
        return rows[0];
    }

    async deleteById(id) {
        const result = await db.query(`DELETE FROM ${this.table} WHERE id = ?`, [id]);
        return result.affectedRows;
    }
}

module.exports = AbstractModel;
