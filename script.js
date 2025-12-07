// --- 1. IMPORT FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- 2. CONFIG (PASTIIN INI BENER) ---
const firebaseConfig = {
  apiKey: "AIzaSyDLCBLIioTNjciMm5YZp4x_N337HleT04I",
  authDomain: "dashboard-sayurku.firebaseapp.com",
  projectId: "dashboard-sayurku",
  storageBucket: "dashboard-sayurku.firebasestorage.app",
  messagingSenderId: "832202550540",
  appId: "1:832202550540:web:e1b44ea5981ef3d30bed29",
  measurementId: "G-BK4PHMH3LB",
};

// --- 3. INITIALIZE (CUMA BOLEH SEKALI SEUMUR HIDUP SCRIPT) ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- 4. SECURITY CHECK (SATPAM) ---
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Kalau belum login, TENDANG KELUAR
    console.log("Bukan admin, redirecting...");
    window.location.href = "login.html";
  } else {
    // Kalau admin, biarin masuk
    console.log("Admin terdeteksi:", user.email);
  }
});

// --- 5. LOGIC CHART ---
let myChart;

function initChart() {
  const ctx = document.getElementById("myChart");
  if (!ctx) return;

  myChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: [
        "Selesai (Delivered)",
        "Proses (Pending)",
        "Dikemas (In Progress)",
        "Batal (Return)",
      ],
      datasets: [
        {
          label: "Jumlah Pesanan",
          data: [0, 0, 0, 0],
          backgroundColor: ["#8de02c", "#e9b10a", "#1795ce", "#ef4444"],
          borderWidth: 0,
          hoverOffset: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
    },
  });
}

function updateChart(dataPesanan) {
  if (!myChart) return;

  let stats = { delivered: 0, pending: 0, inprogress: 0, return: 0 };

  dataPesanan.forEach((item) => {
    const s = (item.status || "").toLowerCase();
    if (s === "delivered" || s === "terkirim" || s === "selesai")
      stats.delivered++;
    else if (s === "pending" || s === "proses") stats.pending++;
    else if (s === "inprogress" || s === "dikemas") stats.inprogress++;
    else if (s === "return" || s === "batal") stats.return++;
    else stats.pending++;
  });

  myChart.data.datasets[0].data = [
    stats.delivered,
    stats.pending,
    stats.inprogress,
    stats.return,
  ];
  myChart.update();
}

// --- 6. LOGIC DATA (CRUD) ---
async function ambilDataPesanan() {
  const tabelBody = document.getElementById("tabel-pesanan");

  // Loading state
  if (tabelBody)
    tabelBody.innerHTML =
      "<tr><td colspan='4' style='text-align:center;'>Sedang mengambil data...</td></tr>";

  try {
    const pesananRef = collection(db, "pesanan");
    // Sortir Tanggal Descending & Limit 10
    const q = query(pesananRef, orderBy("tanggal", "desc"), limit(10));
    const snapshot = await getDocs(q);

    // Kalau Kosong
    if (snapshot.empty) {
      if (tabelBody)
        tabelBody.innerHTML =
          "<tr><td colspan='4' style='text-align:center;'>Belum ada pesanan masuk.</td></tr>";
      updateChart([]);
      document.getElementById("totalTrans").innerText = "0";
      document.getElementById("totalDuit").innerText = "Rp 0";
      return;
    }

    let dataHasil = [];
    let totalTransaksi = 0;
    let totalPemasukan = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      data.id = doc.id;
      dataHasil.push(data);

      totalTransaksi++;
      const harga = parseInt(data.harga) || 0;
      totalPemasukan += harga;
    });

    // Update Kartu Atas
    const elTrans = document.getElementById("totalTrans");
    const elDuit = document.getElementById("totalDuit");
    const formatRupiah = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });

    if (elTrans) elTrans.innerText = totalTransaksi;
    if (elDuit) elDuit.innerText = formatRupiah.format(totalPemasukan);

    renderTabel(dataHasil);
    updateChart(dataHasil);
  } catch (error) {
    console.error("GAGAL AMBIL DATA:", error);
    // Kalau error karena index belum dibuat (biasa terjadi pas pertama kali pake orderBy)
    if (error.message.includes("requires an index")) {
      console.log("KLIK LINK DI CONSOLE BUAT BIKIN INDEX FIREBASE!");
    }
  }
}

function renderTabel(data) {
  const tabelBody = document.getElementById("tabel-pesanan");
  if (!tabelBody) return;

  tabelBody.innerHTML = "";
  const formatRupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  data.forEach((item) => {
    const nama = item.nama || "Tanpa Nama";
    const hargaRaw = parseInt(item.harga) || 0;
    const hargaFormatted = formatRupiah.format(hargaRaw);
    const bayar = item.bayar || "-";
    const status = item.status || "pending";
    const id = item.id;

    const barisHTML = `
      <tr>
        <td>${nama}</td>
        <td>${hargaFormatted}</td>
        <td>${bayar}</td>
        <td style="display: flex; gap: 5px;">
            <span class="status ${status}" style="margin-right: 10px;">${status}</span>
            <button onclick="editPesanan('${id}', '${nama}', '${hargaRaw}', '${status}')" style="background: #6366f1; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Edit</button>
            <button onclick="hapusPesanan('${id}')" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Hapus</button>
        </td>
      </tr>
    `;
    tabelBody.innerHTML += barisHTML;
  });
}

// --- 7. LOGIC MODAL & TOMBOL ---
const modal = document.getElementById("modalForm");
const modalTitle = document.getElementById("modalTitle");
const form = document.getElementById("formPesanan");
const inputId = document.getElementById("inputId");
const inputNama = document.getElementById("inputNama");
const inputHarga = document.getElementById("inputHarga");
const inputStatus = document.getElementById("inputStatus");

window.tambahPesananManual = function () {
  form.reset();
  inputId.value = "";
  modalTitle.innerText = "Tambah Pesanan Baru";
  modal.style.display = "block";
  inputNama.focus();
};

window.editPesanan = function (id, nama, harga, status) {
  inputId.value = id;
  inputNama.value = nama;
  inputHarga.value = harga;
  inputStatus.value = status.toLowerCase();
  modalTitle.innerText = "Edit Pesanan";
  modal.style.display = "block";
};

window.tutupModal = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) tutupModal();
};

window.prosesForm = async function (e) {
  e.preventDefault();
  const id = inputId.value;
  const nama = inputNama.value;
  const harga = parseInt(inputHarga.value);
  const status = inputStatus.value;

  try {
    if (!id) {
      await addDoc(collection(db, "pesanan"), {
        nama: nama,
        harga: harga,
        status: status,
        bayar: "Belum",
        tanggal: new Date().toISOString(),
      });
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data ditambahkan.",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      await updateDoc(doc(db, "pesanan", id), {
        nama: nama,
        harga: harga,
        status: status,
      });
      Swal.fire({
        icon: "success",
        title: "Terupdate!",
        text: "Data diubah.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
    tutupModal();
    ambilDataPesanan();
  } catch (error) {
    Swal.fire({ icon: "error", title: "Gagal!", text: error.message });
  }
};

window.hapusPesanan = function (id) {
  Swal.fire({
    title: "Yakin hapus?",
    text: "Gak bisa balik lagi loh!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    confirmButtonText: "Ya, Hapus!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "pesanan", id));
        Swal.fire("Dihapus!", "Data hilang.", "success");
        ambilDataPesanan();
      } catch (error) {
        Swal.fire("Error!", error.message, "error");
      }
    }
  });
};

window.logoutAdmin = function () {
  Swal.fire({
    title: "Keluar?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya",
  }).then((result) => {
    if (result.isConfirmed) {
      signOut(auth).catch((error) => console.error(error));
    }
  });
};

// --- 8. UI SETUP ---
function setupUI() {
  const toggle = document.querySelector(".toggle");
  const navigation = document.querySelector(".navigation");
  const main = document.querySelector(".main");

  if (toggle) {
    toggle.onclick = function () {
      navigation.classList.toggle("active");
      main.classList.toggle("active");
    };
  }

  // Search Logic
  const searchInput = document.querySelector(".search input");
  if (searchInput) {
    searchInput.addEventListener("keyup", function (e) {
      const term = e.target.value.toLowerCase();
      const rows = document.querySelectorAll("#tabel-pesanan tr");
      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? "" : "none";
      });
    });
  }
}

// --- 9. MAIN EXECUTION ---
document.addEventListener("DOMContentLoaded", () => {
  setupUI();
  initChart();
  ambilDataPesanan();
});
