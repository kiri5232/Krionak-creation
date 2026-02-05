/* ================= FIREBASE IMPORTS ================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// ====== PAGE NAVIGATION FUNCTIONS ======

window.goLogin = function () {
  show("loginPage");
};

window.goRegister = function () {
  show("registerPage");
};

window.logout = function () {
  signOut(auth);
};

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyASf9U3FPS5CAl2amNE8g4dWKbJu5HiOIY",
  authDomain: "krionak-creation.firebaseapp.com",
  projectId: "krionak-creation",
  storageBucket: "krionak-creation.firebasestorage.app",
};

/* ================= INIT ================= */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/* ================= PAGE CONTROL ================= */
const pages = ["homePage","loginPage","registerPage","notesPage"];

function show(page) {
  pages.forEach(p => document.getElementById(p).classList.add("hidden"));
  document.getElementById(page).classList.remove("hidden");
}

/* ================= AUTH ================= */
document.getElementById("loginBtn").onclick = () => {
  const email = loginEmail.value;
  const pass = loginPassword.value;

  signInWithEmailAndPassword(auth, email, pass)
    .catch(err => alert(err.message));
};

document.getElementById("registerBtn").onclick = () => {
  const email = registerEmail.value;
  const pass = registerPassword.value;

  createUserWithEmailAndPassword(auth, email, pass)
    .catch(err => alert(err.message));
};

window.logout = () => signOut(auth);

/* ================= AUTH STATE ================= */
onAuthStateChanged(auth, user => {
  if (user) {
    show("notesPage");
    loadNotes();
  } else {
    show("homePage");
  }
});

/* ================= SAVE NOTE ================= */
document.getElementById("saveNoteBtn").onclick = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const text = noteText.value;
  const imageFile = noteImage.files[0];
  const audioFile = noteAudio.files[0];

  if (!text && !imageFile && !audioFile) {
    alert("Note khali hai!");
    return;
  }

  let imageURL = "";
  let audioURL = "";

  if (imageFile) {
    const imgRef = ref(storage, `notes/${user.uid}/images/${Date.now()}`);
    await uploadBytes(imgRef, imageFile);
    imageURL = await getDownloadURL(imgRef);
  }

  if (audioFile) {
    const audRef = ref(storage, `notes/${user.uid}/audio/${Date.now()}`);
    await uploadBytes(audRef, audioFile);
    audioURL = await getDownloadURL(audRef);
  }

  await addDoc(collection(db, "notes"), {
    uid: user.uid,
    text,
    imageURL,
    audioURL,
    createdAt: serverTimestamp()
  });

  noteText.value = "";
  noteImage.value = "";
  noteAudio.value = "";

  loadNotes();
};

/* ================= LOAD NOTES ================= */
async function loadNotes() {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(collection(db, "notes"), where("uid", "==", user.uid));
  const snap = await getDocs(q);

  notesContainer.innerHTML = "";

  snap.forEach(doc => {
    const n = doc.data();
    notesContainer.innerHTML += `
      <div class="note-card">
        ${n.text ? `<p>${n.text}</p>` : ""}
        ${n.imageURL ? `<img src="${n.imageURL}">` : ""}
        ${n.audioURL ? `<audio controls src="${n.audioURL}"></audio>` : ""}
      </div>
    `;
  });
}
