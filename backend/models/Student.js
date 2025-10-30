import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  regNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  subjects: [{
    type: String,
    required: true
  }]
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
