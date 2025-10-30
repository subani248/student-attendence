import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';

// Generate JWT Token
const generateToken = (id, role, regNo) => {
  return jwt.sign({ id, role, regNo }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Login user (Teacher or Student)
// @route   POST /api/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { regNo, password, role } = req.body;

    if (!regNo || !password || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide registration number, password, and role' 
      });
    }

    let user;
    let isPasswordValid = false;

    if (role === 'teacher') {
      // Find teacher
      user = await Teacher.findOne({ regNo });
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // Verify password (hashed for teachers)
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else if (role === 'student') {
      // Find student
      user = await Student.findOne({ regNo });
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // For students, regNo = password (not hashed)
      isPasswordValid = password === user.password;
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role. Must be teacher or student' 
      });
    }

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken(user._id, role, user.regNo);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        role,
        regNo: user.regNo,
        name: user.name,
        subjects: user.subjects,
        ...(role === 'student' && { class: user.class }),
        ...(role === 'teacher' && { classes: user.classes })
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};
