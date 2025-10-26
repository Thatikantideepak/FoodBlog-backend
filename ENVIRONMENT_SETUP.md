# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
CONNECTION_STRING=mongodb+srv://thatikantideepak934_db_user:deepak@cluster0.k4ewqe4.mongodb.net/foodrecipe

# JWT Secret Key (Change this to a secure random string in production)
SECRET_KEY=your_super_secret_jwt_key_here_change_in_production

# Server Port
PORT=4000
```

## Setup Instructions

1. Copy the above content to a new file named `.env` in the backend directory
2. Replace `your_super_secret_jwt_key_here_change_in_production` with a secure random string
3. Update the `CONNECTION_STRING` if your MongoDB is running on a different host/port
4. The backend will run on port 4000 by default (matching frontend expectations)
