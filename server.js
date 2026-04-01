require('dotenv').config(); 
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const bcrypt = require('bcrypt');
require('./models/associations');
const sequelize = require('./config/database');
const User = require('./models/user');
const { checkAuthStatus } = require('./middlewares/auth');


const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const allowCors = require('./middlewares/cors');
const helmetMiddleware = require('./middlewares/helmet');
const { morganLogger, devLogger } = require('./middlewares/morgan');

const app = express();


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const PORT = process.env.PORT || 8080;


app.use(cookieParser());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(express.static(path.join(__dirname, 'public')));
app.use(allowCors);
app.use(helmetMiddleware);
app.use(morganLogger);
app.use(devLogger);
app.use(checkAuthStatus); 

async function startServer() {
  try {

    
    await sequelize.authenticate();
    console.log('MySQL connected successfully');

    
    await sequelize.sync({ alter: true }); 
    console.log('Models synced');

    
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await User.create({
        name: 'System Admin',
        username: 'admin',
        email: 'admin@medlink.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Default admin user created: username: admin, password: Admin@123');
    }
    
    app.use('/api/users', require('./routes/userRoutes'));
    app.use('/api/doctors', require('./routes/doctorRoutes'));
    app.use('/api/admin', require('./routes/adminRoutes'));
    app.use('/', require('./routes/pageRoutes'));

    
    app.use((req, res) => res.status(404).send('Page Not Found'));
    app.use(errorHandler);

   
    const server = app.listen(PORT, () => {
      console.log(`Server: http://localhost:${PORT}`);
    });

    
    process.on('SIGINT', async () => {
      await sequelize.close();
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

startServer();
