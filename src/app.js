const express = require('express');
const setupSwagger = require("./swagger");
const cors = require('cors');
require('dotenv').config();
//const sequelize = require('./database');
const bot = require('./bot/bot');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/userRoutes');
const betRoutes = require('./routes/betRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const notificationRoutes = require('./routes/notificationsRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const dbconfig = require('./database');

app.use('/api/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use("/bets", betRoutes);
app.use("/wallet", transactionRoutes);
app.use("/notifications", notificationRoutes);

//sequelize.sync().then(() => console.log("DB Synced"));

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
    console.log("Swagger docs available at http://localhost:3000/api-docs");
});
