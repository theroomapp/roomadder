// Firebase Configuration
// Updated with actual the-room-92cdd project configuration

const firebaseConfig = {
    apiKey: "AIzaSyA5iKV9GHcpyrReR03yAlgcDW9bhF3OBJE",
    authDomain: "the-room-92cdd.firebaseapp.com",
    projectId: "the-room-92cdd",
    storageBucket: "the-room-92cdd.firebasestorage.app",
    messagingSenderId: "219245207355",
    appId: "1:219245207355:web:957456f02a3aa4f0d8e11e",
    measurementId: "G-480KVJ5B8E"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const db = firebase.firestore();
const storage = firebase.storage();

console.log('🔥 Firebase initialized with project:', firebaseConfig.projectId);

// Your config should look something like this:
/*
const firebaseConfig = {
    apiKey: "AIzaSyC...",
    authDomain: "the-room-92cdd.firebaseapp.com", 
    projectId: "the-room-92cdd",
    storageBucket: "the-room-92cdd.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456789"
};
*/ 