import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
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
  subjects: [{
    type: String,
    required: true
  }],
  classes: [{
    type: String,
    required: true
  }]
}, {
  timestamps: true
});

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;
