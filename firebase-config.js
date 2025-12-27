// Firebase configuration
/*
const firebaseConfig = {
    apiKey: "AIzaSyBoW791sZAolr1yZizsh2ASwTVUnYbid_o",
    authDomain: "account-checker-6aa7f.firebaseapp.com",
    projectId: "account-checker-6aa7f",
    storageBucket: "account-checker-6aa7f.firebasestorage.app",
    messagingSenderId: "801294791031",
    appId: "1:801294791031:web:2696780088e7929c3d3172",
    measurementId: "G-6241B9Y3WE"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database(); // Realtime Database

// Initialize Auth and set persistence



// Set auth persistence to help with tracking prevention
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        console.log("Auth persistence set to LOCAL successfully");
    })
    .catch((error) => {
        console.error("Error setting auth persistence:", error);
    });

// Make them globally available (optional)
window.auth = auth;
window.db = db;


// Add this at the bottom of firebase-config.js
const GEMINI_API_KEY = 'AIzaSyCjG8z3vbhFOM9hlqfUf2Ug7H4dGwY1sgI'; // Replace with your key
window.GEMINI_API_KEY = GEMINI_API_KEY;
*/

// firebase-config.js - UPDATED VERSION
const firebaseConfig = {
    apiKey: "AIzaSyBoW791sZAolr1yZizsh2ASwTVUnYbid_o",
    authDomain: "account-checker-6aa7f.firebaseapp.com",
    projectId: "account-checker-6aa7f",
    storageBucket: "account-checker-6aa7f.firebasestorage.app",
    messagingSenderId: "801294791031",
    appId: "1:801294791031:web:2696780088e7929c3d3172",
    measurementId: "G-6241B9Y3WE"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const db = firebase.database(); // Realtime Database
const auth = firebase.auth();   // Authentication

// Set auth persistence
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        console.log("✅ Auth persistence set to LOCAL");
    })
    .catch((error) => {
        console.error("Error setting auth persistence:", error);
    });

// Make globally available
window.db = db;
window.auth = auth;

// REMOVE the Gemini API key from here - it's a security risk!
// Move it to your HTML files instead
