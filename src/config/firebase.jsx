// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { createClient } from '@supabase/supabase-js'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyADFTF7mL1ikrN9cVtOR_c8olJBfk7toSg",
    authDomain: "lostandfound-3e2fa.firebaseapp.com",
    projectId: "lostandfound-3e2fa",
    storageBucket: "lostandfound-3e2fa.appspot.com",
    messagingSenderId: "318273901587",
    appId: "1:318273901587:web:16d059539787864b169be6"
  };

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

const supabaseUrl = 'https://mxqzohhojkveomcyfxuv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14cXpvaGhvamt2ZW9tY3lmeHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwMDM4MDMsImV4cCI6MjA0NDU3OTgwM30.hVZUxMf-LINa4lLEst63cHnW5yBBps78QAtI0kWm73k'
const supabase = createClient(supabaseUrl, supabaseKey)
 export { auth, storage, db, supabase };
