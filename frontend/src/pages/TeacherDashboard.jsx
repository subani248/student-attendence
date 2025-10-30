import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [qrData, setQrData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Auto-refresh student list every 5 seconds when QR is active
    let interval;
    if (qrData) {
      interval = setInterval(() => {
        fetchAttendance();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [qrData]);

  const handleGenerateQR = async () => {
    if (!selectedClass || !selectedSubject) {
      setError('Please select both class and subject');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/attendance/generate-qr', {
        subject: selectedSubject,
        className: selectedClass,
      });

      if (response.data.success) {
        setQrCode(response.data.data.qrCode);
        setQrData(response.data.data.qrData);
        fetchAttendance();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate QR code');
    }

    setLoading(false);
  };

  const handleStopQR = () => {
    setQrCode('');
    setQrData(null);
    setStudents([]);
    setSelectedClass('');
    setSelectedSubject('');
  };

  const fetchAttendance = async () => {
    if (!qrData) return;

    try {
      const response = await api.get(`/attendance/class/${qrData.subject}`, {
        params: {
          date: qrData.date,
          className: qrData.class,
        },
      });

      if (response.data.success) {
        setStudents(response.data.data.students);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - QR Generation */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Generate Attendance QR Code
            </h2>

            <div className="space-y-4">
              {/* Class Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">-- Choose Class --</option>
                  {user?.classes?.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">-- Choose Subject --</option>
                  {user?.subjects?.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateQR}
                disabled={loading || !selectedClass || !selectedSubject}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate QR Code'}
              </button>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            {/* QR Code Display */}
            {qrCode && (
              <div className="mt-6 text-center">
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-blue-500">
                  <img
                    src={qrCode}
                    alt="Attendance QR Code"
                    className="mx-auto mb-4"
                  />
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold">
                      {qrData?.subject} - {qrData?.class}
                    </p>
                    <p>{qrData?.date}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Students can scan this QR code to mark attendance
                </p>
                <button
                  onClick={handleStopQR}
                  className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  Stop QR Session
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Live Attendance */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Live Attendance
            </h2>

            {qrData ? (
              <div>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Subject:</span> {qrData.subject}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Class:</span> {qrData.class}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Date:</span> {qrData.date}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-semibold">Total Present:</span>{' '}
                    <span className="text-green-600 text-lg">{students.length}</span>
                  </p>
                </div>

                {students.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reg No
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.regNo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.time}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No students have marked attendance yet</p>
                    <p className="text-sm mt-2">List updates automatically every 5 seconds</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Generate a QR code to view live attendance</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
