# The Room - Admin Panel

A simple web interface for adding rooms to your Firebase backend for "The Room" app.

## 🚀 Features

- **Easy Room Creation**: Simple form interface for adding new rooms
- **Location Helper**: Search for addresses and get GPS coordinates automatically  
- **Image Management**: Add multiple image URLs for each room
- **Real-time Preview**: See recently added rooms instantly
- **Responsive Design**: Works on desktop and mobile devices
- **Firebase Integration**: Direct connection to your Firestore database

## 📋 Prerequisites

- A Firebase project (you already have "the-room-92cdd")
- Firebase Firestore database enabled
- Web browser with JavaScript enabled

## 🔧 Setup Instructions

### 1. Get Your Firebase Configuration

1. Go to your [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`the-room-92cdd`)
3. Click the gear icon ⚙️ → **Project Settings**
4. Scroll down to **Your apps** section
5. Click **Web app** (or add a new web app if needed)
6. Copy the configuration object

### 2. Configure the Admin Panel

1. Open `firebase-config.js`
2. Replace the placeholder config with your actual Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "the-room-92cdd.firebaseapp.com",
    projectId: "the-room-92cdd", 
    storageBucket: "the-room-92cdd.appspot.com",
    messagingSenderId: "your-actual-sender-id",
    appId: "your-actual-app-id"
};
```

### 3. Set Up Firebase Security Rules

Make sure your Firestore security rules allow writing to the `rooms` collection. You can set temporary open rules for testing:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{document} {
      allow read, write: if true; // Temporary - secure this later!
    }
  }
}
```

### 4. Run the Admin Panel

Simply open `index.html` in your web browser. For best results, serve it through a local web server:

**Option A: Using Python (if installed)**
```bash
# Python 3
python -m http.server 8000

# Python 2  
python -m SimpleHTTPServer 8000
```

**Option B: Using Node.js (if installed)**
```bash
npx http-server .
```

**Option C: Just double-click**
Open `index.html` directly in your browser (may have CORS limitations)

## 🏠 How to Add Rooms

### 1. Basic Information
- **Room Title**: Enter a descriptive name (e.g., "Coffee Shop Downtown")
- **Description**: Add details about the room

### 2. Location
- **Manual Entry**: Enter latitude and longitude directly
- **Address Search**: Use the Location Helper to search for an address and automatically fill coordinates

### 3. Images
- Add image URLs (must be publicly accessible)
- Click "Add Another Image" for multiple images (max 5)
- Images should be hosted on services like:
  - Firebase Storage
  - AWS S3
  - Cloudinary
  - Any public image hosting service

### 4. Submit
- Click "Add Room" to save to your Firebase database
- The room will appear in your app immediately!

## 📱 Room Data Structure

The rooms are stored in Firestore with this structure:

```javascript
{
  title: "Room Name",
  description: "Room description", 
  location: GeoPoint(latitude, longitude),
  images: ["url1", "url2", "url3"],
  createdAt: Timestamp,
  status: "active"
}
```

## 🛠️ Troubleshooting

### Firebase Connection Issues
- Check that your `firebase-config.js` has the correct configuration
- Verify your Firebase project is active
- Check browser console for error messages

### Location Search Not Working
- The location search uses OpenStreetMap's free geocoding service
- If it's slow, try being more specific with addresses
- You can always enter coordinates manually

### Images Not Showing in App
- Make sure image URLs are publicly accessible
- Test URLs by opening them directly in a browser
- Use HTTPS URLs when possible

### Firestore Permission Errors
- Check your Firestore security rules
- Make sure write access is allowed for the `rooms` collection

## 🔒 Security Considerations

**Important**: This admin panel has no authentication! For production use:

1. **Add Authentication**: Implement Firebase Auth login
2. **Secure Firestore Rules**: Restrict write access to authenticated admins only
3. **Use HTTPS**: Host on a secure domain
4. **IP Restrictions**: Limit access to specific IP addresses if needed

Example secure Firestore rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
                   request.auth.token.email in ['admin@yourapp.com'];
    }
  }
}
```

## 📊 Monitoring

- Check Firebase Console → Firestore → Data to see added rooms
- Use Firebase Console → Usage to monitor API calls
- Browser Developer Tools → Console shows debug information

## 🆘 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify Firebase configuration is correct
3. Test Firebase connection in the console
4. Make sure Firestore rules allow write access

## 📄 Files Structure

```
room-admin/
├── index.html          # Main admin interface
├── styles.css          # Styling and layout
├── firebase-config.js  # Firebase configuration
├── script.js           # Main functionality
└── README.md          # This file
```

---

**Happy room adding!** 🏠✨ 