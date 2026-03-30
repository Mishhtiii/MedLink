const User = require('./user');
const Doctor = require('./doctor');
const Appointment = require('./appointment');
const DoctorSlot = require('./doctorSlot');

// Define Relationships
User.hasMany(Appointment, { foreignKey: 'userId' });
Appointment.belongsTo(User, { foreignKey: 'userId' });

Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });

Doctor.hasMany(DoctorSlot, { foreignKey: 'doctorId' });
DoctorSlot.belongsTo(Doctor, { foreignKey: 'doctorId' });

module.exports = { User, Doctor, Appointment, DoctorSlot };