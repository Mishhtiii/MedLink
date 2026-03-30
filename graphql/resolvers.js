const User = require('../models/user');
const Doctor = require('../models/doctor');
const Appointment = require('../models/appointment');
const DoctorSlot = require('../models/doctorSlot');

const resolvers = {
  Query: {
    doctors: async () => {
      return await Doctor.findAll();
    },
    doctor: async (_, { id }) => {
      return await Doctor.findByPk(id);
    },
    appointments: async (_, { userId }) => {
      return await Appointment.findAll({
        where: { userId },
        include: [Doctor]
      });
    }
  },
  Mutation: {
    createAppointment: async (_, { doctorId, date, time }) => {
      const slot = await DoctorSlot.findOne({
        where: {
          doctorId,
          date: new Date(date),
          time,
          available: true
        }
      });

      if (!slot) {
        throw new Error('Slot not available');
      }

      const appointment = await Appointment.create({
        userId: 1, // TODO: get from context
        doctorId,
        date: new Date(date),
        time,
        status: 'pending'
      });

      slot.available = false;
      await slot.save();

      return appointment;
    }
  }
};

module.exports = resolvers;

