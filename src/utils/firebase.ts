// see: https://invertase.io/blog/firebase-with-gatsby

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';
import 'firebase/messaging';

// Firebase web config
// https://firebase.google.com/docs/projects/api-keys
const config = {
  apiKey: 'AIzaSyAFOEyDf4_b8OGgBI4FGZZ_bDBn0jYFLHQ',
  authDomain: 'manonetv2.firebaseapp.com',
  databaseURL: 'https://manonet-7f714.firebaseio.com',
  projectId: 'manonetv2',
  storageBucket: 'manonetv2.firebasestorage.app',
  messagingSenderId: '1076461817961',
  appId: '1:1076461817961:web:7498a4ca81560bc8aed2f8',
  measurementId: 'G-8V5E21V4NJ',
};

let instance: any = null;

export default function getFirebase() {
  if (typeof window !== 'undefined') {
    if (instance) return instance;
    instance = firebase.initializeApp(config);
    return instance;
  }

  return null;
}
