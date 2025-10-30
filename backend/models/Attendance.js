import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  regNo: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  class: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create compound index to ensure one attendance per student per subject per date
attendanceSchema.index({ regNo: 1, subject: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
