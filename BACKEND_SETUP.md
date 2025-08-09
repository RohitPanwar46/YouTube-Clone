# Backend API Setup

## Environment Configuration

To connect your frontend to your backend API, you need to set the backend URL in your environment variables.

### Option 1: Create a .env.local file (Recommended)

Create a `.env.local` file in your project root with:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Replace `http://localhost:8000` with your actual backend URL.

### Option 2: Update the API configuration directly

If you prefer not to use environment variables, you can update the backend URL directly in `app/lib/api.js`:

```javascript
export const BACKEND_URL = 'http://your-backend-url.com';
```

## API Endpoints

The frontend is configured to use these endpoints:

- **Login**: `POST /api/v1/users/login`
  - Body: `{ usernameOrEmail, password }`
  
- **Register**: `POST /api/v1/users/register`
  - Body: FormData with fields: `email`, `password`, `fullname`, `username`, `avatar` (optional), `coverImage` (optional)

## Features

- ✅ User registration with file uploads (avatar, cover image)
- ✅ User login with username/email and password
- ✅ Form validation (client-side)
- ✅ Error handling and user feedback
- ✅ Automatic navigation after successful actions
- ✅ Token and user data storage in localStorage
- ✅ Responsive design matching YouTube's dark theme

## Testing

1. Start your backend server
2. Set the correct backend URL
3. Run `npm run dev` to start the frontend
4. Navigate to `/register` to create an account
5. Navigate to `/login` to sign in

## Notes

- The frontend expects the backend to return a JSON response
- For successful responses, the backend should return `{ token, user }` for login
- For errors, the backend should return `{ message: "error description" }`
- File uploads use FormData for multipart/form-data requests
