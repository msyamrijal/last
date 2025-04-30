// Enkripsi sederhana
const encrypt = (text) => btoa(unescape(encodeURIComponent(text)));
const decrypt = (text) => decodeURIComponent(escape(atob(text)));

// Konfigurasi Admin
const ADMIN_CREDENTIALS = encrypt(JSON.stringify({
    username: "admin",
    password: "P@ssw0rdSecure!2024"
}));

// Data Awal
let data = {
    PTIQ: {
        "Sejarah Peradaban Islam": {
            "2025-04-21": ["Noviyatul Badriyah", "Ibnatul Mardiah"],
            // ... (data lengkap)
        },
        // ... (data lainnya)
    },
    // ... (data institusi lainnya)
};

// Sistem Autentikasi
let isAdmin = false;
let loginAttempts = 0;
const MAX_ATTEMPTS = 3;

// Fungsi Utama
function generateSchedule() {
    const tbody = document.getElementById('scheduleBody');
    tbody.innerHTML = '';

    for (const [institution, courses] of Object.entries(data)) {
        for (const [course, schedules] of Object.entries(courses)) {
            for (const [date, speakers] of Object.entries(schedules)) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${date.split('-').reverse().join('/')}</td>
                    <td>${course}</td>
                    <td>${speakers.join(', ')}</td>
                    <td>${institution}</td>
                    <td>-</td>
                `;
                tbody.appendChild(row);
            }
        }
    }
}

// Validasi Input
function validateInput(institution, course, date, speakers) {
    const errors = [];
    const today = new Date().toISOString().split('T')[0];

    if (!['PTIQ', 'PKU B', 'PKUP'].includes(institution)) errors.push('Institusi tidak valid');
    if (!course || course.length < 5) errors.push('Nama mata kuliah minimal 5 karakter');
    if (!date || date < today) errors.push('Tanggal tidak valid');
    if (!speakers || speakers.length < 1) errors.push('Masukkan minimal 1 pemakalah');

    return errors;
}

// Fungsi Admin
function adminLogin() {
    if (loginAttempts >= MAX_ATTEMPTS) return alert('Terlalu banyak percobaan!');

    try {
        const storedCredentials = JSON.parse(decrypt(ADMIN_CREDENTIALS));
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        if (username === storedCredentials.username && password === storedCredentials.password) {
            isAdmin = true;
            localStorage.setItem('authToken', encrypt(Date.now().toString()));
            document.getElementById('adminPanel').style.display = 'block';
            $('#adminLoginModal').modal('hide');
            loadScheduleForEdit();
        } else {
            loginAttempts++;
            alert(`Login gagal! Percobaan tersisa: ${MAX_ATTEMPTS - loginAttempts}`);
        }
    } catch (error) {
        alert('Terjadi kesalahan sistem!');
    }
}

// Fungsi CRUD
function addSchedule() {
    if (!isAdmin) return;

    const institution = document.getElementById('institution').value;
    const course = document.getElementById('course').value.trim();
    const date = document.getElementById('date').value;
    const speakers = document.getElementById('speakers').value.split(',').map(s => s.trim());

    const errors = validateInput(institution, course, date, speakers);
    if (errors.length > 0) return alert(`Error:\n${errors.join('\n')}`);

    if (!data[institution][course]) data[institution][course] = {};
    data[institution][course][date] = speakers;
    
    saveToLocalStorage();
    generateSchedule();
    loadScheduleForEdit();
    alert('Jadwal berhasil ditambahkan!');
}

// Penyimpanan Data
function saveToLocalStorage() {
    localStorage.setItem('scheduleData', encrypt(JSON.stringify(data)));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('scheduleData');
    if (savedData) data = JSON.parse(decrypt(savedData));
}

// Event Listeners
document.getElementById('dateFilter').addEventListener('change', filterSchedule);
document.getElementById('institutionFilter').addEventListener('change', filterSchedule);

// Inisialisasi
loadFromLocalStorage();
generateSchedule();
checkAuth();

// ... (fungsi lainnya seperti editSchedule, deleteSchedule, loadScheduleForEdit)
