/*const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
});

sequelize.authenticate()
    .then(() => console.log("Database connected..."))
    .catch(err => console.error("DB Connection Error:", err));

module.exports = sequelize;*/

const mongoose = require('mongoose');
const dotenv =require('dotenv').config();


mongoose.connect(process.env.mongourl)


var connection = mongoose.connection

connection.on('error', ()=>{
    console.log('monodb connetion failed')
})

connection.on('connected', ()=>{
    console.log('monodb connetion successfull')
})



module.exports = mongoose
