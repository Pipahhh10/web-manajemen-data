// ================= KONFIGURASI =================
const STORAGE_KEY = "campus_sync_data_permanent";
let dataMahasiswa = [];
let currentSortColumn = null;
let currentSortOrder = 'asc';
let currentFilteredData = [];

// ================= INITIAL DATA LOAD =================
function loadDataFromStorage() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    console.log("Data dari localStorage:", savedData);
    
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            // Konversi data plain object ke instance Mahasiswa
            dataMahasiswa = parsedData.map(item => 
                new Mahasiswa(item.nim, item.nama, item.jurusan, item.ipk)
            );
            console.log(`Data berhasil dimuat: ${dataMahasiswa.length} records`);
        } catch (error) {
            console.error("Error parsing data:", error);
            dataMahasiswa = [];
        }
    } else {
        console.log("Tidak ada data tersimpan, menggunakan array kosong");
        dataMahasiswa = [];
    }
    
    currentFilteredData = [...dataMahasiswa];
}

// ================= TOAST SYSTEM =================
function showToast(message, type = "success") {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <div>${message}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.4s ease forwards';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// ================= OOP CLASSES =================
class Mahasiswa {
    constructor(nim, nama, jurusan, ipk) {
        this.nim = nim;
        this.nama = nama;
        this.jurusan = jurusan;
        this.ipk = parseFloat(ipk);
        this.tanggalDaftar = new Date().toISOString();
    }
    
    get status() {
        if (this.ipk >= 3.5) return "Cumlaude";
        if (this.ipk >= 3.0) return "Sangat Baik";
        if (this.ipk >= 2.5) return "Baik";
        if (this.ipk >= 2.0) return "Cukup";
        return "Perlu Perbaikan";
    }
    
    get badgeClass() {
        const status = this.status;
        if (status === "Cumlaude" || status === "Sangat Baik") return "badge-success";
        if (status === "Baik" || status === "Cukup") return "badge-warning";
        return "badge-danger";
    }
    
    // Method untuk serialisasi
    toJSON() {
        return {
            nim: this.nim,
            nama: this.nama,
            jurusan: this.jurusan,
            ipk: this.ipk,
            tanggalDaftar: this.tanggalDaftar
        };
    }
}

// ================= SORTING ALGORITHMS =================
class BubbleSort {
    constructor() {
        this.name = "Bubble Sort";
        this.complexity = "O(n²)";
    }
    
    sort(arr, field = 'nama', ascending = true) {
        const data = [...arr];
        const n = data.length;
        let comparisons = 0;
        let swaps = 0;
        
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                comparisons++;
                const a = data[j][field];
                const b = data[j + 1][field];
                
                if ((ascending && a > b) || (!ascending && a < b)) {
                    [data[j], data[j + 1]] = [data[j + 1], data[j]];
                    swaps++;
                }
            }
        }
        
        return {
            sorted: data,
            comparisons,
            swaps
        };
    }
}

class SelectionSort {
    constructor() {
        this.name = "Selection Sort";
        this.complexity = "O(n²)";
    }
    
    sort(arr, field = 'nama', ascending = true) {
        const data = [...arr];
        const n = data.length;
        let comparisons = 0;
        let swaps = 0;
        
        for (let i = 0; i < n - 1; i++) {
            let extreme = i;
            
            for (let j = i + 1; j < n; j++) {
                comparisons++;
                const a = data[j][field];
                const b = data[extreme][field];
                
                if ((ascending && a < b) || (!ascending && a > b)) {
                    extreme = j;
                }
            }
            
            if (extreme !== i) {
                [data[i], data[extreme]] = [data[extreme], data[i]];
                swaps++;
            }
        }
        
        return {
            sorted: data,
            comparisons,
            swaps
        };
    }
}

class InsertionSort {
    constructor() {
        this.name = "Insertion Sort";
        this.complexity = "O(n²)";
    }
    
    sort(arr, field = 'nama', ascending = true) {
        const data = [...arr];
        let comparisons = 0;
        let swaps = 0;
        
        for (let i = 1; i < data.length; i++) {
            const key = data[i];
            let j = i - 1;
            
            while (j >= 0) {
                comparisons++;
                const a = data[j][field];
                const b = key[field];
                
                if ((ascending && a > b) || (!ascending && a < b)) {
                    data[j + 1] = data[j];
                    swaps++;
                    j--;
                } else {
                    break;
                }
            }
            data[j + 1] = key;
        }
        
        return {
            sorted: data,
            comparisons,
            swaps
        };
    }
}

// ================= VALIDATION =================
function validateStudent(nim, nama, jurusan, ipk) {
    try {
        // Validate NIM
        if (!nim.trim()) throw "NIM tidak boleh kosong";
        if (!/^\d{8,10}$/.test(nim)) throw "NIM harus 8-10 digit angka";
        
        // Validate Name
        if (!nama.trim()) throw "Nama tidak boleh kosong";
        if (!/^[A-Za-z\s]{3,}$/.test(nama)) throw "Nama harus minimal 3 karakter huruf";
        
        // Validate Major
        if (!jurusan.trim()) throw "Pilih jurusan";
        
        // Validate GPA
        if (!ipk) throw "IPK tidak boleh kosong";
        const ipkNum = parseFloat(ipk);
        if (isNaN(ipkNum)) throw "IPK harus angka";
        if (ipkNum < 0 || ipkNum > 4) throw "IPK harus antara 0.00 - 4.00";
        
        return true;
    } catch (error) {
        showToast(error, "error");
        return false;
    }
}

// ================= CRUD OPERATIONS =================
function addStudent() {
    const nim = document.getElementById('nim').value.trim();
    const nama = document.getElementById('nama').value.trim();
    const jurusan = document.getElementById('jurusan').value;
    const ipk = document.getElementById('ipk').value.trim();
    
    if (!validateStudent(nim, nama, jurusan, ipk)) return;
    
    // Check for duplicate NIM
    if (dataMahasiswa.some(m => m.nim === nim)) {
        showToast("NIM sudah terdaftar!", "error");
        return;
    }
    
    const newStudent = new Mahasiswa(nim, nama, jurusan, ipk);
    dataMahasiswa.push(newStudent);
    saveData();
    resetForm();
    displayData();
    updateStats();
    showToast(`Data ${nama} berhasil ditambahkan! Status: ${newStudent.status}`, "success");
}

function editStudent(index) {
    if (index < 0 || index >= dataMahasiswa.length) return;
    
    const student = dataMahasiswa[index];
    const editModal = document.getElementById('editModal');
    const editFormContent = document.getElementById('editFormContent');
    
    editFormContent.innerHTML = `
        <div class="form-grid">
            <div class="input-group">
                <label for="editNim"><i class="fas fa-id-card"></i> NIM</label>
                <i class="fas fa-hashtag input-icon"></i>
                <input type="text" id="editNim" value="${student.nim}" maxlength="10">
            </div>
            
            <div class="input-group">
                <label for="editNama"><i class="fas fa-user"></i> Nama</label>
                <i class="fas fa-user-circle input-icon"></i>
                <input type="text" id="editNama" value="${student.nama}">
            </div>
            
            <div class="input-group">
                <label for="editJurusan"><i class="fas fa-graduation-cap"></i> Jurusan</label>
                <i class="fas fa-book input-icon"></i>
                <select id="editJurusan">
                    <option value="">Pilih Jurusan</option>
                    <option value="Teknik Informatika" ${student.jurusan === 'Teknik Informatika' ? 'selected' : ''}>Teknik Informatika</option>
                    <option value="Sistem Informasi" ${student.jurusan === 'Sistem Informasi' ? 'selected' : ''}>Sistem Informasi</option>
                    <option value="Teknik Komputer" ${student.jurusan === 'Teknik Komputer' ? 'selected' : ''}>Teknik Komputer</option>
                    <option value="Data Science" ${student.jurusan === 'Data Science' ? 'selected' : ''}>Data Science</option>
                    <option value="Bisnis Digital" ${student.jurusan === 'Bisnis Digital' ? 'selected' : ''}>Bisnis Digital</option>
                </select>
            </div>
            
            <div class="input-group">
                <label for="editIpk"><i class="fas fa-star"></i> IPK</label>
                <i class="fas fa-chart-bar input-icon"></i>
                <input type="number" id="editIpk" step="0.01" min="0" max="4" value="${student.ipk}">
                <small style="display: block; margin-top: 5px; color: #666;">Status saat ini: <span class="badge ${student.badgeClass}">${student.status}</span></small>
            </div>
        </div>
        
        <div class="btn-group">
            <button class="btn btn-success" onclick="saveEdit(${index})">
                <i class="fas fa-save"></i> Simpan Perubahan
            </button>
            <button class="btn btn-secondary" onclick="closeModal()">
                <i class="fas fa-times"></i> Batal
            </button>
        </div>
    `;
    
    editModal.classList.add('active');
}

function saveEdit(index) {
    const nim = document.getElementById('editNim').value.trim();
    const nama = document.getElementById('editNama').value.trim();
    const jurusan = document.getElementById('editJurusan').value;
    const ipk = document.getElementById('editIpk').value.trim();
    
    if (!validateStudent(nim, nama, jurusan, ipk)) return;
    
    // Check for duplicate NIM (except current student)
    const duplicate = dataMahasiswa.find((m, i) => i !== index && m.nim === nim);
    if (duplicate) {
        showToast("NIM sudah terdaftar oleh mahasiswa lain!", "error");
        return;
    }
    
    dataMahasiswa[index] = new Mahasiswa(nim, nama, jurusan, ipk);
    saveData();
    displayData();
    updateStats();
    closeModal();
    showToast(`Data ${nama} berhasil diperbarui! Status: ${dataMahasiswa[index].status}`, "success");
}

function deleteStudent(index) {
    const student = dataMahasiswa[index];
    if (confirm(`Apakah Anda yakin ingin menghapus data ${student.nama} (${student.nim})?`)) {
        dataMahasiswa.splice(index, 1);
        saveData();
        displayData();
        updateStats();
        showToast("Data berhasil dihapus!", "success");
    }
}

function resetForm() {
    document.getElementById('nim').value = '';
    document.getElementById('nama').value = '';
    document.getElementById('jurusan').value = '';
    document.getElementById('ipk').value = '';
    document.getElementById('nim').focus();
}

// ================= SEARCH & SORT =================
function searchData() {
    const keyword = document.getElementById('keyword').value.toLowerCase().trim();
    
    if (!keyword) {
        currentFilteredData = [...dataMahasiswa];
    } else {
        currentFilteredData = dataMahasiswa.filter(m => 
            m.nim.toLowerCase().includes(keyword) || 
            m.nama.toLowerCase().includes(keyword) ||
            m.jurusan.toLowerCase().includes(keyword)
        );
    }
    
    displayData();
    updateDisplayCount();
}

function performSort() {
    const field = document.getElementById('sortField').value;
    const order = document.getElementById('sortOrder').value;
    const algorithm = document.getElementById('sortAlgorithm').value;
    const ascending = order === 'asc';
    
    // Create sorting algorithm instance
    let sorter;
    switch(algorithm) {
        case 'bubble':
            sorter = new BubbleSort();
            break;
        case 'selection':
            sorter = new SelectionSort();
            break;
        case 'insertion':
            sorter = new InsertionSort();
            break;
        default:
            sorter = new BubbleSort();
    }
    
    // Perform sort
    const result = sorter.sort(currentFilteredData, field, ascending);
    currentFilteredData = result.sorted;
    
    // Update table
    displayData();
    
    // Show success message with stats
    showToast(`Data diurutkan dengan ${sorter.name} (${sorter.complexity}) - ${field} ${order === 'asc' ? 'naik' : 'turun'}`, "success");
    
    // Update sort indicators
    updateSortIndicators(field, order);
}

function resetSearch() {
    document.getElementById('keyword').value = '';
    document.getElementById('sortField').value = 'nim';
    document.getElementById('sortOrder').value = 'asc';
    document.getElementById('sortAlgorithm').value = 'bubble';
    currentFilteredData = [...dataMahasiswa];
    displayData();
    updateDisplayCount();
    showToast("Filter dan sorting telah direset", "info");
    
    // Reset sort indicators
    document.querySelectorAll('th.sortable').forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
    });
}

function sortTable(column) {
    let order = 'asc';
    
    if (currentSortColumn === column) {
        order = currentSortOrder === 'asc' ? 'desc' : 'asc';
    }
    
    currentSortColumn = column;
    currentSortOrder = order;
    
    const ascending = order === 'asc';
    
    // Simple sort for table click
    currentFilteredData.sort((a, b) => {
        if (column === 'index') return 0;
        
        const valA = a[column];
        const valB = b[column];
        
        if (typeof valA === 'string' && typeof valB === 'string') {
            return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
            return ascending ? valA - valB : valB - valA;
        }
    });
    
    displayData();
    updateSortIndicators(column, order);
}

function updateSortIndicators(column, order) {
    // Remove all sort indicators
    document.querySelectorAll('th.sortable').forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
    });
    
    // Add indicator to current column
    const header = document.querySelector(`th[data-sort="${column}"]`);
    if (header) {
        header.classList.add(`sorted-${order}`);
    }
}

// ================= DATA DISPLAY =================
function displayData() {
    const tableBody = document.getElementById('tableBody');
    const noDataMessage = document.getElementById('noDataMessage');
    
    if (currentFilteredData.length === 0) {
        tableBody.innerHTML = '';
        noDataMessage.style.display = 'block';
        return;
    }
    
    noDataMessage.style.display = 'none';
    
    let html = '';
    currentFilteredData.forEach((student, index) => {
        const originalIndex = dataMahasiswa.findIndex(m => m.nim === student.nim);
        
        // FIX: Tambahkan inline style untuk IPK jika CSS tidak ada
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${student.nim}</td>
                <td>${student.nama}</td>
                <td>${student.jurusan}</td>
                <td style="font-weight: 600; color: #3a0ca3;">${student.ipk.toFixed(2)}</td>
                <td><span class="badge ${student.badgeClass}">${student.status}</span></td>
                <td class="action-cell">
                    <button class="btn btn-sm btn-warning" onclick="editStudent(${originalIndex})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteStudent(${originalIndex})">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    updateDisplayCount();
}

function updateDisplayCount() {
    document.getElementById('displayCount').textContent = `${currentFilteredData.length} data ditampilkan`;
}

function updateStats() {
    const totalStudents = document.getElementById('totalStudents');
    const highestGPA = document.getElementById('highestGPA');
    const totalMajors = document.getElementById('totalMajors');
    const averageGPA = document.getElementById('averageGPA');
    
    if (dataMahasiswa.length === 0) {
        totalStudents.textContent = '0';
        highestGPA.textContent = '0.00';
        totalMajors.textContent = '0';
        averageGPA.textContent = '0.00';
        return;
    }
    
    // Total students
    totalStudents.textContent = dataMahasiswa.length;
    
    // Highest GPA
    const highest = Math.max(...dataMahasiswa.map(m => m.ipk));
    highestGPA.textContent = highest.toFixed(2);
    
    // Total majors
    const majors = new Set(dataMahasiswa.map(m => m.jurusan));
    totalMajors.textContent = majors.size;
    
    // Average GPA
    const totalGPA = dataMahasiswa.reduce((sum, m) => sum + m.ipk, 0);
    const average = totalGPA / dataMahasiswa.length;
    averageGPA.textContent = average.toFixed(2);
}

// ================= LOCALSTORAGE FUNCTIONS =================
function saveData() {
    try {
        // Simpan data ke localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataMahasiswa));
        currentFilteredData = [...dataMahasiswa];
        console.log("Data berhasil disimpan:", dataMahasiswa.length, "records");
    } catch (error) {
        console.error("Error saving to localStorage:", error);
        showToast("Gagal menyimpan data", "error");
    }
}

// Tambahkan fungsi untuk clear data (opsional)
function clearAllData() {
    if (confirm("Apakah Anda yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan!")) {
        localStorage.removeItem(STORAGE_KEY);
        dataMahasiswa = [];
        currentFilteredData = [];
        displayData();
        updateStats();
        showToast("Semua data telah dihapus", "success");
    }
}

// ================= MODAL FUNCTIONS =================
function closeModal() {
    document.getElementById('editModal').classList.remove('active');
}

// ================= EXPORT FUNCTION =================
function exportData() {
    if (dataMahasiswa.length === 0) {
        showToast("Tidak ada data untuk diexport", "warning");
        return;
    }
    
    const dataStr = JSON.stringify(dataMahasiswa, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `data-mahasiswa-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast("Data berhasil diexport ke JSON", "success");
}

// ================= TAMBAHAN FITUR BARU =================
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                // Validasi data yang diimport
                const validData = importedData.filter(item => 
                    item.nim && item.nama && item.jurusan && item.ipk
                );
                
                if (validData.length > 0) {
                    // Konversi ke instance Mahasiswa
                    const newStudents = validData.map(item => 
                        new Mahasiswa(item.nim, item.nama, item.jurusan, item.ipk)
                    );
                    
                    // Tambah ke data yang ada
                    dataMahasiswa.push(...newStudents);
                    saveData();
                    displayData();
                    updateStats();
                    showToast(`Berhasil mengimport ${newStudents.length} data`, "success");
                } else {
                    showToast("File tidak berisi data yang valid", "error");
                }
            } catch (error) {
                showToast("Format file tidak valid", "error");
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// ================= DEBUG FUNCTIONS =================
function debugData() {
    console.log("=== DEBUG INFO ===");
    console.log("Data count:", dataMahasiswa.length);
    console.log("Data in localStorage:", localStorage.getItem(STORAGE_KEY));
    console.log("Current data:", dataMahasiswa);
    console.log("==================");
}

// ================= INITIALIZATION =================
function initializeApp() {
    console.log("Aplikasi dimulai...");
    
    // 1. Load data dari localStorage
    loadDataFromStorage();
    
    // 2. Tampilkan data
    displayData();
    updateStats();
    updateDisplayCount();
    
    // 3. Setup event listeners
    setupEventListeners();
    
    // 4. Tampilkan pesan selamat datang
    setTimeout(() => {
        if (dataMahasiswa.length === 0) {
            showToast("Selamat datang! Tambahkan data mahasiswa pertama Anda.", "info");
        } else {
            showToast(`Selamat datang! ${dataMahasiswa.length} data mahasiswa tersedia.`, "success");
        }
    }, 500);
}

function setupEventListeners() {
    // Button event listeners
    document.getElementById('btnTambah').addEventListener('click', addStudent);
    document.getElementById('btnReset').addEventListener('click', resetForm);
    document.getElementById('btnSearch').addEventListener('click', searchData);
    document.getElementById('btnSort').addEventListener('click', performSort);
    document.getElementById('btnResetFilter').addEventListener('click', resetSearch);
    document.getElementById('btnExport').addEventListener('click', exportData);
    document.getElementById('btnCloseModal').addEventListener('click', closeModal);
    
    // Tambah tombol import
    const exportBtn = document.getElementById('btnExport');
    const importBtn = document.createElement('button');
    importBtn.className = 'btn btn-sm btn-warning';
    importBtn.innerHTML = '<i class="fas fa-upload"></i> Import';
    importBtn.onclick = importData;
    exportBtn.parentNode.insertBefore(importBtn, exportBtn.nextSibling);
    
    // Tambah tombol clear all
    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn btn-sm btn-danger';
    clearBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Clear All';
    clearBtn.onclick = clearAllData;
    exportBtn.parentNode.insertBefore(clearBtn, exportBtn.nextSibling);
    
    // Enter key in search field
    document.getElementById('keyword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchData();
        }
    });
    
    // Enter key in form fields
    ['nim', 'nama', 'jurusan', 'ipk'].forEach(fieldId => {
        document.getElementById(fieldId).addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addStudent();
            }
        });
    });
    
    // Table header click events
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', function() {
            const column = this.getAttribute('data-sort');
            sortTable(column);
        });
    });
    
    // Modal close on outside click
    document.getElementById('editModal').addEventListener('click', function(event) {
        if (event.target === this) {
            closeModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl + Enter to add data
        if (e.ctrlKey && e.key === 'Enter') {
            addStudent();
            e.preventDefault();
        }
        
        // Ctrl + F to focus search
        if (e.ctrlKey && e.key === 'f') {
            document.getElementById('keyword').focus();
            e.preventDefault();
        }
        
        // Escape to close modal
        if (e.key === 'Escape') {
            closeModal();
        }
        
        // Ctrl + S to save/export
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            exportData();
        }
    });
    
    // Auto-focus NIM field on load
    document.getElementById('nim').focus();
    
    // Debug button (optional)
    const debugBtn = document.createElement('button');
    debugBtn.className = 'btn btn-sm btn-secondary';
    debugBtn.innerHTML = '<i class="fas fa-bug"></i> Debug';
    debugBtn.onclick = debugData;
    debugBtn.style.position = 'fixed';
    debugBtn.style.bottom = '10px';
    debugBtn.style.right = '10px';
    debugBtn.style.zIndex = '1000';
    document.body.appendChild(debugBtn);
}

// ================= START APPLICATION =================
document.addEventListener('DOMContentLoaded', initializeApp);

// ================= TAMBAH STYLE INLINE =================
// Tambahkan style untuk ipk-cell jika tidak ada di CSS
const style = document.createElement('style');
style.textContent = `
    .ipk-cell {
        font-weight: 600;
        color: #3a0ca3;
    }
    
    .action-cell {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }
    
    @media (max-width: 768px) {
        .action-cell {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(style);

// ================= IMPORT DATA DARI FILE =================
function importFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Validasi format data
                const validData = importedData.filter(item => {
                    return item.nim && item.nama && item.jurusan && item.ipk;
                });
                
                if (validData.length === 0) {
                    showToast("File tidak berisi data yang valid", "error");
                    return;
                }
                
                // Konfirmasi import
                if (confirm(`Import ${validData.length} data dari file?\nData saat ini akan digantikan.`)) {
                    // Konversi ke instance Mahasiswa
                    dataMahasiswa = validData.map(item => 
                        new Mahasiswa(item.nim, item.nama, item.jurusan, item.ipk)
                    );
                    
                    saveData();
                    displayData();
                    updateStats();
                    
                    showToast(`Berhasil mengimport ${validData.length} data mahasiswa`, "success");
                }
            } catch (error) {
                console.error("Import error:", error);
                showToast("Format file tidak valid. Pastikan file JSON benar.", "error");
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// ================= TAMBAH TOMBOL IMPORT DI UI =================
// Tambahkan di fungsi setupEventListeners():
function setupEventListeners() {
    // ... kode yang ada ...
    
    // Tambah tombol Import di samping Export
    const exportBtn = document.getElementById('btnExport');
    const importBtn = document.createElement('button');
    importBtn.className = 'btn btn-sm btn-warning';
    importBtn.innerHTML = '<i class="fas fa-file-import"></i> Import Data';
    importBtn.onclick = importFromFile;
    exportBtn.parentNode.insertBefore(importBtn, exportBtn);
    
    // ... kode lainnya ...
}