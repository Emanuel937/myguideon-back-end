const express  = require('express');
const db       = require('./config/db');

require('dotenv').config

const app      = express();

app.get('/', (req, res)=>{
    
    res.json({message:'running ....  emanuel from node'})
});

app.use(express.json)

const PORT =  3030; 

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


