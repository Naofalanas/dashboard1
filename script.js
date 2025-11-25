document.addEventListener("DOMContentLoaded", function () {
  console.log("Website siap! Script mulai jalan...");

  // --- 1. FUNGSI SIDEBAR (TOGGLE) ---
  const toggle = document.querySelector(".toggle");
  const navigation = document.querySelector(".navigation");
  const main = document.querySelector(".main");

  // Cek dulu tombolnya ada gak, biar gak error
  if (toggle) {
    toggle.onclick = function () {
      console.log("Tombol menu diklik!"); // Cek di Console (F12) kalau penasaran
      navigation.classList.toggle("active");
      main.classList.toggle("active");
    };
  } else {
    console.error("Tombol .toggle gak ketemu di HTML!");
  }

  // --- 2. FUNGSI MENU AKTIF (HOVER EFFECT) ---
  const list = document.querySelectorAll(".navigation li");
  function activeLink() {
    list.forEach((item) => item.classList.remove("hovered"));
    this.classList.add("hovered");
  }
  list.forEach((item) => item.addEventListener("click", activeLink));

  // --- 3. FUNGSI SEARCH (PENCARIAN TABEL) ---
  const searchInput = document.querySelector(".search input");
  const tableRows = document.querySelectorAll(".details table tbody tr");

  if (searchInput) {
    searchInput.addEventListener("keyup", function (e) {
      const term = e.target.value.toLowerCase();
      tableRows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? "" : "none";
      });
    });
  }

  // --- 4. GRAFIK DONAT (CHART.JS) ---
  const chartCanvas = document.getElementById("myChart");
  if (chartCanvas) {
    const ctx = chartCanvas.getContext("2d");

    // Hapus chart lama kalau ada (biar gak numpuk)
    if (window.myDashboardChart) {
      window.myDashboardChart.destroy();
    }

    window.myDashboardChart = new Chart(ctx, {
      type: "doughnut", // Tipe Donat
      data: {
        labels: ["Organik", "Hidroponik", "Lokal", "Impor"], // Label di bawah
        datasets: [
          {
            label: "Penjualan",
            data: [1500, 1200, 3500, 500], // Angka Data
            backgroundColor: [
              "#8de02c", // Hijau (Organik)
              "#6366f1", // Indigo (Hidroponik)
              "#e9b10a", // Kuning (Lokal)
              "#ef4444", // Merah (Impor)
            ],
            borderWidth: 0,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%", // Bikin bolong tengah
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              font: { family: "'Poppins', sans-serif", size: 12 },
            },
          },
        },
      },
    });
  }
});
