import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../utils/api';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState({});
  const [showScanner, setShowScanner] = useState(false);
  const [scanner, setScanner] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/');
    } else {
      fetchAttendance();
    }
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

  const fetchAttendance = async () => {
    try {
      const response = await api.get(`/attendance/${user?.regNo}`);
      if (response.data.success) {
        setAttendance(response.data.data.attendance);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
    setLoading(false);
  };

  const startScanner = () => {
    setShowScanner(true);
    setMessage({ type: '', text: '' });

    setTimeout(() => {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      html5QrcodeScanner.render(onScanSuccess, onScanError);
      setScanner(html5QrcodeScanner);
    }, 100);
  };

  const onScanSuccess = async (decodedText) => {
    try {
      // Parse QR code data
      const qrData = JSON.parse(decodedText);

      // Stop scanner
      if (scanner) {
        scanner.clear();
        setScanner(null);
      }
      setShowScanner(false);

      // Send attendance data to backend
      const response = await api.post('/attendance', {
        regNo: user.regNo,
        subject: qrData.subject,
        className: qrData.class,
        date: qrData.date,
      });

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: '✅ Attendance marked successfully!',
        });
        // Refresh attendance data
        fetchAttendance();
      }
    } catch (error) {
      if (scanner) {
        scanner.clear();
        setScanner(null);
      }
      setShowScanner(false);

      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to mark attendance',
      });
    }
  };

  const onScanError = (error) => {
    // Ignore scan errors (they happen frequently while scanning)
    // console.warn(error);
  };

  const stopScanner = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setShowScanner(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600">
                {user?.name} - {user?.regNo}
              </p>
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
        {/* Mark Attendance Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Mark Attendance
          </h2>

          {!showScanner ? (
            <div className="text-center">
              <button
                onClick={startScanner}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                📷 Scan QR Code
              </button>
            </div>
          ) : (
            <div>
              <div id="qr-reader" className="mx-auto max-w-md"></div>
              <div className="text-center mt-4">
                <button
                  onClick={stopScanner}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Message Display */}
          {message.text && (
            <div
              className={`mt-4 px-4 py-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-100 border border-green-400 text-green-700'
                  : 'bg-red-100 border border-red-400 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Note */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> For any attendance issues or verification, please
              contact your class coordinator or teacher.
            </p>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Attendance Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user?.subjects?.map((subject) => {
              const subjectAttendance = attendance[subject] || {
                attended: 0,
                totalClasses: 0,
                percentage: 0,
              };

              const percentage = subjectAttendance.percentage || 0;
              const color =
                percentage >= 75
                  ? 'green'
                  : percentage >= 60
                  ? 'yellow'
                  : 'red';

              return (
                <div
                  key={subject}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {subject}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Classes Attended:</span>
                      <span className="font-semibold text-gray-800">
                        {subjectAttendance.attended}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Classes:</span>
                      <span className="font-semibold text-gray-800">
                        {subjectAttendance.totalClasses}
                      </span>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Percentage:</span>
                        <span
                          className={`text-2xl font-bold ${
                            color === 'green'
                              ? 'text-green-600'
                              : color === 'yellow'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}
                        >
                          {percentage.toFixed(2)}%
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            color === 'green'
                              ? 'bg-green-600'
                              : color === 'yellow'
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {user?.subjects?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No subjects enrolled
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
