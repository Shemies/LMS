import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, query, orderByChild, equalTo, update, remove, set, push, off } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC9eb2Jf3u9jmtjBuHNYJUcaKYc3AphEQY",
    authDomain: "auth-development-b37a4.firebaseapp.com",
    projectId: "auth-development-b37a4",
    storageBucket: "auth-development-b37a4.firebasestorage.app",
    messagingSenderId: "549347582145",
    appId: "1:549347582145:web:3f41832a5917905222f440"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth, ref, onValue, query, orderByChild, equalTo, update, remove, set, push, off };
