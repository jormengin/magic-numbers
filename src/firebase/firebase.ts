// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhp_-7Z4Sk7ISwfXgfKGr7rpeuCOePyCI",
  authDomain: "magic-numbers-d64dc.firebaseapp.com",
  projectId: "magic-numbers-d64dc",
  storageBucket: "magic-numbers-d64dc.appspot.com",
  messagingSenderId: "808908650984",
  appId: "1:808908650984:web:ff7a1b23aabc2006488c5d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log(app);
const db = getFirestore(app);
console.log(db);

export { db };