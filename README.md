# University QR Code Attendance System

A full-stack MERN application that allows teachers to generate QR codes for attendance tracking and students to mark their attendance by scanning QR codes.

## 🎯 Features

### Teacher Features
- Login with registration ID and password
- Generate QR codes for specific subjects and classes
- View live attendance updates in real-time
- Track which students have marked attendance

### Student Features
- Login with registration number (regNo as password)
- Scan QR codes to mark attendance
- View subject-wise attendance percentage
- Real-time attendance statistics

## 🛠️ Tech Stack

**Frontend:**
- React.js (with Vite)
- TailwindCSS
- React Router DOM
- Axios
- html5-qrcode (for QR scanning)

**Backend:**
- Node.js
- Express.js
- MongoDB Atlas
- JWT Authentication
- bcryptjs
- qrcode (for QR generation)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
cd university-qr-attendance
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
```

**To get your MongoDB Atlas connection string:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password

### 3. Seed the Database

```bash
npm run seed
```

This will create sample teachers and students:

**Teachers:**
- RegNo: `T001`, `T002`, `T003`
- Password: `teacher123`

**Students:**
- RegNo: `S101`, `S102`, `S103`, `S104`, `S105`, `S106`
- Password: Same as registration number (e.g., `S101`)

### 4. Start Backend Server

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 5. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 6. Start Frontend Development Server

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📱 Usage

### For Teachers:

1. Login with:
   - Registration Number: `T001`
   - Password: `teacher123`
   - Role: Teacher

2. Select a class and subject
3. Click "Generate QR Code"
4. Students can now scan the QR code
5. View live attendance updates

### For Students:

1. Login with:
   - Registration Number: `S101` (or any student ID)
   - Password: `S101` (same as registration number)
   - Role: Student

2. Click "Scan QR Code"
3. Allow camera permissions
4. Scan the teacher's QR code
5. Attendance will be marked automatically
6. View your attendance summary

## 📊 Database Collections

### Teachers Collection
```javascript
{
  regNo: "T001",
  name: "John Smith",
  password: "hashed_password",
  subjects: ["DBMS", "Operating Systems"],
  classes: ["CSE-A", "CSE-B"]
}
```

### Students Collection
```javascript
{
  regNo: "S101",
  name: "Meghasyam",
  password: "S101",
  class: "CSE-A",
  subjects: ["DBMS", "OOPS", "Operating Systems", "Data Structures"]
}
```

### Attendance Collection
```javascript
{
  regNo: "S101",
  subject: "DBMS",
  class: "CSE-A",
  date: "2025-10-30",
  time: "10:15 AM"
}
```

## 🔐 Security Features

- JWT-based authentication
- Teacher passwords are hashed with bcryptjs
- Protected API routes
- Student passwords are not hashed (regNo = password)
- One attendance entry per student per subject per day

## 🌐 Deployment

### Backend (Render)
1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables (MONGO_URI, JWT_SECRET, PORT)

### Frontend (Vercel/Netlify)
1. Create a new project on [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
2. Set root directory: `frontend`
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_URL=your_backend_url/api`

### Database
- Use MongoDB Atlas (already configured)
- Make sure to whitelist all IPs (0.0.0.0/0) for production

## 🔧 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/login` | Login for both students and teachers |
| POST | `/api/attendance/generate-qr` | Teacher generates QR code |
| POST | `/api/attendance` | Student marks attendance |
| GET | `/api/attendance/:regNo` | Get student attendance summary |
| GET | `/api/attendance/class/:subject` | Get class attendance list |

## 📝 Notes

- Students can only mark attendance once per subject per day
- QR codes contain subject, class, and date information
- Teacher dashboard auto-refreshes attendance list every 5 seconds
- Camera permissions are required for QR scanning

## 🐛 Troubleshooting

**Camera not working:**
- Ensure HTTPS is enabled (required for camera access)
- Check browser permissions
- Try a different browser

**Database connection error:**
- Verify MongoDB Atlas connection string
- Check if IP is whitelisted
- Ensure database user has correct permissions

**QR code not scanning:**
- Ensure good lighting
- Hold QR code steady
- Try adjusting distance from camera

## 📄 License

ISC

## 👨‍💻 Author

Built with ❤️ using MERN Stack
