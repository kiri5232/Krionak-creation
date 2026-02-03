import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyASf9U3FPS5CAl2amNE8g4dWKbJu5HiOIY",
  authDomain: "krionak-creation.firebaseapp.com",
  databaseURL: "https://krionak-creation-default-rtdb.firebaseio.com",
  projectId: "krionak-creation",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// LOGIN LOGIC
window.login = () => {
  const emailVal = document.getElementById("email").value;
  const passVal = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, emailVal, passVal)
    .catch(() => createUserWithEmailAndPassword(auth, emailVal, passVal));
};

onAuthStateChanged(auth, user => {
  if (user) {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    loadProjects(user.uid);
  } else {
    document.getElementById("loginPage").classList.remove("hidden");
    document.getElementById("dashboard").classList.add("hidden");
  }
});

window.logout = () => signOut(auth);

// CREATE PROJECT
window.createProject = () => {
  const user = auth.currentUser;
  if (!user) return;

  const name = document.getElementById("projectName").value;
  if(!name) return alert("Project name toh daal bhai!");

  push(ref(db, `projects/${user.uid}`), {
    name: name,
    type: document.getElementById("projectType").value,
    status: "Pending",
    voiceLink: document.getElementById("voiceLink").value,
    videoLink: document.getElementById("videoLink").value,
    fileLink: document.getElementById("fileLink").value,
    createdAt: Date.now()
  });

  // Clear inputs
  ["projectName", "voiceLink", "videoLink", "fileLink"].forEach(id => document.getElementById(id).value = "");
};

// DELETE PROJECT
window.deleteProject = (id) => {
  if(confirm("Pakka uda du? Recover nahi hoga!")) {
    remove(ref(db, `projects/${auth.currentUser.uid}/${id}`));
  }
};

// TOGGLE STATUS
window.toggleStatus = (id, currentStatus) => {
  const newStatus = currentStatus === "Pending" ? "Completed" : "Pending";
  update(ref(db, `projects/${auth.currentUser.uid}/${id}`), { status: newStatus });
};

// LOAD & RENDER
function loadProjects(uid) {
  onValue(ref(db, `projects/${uid}`), snap => {
    const list = document.getElementById("projectList");
    list.innerHTML = "";
    let stats = { total: 0, pending: 0, completed: 0 };

    snap.forEach(child => {
      const id = child.key;
      const d = child.val();
      stats.total++;
      stats[d.status.toLowerCase()]++;

      list.innerHTML += `
        <div class="project-card ${d.status}">
          <button class="del-btn" onclick="deleteProject('${id}')">🗑️</button>
          <small style="color:var(--primary)">${d.type}</small>
          <h3 style="margin:5px 0">${d.name}</h3>
          
          <button onclick="toggleStatus('${id}', '${d.status}')" 
                  class="status-badge ${d.status === 'Pending' ? 'bg-pending' : 'bg-completed'}">
            ${d.status === 'Pending' ? '⏳ Pending' : '✅ Completed'}
          </button>

          <div class="links-row">
            ${d.voiceLink ? `<a href="${d.voiceLink}" target="_blank" title="Voice">🎙️</a>` : ""}
            ${d.videoLink ? `<a href="${d.videoLink}" target="_blank" title="Video">🎥</a>` : ""}
            ${d.fileLink ? `<a href="${d.fileLink}" target="_blank" title="Files">📄</a>` : ""}
          </div>
        </div>
      `;
    });

    document.getElementById("totalEl").innerText = stats.total;
    document.getElementById("pendingEl").innerText = stats.pending;
    document.getElementById("completedEl").innerText = stats.completed;
  });
}
