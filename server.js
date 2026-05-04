const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const Doctor = require('./models/doctor');
const { checkAuthStatus } = require('./middlewares/auth');
const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
const PORT = 8080;

const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const allowCors = require('./middlewares/cors');
const helmetMiddleware = require('./middlewares/helmet');
const compression = require('compression');
const { morganLogger, devLogger } = require('./middlewares/morgan');
const cookieParser = require('cookie-parser');

const pageRoutes = require('./routes/pageRoutes');
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Medlink-Management';
mongoose.connect(mongoURI)
  .then(async () => {
    console.log('MongoDB connected successfully');
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      const admin = new User({
        name: 'Admin',
        username: 'admin',
        email: 'admin@medlink.com',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('Default admin user created: username: admin, password: admin123');
    }

    const doctorExists = await Doctor.findOne({ username: 'doctor1' });
    if (!doctorExists) {
      const hashedPassword = await bcrypt.hash('doctor123', 10);
      const testDoctor = new Doctor({
        name: 'Dr. John Doe',
        username: 'doctor1',
        email: 'doctor1@medlink.com',
        password: hashedPassword,
        field: 'general',
        qualification: 'MBBS',
        experience: '5 years',
        location: 'New York',
        phone: '1234567890',
        hospital: 'City Hospital',
        fees: 100,
        img: 'default.jpg',
        availability: 'Available'
      });
      await testDoctor.save();
      console.log('Test doctor created: username: doctor1, password: doctor123');
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));

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

app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/admin', adminRoutes);

app.use('/', pageRoutes);

app.use((req, res, next) => {
  res.status(404).send('Page Not Found');
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
