// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import axios from 'axios';
import { useEffect } from 'react';
import { router } from 'expo-router';

const firebaseConfig = {
  apiKey: "AIzaSyDEXWXgE_Rx44YPhlnH7fIHMfHwmQsRQhI",
  authDomain: "spygame-2fce3.firebaseapp.com",
  projectId: "spygame-2fce3",
  storageBucket: "spygame-2fce3.appspot.com",
  messagingSenderId: "841856303776",
  appId: "1:841856303776:web:b580fb85f1e3e34c573fc5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const name = result.user.displayName;
      const email = result.user.email;
      const profilePic = result.user.photoURL;

      console.log(email);

      axios
      .post('https://auth.blobsandtrees.online/login-with-google', {'email': email, 'name': name,})
      .then((data) => {
        console.log(data);
        router.push('/GameLobby');
      })
      .catch((error) => {
        console.log(error);
        // Handle error response
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

export const db = getFirestore(app);