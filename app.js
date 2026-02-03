import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 🔥 PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSyASf9U3FPS5CAl2amNE8g4dWKbJu5HiOIY",
  authDomain: "krionak-creation.firebaseapp.com",
  databaseURL: "https://krionak-creation-default-rtdb.firebaseio.com",
  projectId: "krionak-creation",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// LOGIN
window.login = function () {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .catch(() => createUserWithEmailAndPassword(auth, email.value, password.value));
};

// AUTH STATE
onAuthStateChanged(auth, user => {
  if (user) {
    loginPage.classList.add("hidden");
    dashboard.classList.remove("hidden");
    loadProjects(user.uid);
  }
});

// LOGOUT
window.logout = () => signOut(auth);

// CREATE PROJECT
window.createProject = function () {
  const user = auth.currentUser;
  if (!user) return;

  push(ref(db, "projects/" + user.uid), {
    name: projectName.value,
    type: projectType.value,
    status: "Pending",
    voiceLink: voiceLink.value,
    videoLink: videoLink.value,
    fileLink: fileLink.value,
    time: Date.now()
  });

  projectName.value = "";
  voiceLink.value = "";
  videoLink.value = "";
  fileLink.value = "";
};

// LOAD PROJECTS
function loadProjects(uid) {
  onValue(ref(db, "projects/" + uid), snap => {
    projectList.innerHTML = "";

    let total = 0, pending = 0, completed = 0;

    snap.forEach(p => {
      total++;
      const d = p.val();

      if (d.status === "Pending") pending++;
      if (d.status === "Completed") completed++;

      projectList.innerHTML += `
        <div class="project">
          <b>${d.name}</b><br>
          Type: ${d.type}<br>
          Status: ${d.status}<br><br>

          ${d.voiceLink ? `<a href="${d.voiceLink}" target="_blank">🎙️ Voice</a>` : ""}
          ${d.videoLink ? `<a href="${d.videoLink}" target="_blank">🎥 Video</a>` : ""}
          ${d.fileLink ? `<a href="${d.fileLink}" target="_blank">📄 File</a>` : ""}
        </div>
      `;
    });

    totalEl.textContent = "Total: " + total;
    pendingEl.textContent = "Pending: " + pending;
    completedEl.textContent = "Completed: " + completed;
  });
}
