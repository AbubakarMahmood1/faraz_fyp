import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyAXl-_J70GAi--d9N5cIgSSz9WIN6MPPc4",
  authDomain: "webprojectimages-4ad07.firebaseapp.com",
  projectId: "webprojectimages-4ad07",
  storageBucket: "webprojectimages-4ad07.appspot.com",
  messagingSenderId: "943038822909",
  appId: "1:943038822909:web:beabcbc98f57f24d7a4194",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const fireBaseDB = getStorage(app);
