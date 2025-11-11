# Nishree E-commerce Platform

A modern e-commerce platform built with React and Node.js, featuring a robust frontend and backend architecture.

## 🚀 Tech Stack

### Frontend
- React 19
- Vite
- React Router DOM
- React Icons
- Axios
- React Toastify
- Swiper
- React Google Login

### Backend
- Node.js
- Express.js
- MySQL (with Sequelize ORM)
- JWT Authentication
- Passport.js (Google OAuth)
- Multer (File Upload)
- Nodemailer
- Sharp (Image Processing)

## 📁 Project Structure

```
├── Frontend/
│   ├── src/           # Source files
│   ├── public/        # Static files
│   ├── package.json   # Frontend dependencies
│   └── vite.config.js # Vite configuration
│
└── Backend/
    ├── config/        # Configuration files
    ├── controller/    # Route controllers
    ├── middleware/    # Custom middleware
    ├── model/         # Database models
    ├── routes/        # API routes
    ├── services/      # Business logic
    ├── utils/         # Utility functions
    ├── uploads/       # File uploads
    └── index.js       # Entry point
```

## 🛠️ Setup Instructions

### Frontend Setup
1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (create .env file)
4. Initialize database:
   ```bash
   npm run db:setup
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

## 🔑 Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=nishree_db
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 📝 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run db:setup` - Initialize database
- `npm run lint` - Run ESLint

## 👥 Author

- **Riya Lunagariya**
- Email: info@illusiodesigns.agency
- Website: https://www.illusiodesigns.agency

## 📄 License

This project is licensed under the ISC License.