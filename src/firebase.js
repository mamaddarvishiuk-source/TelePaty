import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAN3uIHAIUGw_ScHXn3tyNNR5Ze-ojRk1w",
  authDomain: "telepaty-93b78.firebaseapp.com",
  projectId: "telepaty-93b78",
  storageBucket: "telepaty-93b78.firebasestorage.app",
  messagingSenderId: "50020997970",
  appId: "1:50020997970:web:db90c2b64856bc5d3df88b",
  measurementId: "G-36FDPNL9N9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
