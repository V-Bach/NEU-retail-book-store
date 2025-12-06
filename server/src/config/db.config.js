const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize( 
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
        define: {
            freezeTableName: true
        }
    }
);

async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('database connection establised successfully');
        
        await sequelize.sync({ 
            alter: true
        });
    } catch (error) {
        console.error('unable to connect to the database', error);
        process.exit(1);
    }
}

module.exports = { sequelize, connectDB };