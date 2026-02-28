// ===== IRON EMPIRE - AUTHENTICATION SYSTEM =====
// Firebase Auth: Google, Facebook, Email/Password

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCghDMch1X1U989kzLXN1POnYWtph15R4o",
  authDomain: "iron-empire-fac57.firebaseapp.com",
  projectId: "iron-empire-fac57",
  storageBucket: "iron-empire-fac57.firebasestorage.app",
  messagingSenderId: "1039622184703",
  appId: "1:1039622184703:web:ff914b0ccc8f2b526576ca"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Auth state
let currentUser = null;
let authReady = false;

// ===== AUTH UI =====
function showAuthScreen() {
  document.getElementById('authScreen').classList.remove('hidden');
  document.getElementById('nameModal').classList.add('hidden');
  document.getElementById('authLoginForm').classList.remove('hidden');
  document.getElementById('authRegisterForm').classList.add('hidden');
  document.getElementById('authResetForm').classList.add('hidden');
  clearAuthErrors();
}

function showRegisterForm() {
  document.getElementById('authLoginForm').classList.add('hidden');
  document.getElementById('authRegisterForm').classList.remove('hidden');
  document.getElementById('authResetForm').classList.add('hidden');
  clearAuthErrors();
}

function showLoginForm() {
  document.getElementById('authLoginForm').classList.remove('hidden');
  document.getElementById('authRegisterForm').classList.add('hidden');
  document.getElementById('authResetForm').classList.add('hidden');
  clearAuthErrors();
}

function showResetForm() {
  document.getElementById('authLoginForm').classList.add('hidden');
  document.getElementById('authRegisterForm').classList.add('hidden');
  document.getElementById('authResetForm').classList.remove('hidden');
  clearAuthErrors();
}

function clearAuthErrors() {
  document.querySelectorAll('.auth-error').forEach(el => el.textContent = '');
}

function showAuthError(formId, msg) {
  const el = document.getElementById(formId + 'Error');
  if (el) el.textContent = msg;
}

function setAuthLoading(loading) {
  document.querySelectorAll('.auth-btn').forEach(btn => {
    btn.disabled = loading;
    if (loading) btn.classList.add('loading');
    else btn.classList.remove('loading');
  });
}

// ===== FIREBASE AUTH ERROR MESSAGES (Spanish) =====
function getAuthErrorMsg(code) {
  const msgs = {
    'auth/email-already-in-use': 'Ese email ya tiene una cuenta. Iniciá sesión.',
    'auth/invalid-email': 'Email inválido.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/user-not-found': 'No existe una cuenta con ese email.',
    'auth/wrong-password': 'Contraseña incorrecta.',
    'auth/too-many-requests': 'Demasiados intentos. Esperá un momento.',
    'auth/popup-closed-by-user': 'Se cerró la ventana de login.',
    'auth/account-exists-with-different-credential': 'Ya existe una cuenta con ese email usando otro método de login.',
    'auth/network-request-failed': 'Error de conexión. Revisá tu internet.',
    'auth/invalid-credential': 'Credenciales inválidas. Revisá email y contraseña.',
    'auth/popup-blocked': 'El navegador bloqueó la ventana de login. Permití popups para este sitio.',
  };
  return msgs[code] || 'Error: ' + code;
}

// ===== EMAIL/PASSWORD REGISTER =====
async function registerWithEmail() {
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const password2 = document.getElementById('regPassword2').value;

  if (!username || username.length < 2) {
    showAuthError('register', 'El nombre de usuario debe tener al menos 2 caracteres.');
    return;
  }
  if (username.length > 20) {
    showAuthError('register', 'El nombre de usuario no puede tener más de 20 caracteres.');
    return;
  }
  if (!email) {
    showAuthError('register', 'Ingresá tu email.');
    return;
  }
  if (!password || password.length < 6) {
    showAuthError('register', 'La contraseña debe tener al menos 6 caracteres.');
    return;
  }
  if (password !== password2) {
    showAuthError('register', 'Las contraseñas no coinciden.');
    return;
  }

  setAuthLoading(true);
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: username });

    // Create user doc in Firestore
    await db.collection('users').doc(cred.user.uid).set({
      username: username,
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // New user → show gym name modal
    onAuthSuccess(cred.user, true);
  } catch (err) {
    showAuthError('register', getAuthErrorMsg(err.code));
  }
  setAuthLoading(false);
}

// ===== EMAIL/PASSWORD LOGIN =====
async function loginWithEmail() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showAuthError('login', 'Completá email y contraseña.');
    return;
  }

  setAuthLoading(true);
  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    await db.collection('users').doc(cred.user.uid).update({
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
    }).catch(() => {});
    onAuthSuccess(cred.user, false);
  } catch (err) {
    showAuthError('login', getAuthErrorMsg(err.code));
  }
  setAuthLoading(false);
}

// ===== GOOGLE LOGIN =====
async function loginWithGoogle() {
  setAuthLoading(true);
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const cred = await auth.signInWithPopup(provider);
    const isNew = cred.additionalUserInfo?.isNewUser;

    if (isNew) {
      await db.collection('users').doc(cred.user.uid).set({
        username: cred.user.displayName || 'Jugador',
        email: cred.user.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await db.collection('users').doc(cred.user.uid).update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      }).catch(() => {});
    }

    onAuthSuccess(cred.user, isNew);
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user') {
      showAuthError('login', getAuthErrorMsg(err.code));
    }
  }
  setAuthLoading(false);
}

// ===== FACEBOOK LOGIN =====
async function loginWithFacebook() {
  setAuthLoading(true);
  try {
    const provider = new firebase.auth.FacebookAuthProvider();
    const cred = await auth.signInWithPopup(provider);
    const isNew = cred.additionalUserInfo?.isNewUser;

    if (isNew) {
      await db.collection('users').doc(cred.user.uid).set({
        username: cred.user.displayName || 'Jugador',
        email: cred.user.email || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await db.collection('users').doc(cred.user.uid).update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      }).catch(() => {});
    }

    onAuthSuccess(cred.user, isNew);
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user') {
      showAuthError('login', getAuthErrorMsg(err.code));
    }
  }
  setAuthLoading(false);
}

// ===== PASSWORD RESET =====
async function resetPassword() {
  const email = document.getElementById('resetEmail').value.trim();
  if (!email) {
    showAuthError('reset', 'Ingresá tu email.');
    return;
  }

  setAuthLoading(true);
  try {
    await auth.sendPasswordResetEmail(email);
    showAuthError('reset', ''); // Clear error
    document.getElementById('resetSuccess').textContent = '¡Email enviado! Revisá tu bandeja de entrada.';
  } catch (err) {
    showAuthError('reset', getAuthErrorMsg(err.code));
  }
  setAuthLoading(false);
}

// ===== GUEST MODE (play without account) =====
function playAsGuest() {
  currentUser = null;
  document.getElementById('authScreen').classList.add('hidden');

  // Check for local save
  const loaded = loadGame();
  if (loaded && game.started) {
    document.getElementById('nameModal').classList.add('hidden');
    checkDailyReset();
    renderAll();

    // Offline earnings
    const lastSave = localStorage.getItem('ironEmpireLastTick');
    if (lastSave) {
      const elapsed = Math.floor((Date.now() - parseInt(lastSave)) / 1000);
      if (elapsed > 5) {
        const cappedTime = Math.min(elapsed, 7200);
        const offlineIncome = getIncomePerSecond() * cappedTime;
        if (offlineIncome > 0) {
          game.money += offlineIncome;
          game.totalMoneyEarned += offlineIncome;
          addLog('💤 Ganaste <span class="money-log">' + fmtMoney(offlineIncome) + '</span> mientras estabas offline (' + fmtTime(cappedTime) + ')');
          showToast('💤', 'Offline: +' + fmtMoney(offlineIncome));
          updateUI();
          saveGame();
        }
        // Champion offline recovery
        if (game.champion && game.champion.recruited) {
          var offlineMin = Math.floor(cappedTime / 60);
          game.champion.energy = Math.min(CHAMPION_MAX_ENERGY, game.champion.energy + offlineMin * CHAMPION_ENERGY_REGEN);
          // Complete training if it finished while offline
          if (game.champion.trainingUntil && Date.now() >= game.champion.trainingUntil) {
            var stat = game.champion.trainingStat;
            if (stat) {
              game.champion.stats[stat]++;
              addLog('🏅 Campeón completó entrenamiento de <span class="highlight">' + (typeof CHAMPION_STAT_NAMES !== 'undefined' ? CHAMPION_STAT_NAMES[stat] : stat) + '</span> offline');
            }
            game.champion.trainingUntil = 0;
            game.champion.trainingStat = null;
          }
        }
      }
    }

    setInterval(gameTick, 1000);
  } else {
    // New game - show name modal
    document.getElementById('nameModal').classList.remove('hidden');
  }
}

// ===== AUTH SUCCESS HANDLER =====
async function onAuthSuccess(user, isNewUser) {
  currentUser = user;
  document.getElementById('authScreen').classList.add('hidden');

  if (isNewUser) {
    // Brand new user → show gym name modal → then tutorial
    document.getElementById('nameModal').classList.remove('hidden');
  } else {
    // Returning user → try to load cloud save
    const cloudLoaded = await loadCloudSave();
    if (cloudLoaded && game.started) {
      document.getElementById('nameModal').classList.add('hidden');
      checkDailyReset();
      renderAll();

      // Calculate offline earnings from cloud save
      const lastSave = game._lastSaveTime || 0;
      if (lastSave) {
        const elapsed = Math.floor((Date.now() - lastSave) / 1000);
        if (elapsed > 5) {
          const cappedTime = Math.min(elapsed, 7200);
          const offlineIncome = getIncomePerSecond() * cappedTime;
          if (offlineIncome > 0) {
            game.money += offlineIncome;
            game.totalMoneyEarned += offlineIncome;
            addLog('💤 Ganaste <span class="money-log">' + fmtMoney(offlineIncome) + '</span> mientras estabas offline (' + fmtTime(cappedTime) + ')');
            showToast('💤', 'Offline: +' + fmtMoney(offlineIncome));
            updateUI();
          }
          // Champion offline recovery
          if (game.champion && game.champion.recruited) {
            var offlineMin = Math.floor(cappedTime / 60);
            game.champion.energy = Math.min(CHAMPION_MAX_ENERGY, game.champion.energy + offlineMin * CHAMPION_ENERGY_REGEN);
            if (game.champion.trainingUntil && Date.now() >= game.champion.trainingUntil) {
              var stat = game.champion.trainingStat;
              if (stat) {
                game.champion.stats[stat]++;
                addLog('🏅 Campeón completó entrenamiento de <span class="highlight">' + (typeof CHAMPION_STAT_NAMES !== 'undefined' ? CHAMPION_STAT_NAMES[stat] : stat) + '</span> offline');
              }
              game.champion.trainingUntil = 0;
              game.champion.trainingStat = null;
            }
          }
        }
      }

      setInterval(gameTick, 1000);
      // Also save locally as backup
      saveGame();
    } else {
      // Returning user but no cloud save - check local
      const localLoaded = loadGame();
      if (localLoaded && game.started) {
        document.getElementById('nameModal').classList.add('hidden');
        checkDailyReset();
        renderAll();
        setInterval(gameTick, 1000);
        // Migrate local save to cloud
        saveCloudSave();
      } else {
        // No save at all - show name modal
        document.getElementById('nameModal').classList.remove('hidden');
      }
    }
  }

  updateAccountUI();
}

// ===== LOGOUT =====
async function logoutUser() {
  // Save before logging out
  if (currentUser) {
    await saveCloudSave();
  }
  saveGame();

  await auth.signOut();
  currentUser = null;
  location.reload();
}

// ===== ACCOUNT SETTINGS =====
function openAccountSettings() {
  if (!currentUser) {
    showToast('❌', 'Tenés que iniciar sesión para ver tu cuenta.');
    return;
  }
  document.getElementById('accountModal').classList.remove('hidden');
  updateAccountModal();
}

function closeAccountSettings() {
  document.getElementById('accountModal').classList.add('hidden');
  clearAccountErrors();
}

function clearAccountErrors() {
  document.querySelectorAll('.account-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.account-success').forEach(el => el.textContent = '');
}

function updateAccountModal() {
  if (!currentUser) return;

  document.getElementById('accountUsername').value = currentUser.displayName || '';
  document.getElementById('accountEmail').textContent = currentUser.email || 'No disponible';

  const providerIcons = currentUser.providerData.map(p => {
    if (p.providerId === 'google.com') return '🔵 Google';
    if (p.providerId === 'facebook.com') return '🔷 Facebook';
    if (p.providerId === 'password') return '📧 Email';
    return p.providerId;
  });
  document.getElementById('accountProviders').textContent = providerIcons.join(', ');

  // Show/hide password section based on provider
  const hasPassword = currentUser.providerData.some(p => p.providerId === 'password');
  document.getElementById('accountPasswordSection').style.display = hasPassword ? 'block' : 'none';
}

function updateAccountUI() {
  const el = document.getElementById('accountBtnContainer');
  if (!el) return;

  if (currentUser) {
    const name = currentUser.displayName || currentUser.email || 'Jugador';
    el.innerHTML =
      '<button class="btn btn-cyan btn-small" onclick="openAccountSettings()">' +
        '👤 ' + name +
      '</button>' +
      '<button class="btn btn-red btn-small" onclick="logoutUser()">' +
        '🚪 SALIR' +
      '</button>';
  } else {
    el.innerHTML =
      '<span style="color:var(--text-muted);font-size:12px;">Modo invitado</span>';
  }
}

async function saveAccountUsername() {
  const newName = document.getElementById('accountUsername').value.trim();
  if (!newName || newName.length < 2 || newName.length > 20) {
    document.getElementById('usernameError').textContent = 'El nombre debe tener entre 2 y 20 caracteres.';
    return;
  }

  try {
    await currentUser.updateProfile({ displayName: newName });
    await db.collection('users').doc(currentUser.uid).update({ username: newName });
    document.getElementById('usernameSuccess').textContent = '¡Nombre actualizado!';
    document.getElementById('usernameError').textContent = '';
    updateAccountUI();
    setTimeout(() => {
      const s = document.getElementById('usernameSuccess');
      if (s) s.textContent = '';
    }, 3000);
  } catch (err) {
    document.getElementById('usernameError').textContent = 'Error al actualizar: ' + err.message;
  }
}

async function changeAccountPassword() {
  const current = document.getElementById('accountCurrentPass').value;
  const newPass = document.getElementById('accountNewPass').value;
  const newPass2 = document.getElementById('accountNewPass2').value;

  if (!current || !newPass) {
    document.getElementById('passwordError').textContent = 'Completá todos los campos.';
    return;
  }
  if (newPass.length < 6) {
    document.getElementById('passwordError').textContent = 'La nueva contraseña debe tener al menos 6 caracteres.';
    return;
  }
  if (newPass !== newPass2) {
    document.getElementById('passwordError').textContent = 'Las contraseñas no coinciden.';
    return;
  }

  try {
    // Re-authenticate
    const cred = firebase.auth.EmailAuthProvider.credential(currentUser.email, current);
    await currentUser.reauthenticateWithCredential(cred);
    await currentUser.updatePassword(newPass);

    document.getElementById('passwordSuccess').textContent = '¡Contraseña actualizada!';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('accountCurrentPass').value = '';
    document.getElementById('accountNewPass').value = '';
    document.getElementById('accountNewPass2').value = '';
    setTimeout(() => {
      const s = document.getElementById('passwordSuccess');
      if (s) s.textContent = '';
    }, 3000);
  } catch (err) {
    document.getElementById('passwordError').textContent = getAuthErrorMsg(err.code);
  }
}

// ===== CLOUD SAVE =====
async function saveCloudSave() {
  if (!currentUser) return;

  try {
    const saveData = JSON.parse(JSON.stringify(game));
    saveData._lastSaveTime = Date.now();
    // Remove functions and circular refs
    delete saveData.log; // Log is too large, keep it local only

    await db.collection('saves').doc(currentUser.uid).set({
      gameData: JSON.stringify(saveData),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      gymName: game.gymName,
      level: game.level,
      prestigeStars: game.prestigeStars,
    });

    // Sync leaderboard
    await db.collection('leaderboard').doc(currentUser.uid).set({
      username: currentUser.displayName || 'Anónimo',
      gymName: game.gymName,
      totalMoneyEarned: game.totalMoneyEarned,
      level: game.level,
      prestigeStars: game.prestigeStars,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('Cloud save failed:', err);
  }
}

async function loadCloudSave() {
  if (!currentUser) return false;

  try {
    const doc = await db.collection('saves').doc(currentUser.uid).get();
    if (doc.exists && doc.data().gameData) {
      const data = JSON.parse(doc.data().gameData);
      game = deepMerge(game, data);
      return true;
    }
  } catch (err) {
    console.error('Cloud load failed:', err);
  }
  return false;
}

// ===== LEADERBOARD =====
let leaderboardCache = null;
let leaderboardCacheTime = 0;
const LEADERBOARD_CACHE_MS = 5 * 60 * 1000; // 5 minutes

async function fetchLeaderboard(forceRefresh) {
  if (!forceRefresh && leaderboardCache && (Date.now() - leaderboardCacheTime) < LEADERBOARD_CACHE_MS) {
    return leaderboardCache;
  }

  try {
    var snapshot = await db.collection('leaderboard')
      .orderBy('totalMoneyEarned', 'desc')
      .limit(20)
      .get();

    var entries = [];
    snapshot.forEach(function(doc) {
      var data = doc.data();
      data.uid = doc.id;
      entries.push(data);
    });

    leaderboardCache = entries;
    leaderboardCacheTime = Date.now();
    return entries;
  } catch (err) {
    console.error('Leaderboard fetch failed:', err);
    return leaderboardCache || [];
  }
}

async function fetchMyRank() {
  if (!currentUser || !game.totalMoneyEarned) return null;

  try {
    var snapshot = await db.collection('leaderboard')
      .where('totalMoneyEarned', '>', game.totalMoneyEarned)
      .get();
    return snapshot.size + 1;
  } catch (err) {
    console.error('Rank fetch failed:', err);
    return null;
  }
}

// ===== AUTH STATE LISTENER =====
auth.onAuthStateChanged(async (user) => {
  if (authReady) return; // Only handle initial auth check
  authReady = true;

  if (user) {
    // User is signed in
    onAuthSuccess(user, false);
  } else {
    // Not signed in - show auth screen
    showAuthScreen();
  }
});
