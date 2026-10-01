// Admin sahifalarini himoya qiladi: kirmagan yoki admin bo'lmagan foydalanuvchi index.html (login) ga qaytariladi.
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA2G8cD0JezEKXRCtKLYiZL0bzDyTp06Vs",
    authDomain: "quiz-app-3692d.firebaseapp.com",
    projectId: "quiz-app-3692d",
    storageBucket: "quiz-app-3692d.firebasestorage.app",
    messagingSenderId: "526836020845",
    appId: "1:526836020845:android:3ea991380c104c75e8b164"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    let ok = false;
    if (user) {
        try { ok = (await getDoc(doc(db, "admins", user.uid))).exists(); } catch (e) { ok = false; }
    }
    if (!ok) { location.replace("index.html"); return; }
    const hide = document.getElementById("guard-hide");
    if (hide) hide.remove();
});
