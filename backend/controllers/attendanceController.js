import QRCode from 'qrcode';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';

// @desc    Generate QR Code for attendance
// @route   POST /api/generate-qr
// @access  Private (Teacher only)
export const generateQR = async (req, res) => {
  try {
    const { subject, className } = req.body;

    if (!subject || !className) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide subject and class name' 
      });
    }

    // Get current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];

    const qrData = {
      subject,
      class: className,
      date: currentDate
    };

    // Generate QR code as base64 image
    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));

    res.status(200).json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        qrCode: qrCodeImage,
        qrData
      }
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating QR code' 
    });
  }
};

// @desc    Mark attendance by scanning QR code
// @route   POST /api/attendance
// @access  Private (Student only)
export const markAttendance = async (req, res) => {
  try {
    const { regNo, subject, className, date } = req.body;

    if (!regNo || !subject || !className || !date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Verify student exists
    const student = await Student.findOne({ regNo });
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Check if student is enrolled in this subject
    if (!student.subjects.includes(subject)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not enrolled in this subject' 
      });
    }

    // Check if attendance already marked for this date
    const existingAttendance = await Attendance.findOne({ 
      regNo, 
      subject, 
      date 
    });

    if (existingAttendance) {
      return res.status(400).json({ 
        success: false, 
        message: 'Attendance already marked for this subject today' 
      });
    }

    // Get current time in HH:MM AM/PM format
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    // Create attendance record
    const attendance = await Attendance.create({
      regNo,
      subject,
      class: className,
      date,
      time: currentTime
    });

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error marking attendance' 
    });
  }
};

// @desc    Get attendance summary for a student
// @route   GET /api/attendance/:regNo
// @access  Private (Student only)
export const getStudentAttendance = async (req, res) => {
  try {
    const { regNo } = req.params;

    // Get student info
    const student = await Student.findOne({ regNo });
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Get all attendance records for this student
    const attendanceRecords = await Attendance.find({ regNo });

    // Calculate subject-wise attendance
    const attendanceSummary = {};

    for (const subject of student.subjects) {
      const attended = attendanceRecords.filter(record => record.subject === subject).length;
      
      // Get total classes for this subject (count unique dates)
      const allSubjectAttendance = await Attendance.distinct('date', { subject });
      const totalClasses = allSubjectAttendance.length || 1; // Avoid division by zero

      const percentage = ((attended / totalClasses) * 100).toFixed(2);

      attendanceSummary[subject] = {
        attended,
        totalClasses,
        percentage: parseFloat(percentage)
      };
    }

    res.status(200).json({
      success: true,
      data: {
        regNo: student.regNo,
        name: student.name,
        class: student.class,
        subjects: student.subjects,
        attendance: attendanceSummary
      }
    });
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching attendance data' 
    });
  }
};

// @desc    Get list of students who marked attendance for a subject
// @route   GET /api/attendance/class/:subject
// @access  Private (Teacher only)
export const getClassAttendance = async (req, res) => {
  try {
    const { subject } = req.params;
    const { date, className } = req.query;

    if (!date || !className) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide date and class name' 
      });
    }

    // Get attendance records for this subject, class, and date
    const attendanceRecords = await Attendance.find({ 
      subject, 
      class: className,
      date 
    }).sort({ time: 1 });

    // Get student details for each attendance record
    const studentsWithAttendance = await Promise.all(
      attendanceRecords.map(async (record) => {
        const student = await Student.findOne({ regNo: record.regNo });
        return {
          regNo: record.regNo,
          name: student?.name || 'Unknown',
          time: record.time
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        subject,
        class: className,
        date,
        totalPresent: studentsWithAttendance.length,
        students: studentsWithAttendance
      }
    });
  } catch (error) {
    console.error('Get class attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching class attendance' 
    });
  }
};
