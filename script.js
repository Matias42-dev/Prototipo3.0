function el(id) { return document.getElementById(id); }

const students = [
  { name: "Lucho", present: false, absences: 2 },
  { name: "Cecilia", present: false, absences: 4 },
  { name: "Tomás", present: false, absences: 1 }
];

const MAX_ABSENCES = 5;

function saveData() {
  localStorage.setItem('students', JSON.stringify(students));
}

function loadData() {
  const saved = localStorage.getItem('students');
  if (saved) {
    const parsed = JSON.parse(saved);
    for (let i = 0; i < students.length; i++) {
      students[i].absences = parsed[i]?.absences || students[i].absences;
      students[i].present = parsed[i]?.present || false;
    }
  }
}

function renderAttendance() {
  const ul = el('attendanceList');
  ul.innerHTML = '';
  students.forEach(s => {
    const li = document.createElement('li');
    li.textContent = `${s.name} - ${s.present ? "Presente ✅" : "Ausente ❌"}`;
    ul.appendChild(li);
  });
}

function renderAlerts() {
  const ul = el('alertList');
  ul.innerHTML = '';
  students.forEach(s => {
    if (s.absences >= MAX_ABSENCES - 1) {
      const li = document.createElement('li');
      li.textContent = `⚠️ ${s.name} está por superar el límite de faltas (${s.absences}/${MAX_ABSENCES})`;
      ul.appendChild(li);
    }
  });
}

loadData();
renderAttendance();
renderAlerts();

el('generateQR').addEventListener('click', () => {
  const token = 'CLASS-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  localStorage.setItem('currentToken', token);
  el('qrcode').innerHTML = '';
  new QRCode(el('qrcode'), token);
  alert('QR generado para la clase: ' + token);
});

function markAttendance(token) {
  const stored = localStorage.getItem('currentToken');
  if (token === stored) {
    const student = students[Math.floor(Math.random() * students.length)];
    student.present = true;
    saveData();
    renderAttendance();
    el('studentMessage').textContent = `${student.name} registrado con éxito ✅`;
  } else {
    el('studentMessage').textContent = "Token inválido ❌";
  }
}

el('pasteToken').addEventListener('click', () => {
  const token = el('tokenInput').value.trim();
  if (token) markAttendance(token);
});

el('clearData').addEventListener('click', () => {
  localStorage.clear();
  students.forEach(s => s.present = false);
  renderAttendance();
  renderAlerts();
  alert('Datos limpiados correctamente.');
});

try {
  const scanner = new Html5Qrcode("reader");
  scanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    decodedText => {
      scanner.stop();
      markAttendance(decodedText);
    }
  );
} catch (e) {
  console.log("Escáner no iniciado (posiblemente sin cámara):", e);
}
