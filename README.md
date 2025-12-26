# Logistics Pro - Transport & Logistics Management System

A modern, fully functional web application for managing and tracking shipments in a logistics and transport company.

## Features

### Frontend (React.js + SCSS)
- **Landing Page / Dashboard** - Overview with statistics and quick actions
- **Admin Panel** - Manage shipments, users, and vehicles
- **Shipment Management** - Full CRUD operations (Create, Read, Update, Delete)
- **Shipment Status Tracking** - Track shipments through: Received → In Transit → Delivered
- **Responsive Design** - Optimized for both desktop and mobile devices
- **Modern UI** - Professional, clean design with proper color scheme and layouts

### Backend (Node.js + Express)
- **REST API** - Complete API endpoints for all operations
- **Authentication** - JWT-based login system
- **JSON Storage** - Simple file-based data storage
- **CORS Enabled** - Ready for frontend integration

### Admin Panel Features
- **Login Authentication** - Secure login with JWT tokens
- **Shipment CRUD** - Create, view, edit, and delete shipments
- **Dashboard Statistics** - Real-time summary of:
  - Total shipments
  - Received shipments
  - In transit shipments
  - Delivered shipments
- **User Management** - View system users
- **Vehicle Management** - Track fleet vehicles

## Project Structure

```
logistik/
├── backend/
│   ├── server.js          # Express server and API routes
│   ├── package.json        # Backend dependencies
│   └── data/               # JSON data files (auto-created)
│       ├── shipments.json
│       ├── users.json
│       └── vehicles.json
│
└── src/                    # Frontend React application
    ├── components/
    │   ├── Dashboard/      # Dashboard component
    │   ├── Layout/         # Main layout with sidebar
    │   ├── Login/          # Login component
    │   ├── Shipments/      # Shipment list and form
    │   ├── Users/          # Users management
    │   └── Vehicles/       # Vehicles management
    ├── styles/             # SCSS modules
    │   ├── _variables.scss # Color and spacing variables
    │   ├── _mixins.scss    # Reusable mixins
    │   └── _base.scss      # Base styles
    ├── App.jsx             # Main app with routing
    └── main.jsx            # Entry point
```

## Installation

1. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

## Running the Application

### Development Mode

1. **Start the Backend Server** (Terminal 1)
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:3001`

2. **Start the Frontend Development Server** (Terminal 2)
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` (or the port Vite assigns)

### Production Mode

1. **Build the Frontend**
   ```bash
   npm run build
   ```

2. **Start the Backend**
   ```bash
   cd backend
   npm start
   ```

## Default Login Credentials

- **Username:** `admin`
- **Password:** `admin123`

## API Endpoints

### Authentication
- `POST /api/login` - Login and get JWT token

### Shipments
- `GET /api/shipments` - Get all shipments
- `GET /api/shipments/:id` - Get single shipment
- `POST /api/shipments` - Create new shipment
- `PUT /api/shipments/:id` - Update shipment
- `DELETE /api/shipments/:id` - Delete shipment

### Users
- `GET /api/users` - Get all users

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Create new vehicle

### Statistics
- `GET /api/stats` - Get dashboard statistics

**Note:** All endpoints (except `/api/login`) require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Technologies Used

### Frontend
- React 19
- React Router DOM
- SCSS (Sass)
- Vite

### Backend
- Node.js
- Express.js
- JWT (jsonwebtoken)
- bcryptjs
- CORS

## Design Features

- **Color Scheme:** Professional blue theme with proper contrast
- **Responsive Layout:** Mobile-first design with breakpoints
- **Modern UI Elements:**
  - Card-based layouts
  - Status badges with color coding
  - Interactive buttons and forms
  - Sidebar navigation
  - Statistics dashboard
- **User Experience:**
  - Loading states
  - Error handling
  - Form validation
  - Confirmation dialogs

## Data Storage

The application uses JSON files for data storage located in `backend/data/`:
- `shipments.json` - All shipment records
- `users.json` - User accounts
- `vehicles.json` - Vehicle fleet information

These files are automatically created when the server starts for the first time.

## Development Notes

- The backend server must be running for the frontend to work properly
- JWT tokens are stored in localStorage
- All API requests include authentication headers automatically
- The application uses modern ES6+ syntax with modules

## License

This project is created for educational and commercial use.
