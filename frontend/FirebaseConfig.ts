// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
    initializeAuth,
    getReactNativePersistence,
    signInAnonymously,
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDFqxs4KoR6DNmgz867w5XlD9Sd0Fy47lA",
    authDomain: "twmj-8be22.firebaseapp.com",
    projectId: "twmj-8be22",
    storageBucket: "twmj-8be22.firebasestorage.app",
    messagingSenderId: "956878130756",
    appId: "1:956878130756:web:0dc264b003aa214b2bb611",
    databaseURL:
        "https://twmj-8be22-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const database = getDatabase(app);

// Automatically sign in anonymously
signInAnonymously(auth).catch((error) => {
    console.error("Anonymous auth error:", error);
});

export default app;
