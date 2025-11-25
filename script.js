// Tunggu HTML siap dulu baru jalanin script
document.addEventListener("DOMContentLoaded", function () {
  // --- 1. SIDEBAR TOGGLE & ACTIVE STATE ---
  let list = document.querySelectorAll(".navigation li");

  function activeLink() {
    list.forEach((item) => {
      item.classList.remove("hovered");
    });
    this.classList.add("hovered");
  }

  list.forEach((item) => item.addEventListener("click", activeLink));

  // Toggle Menu
  let toggle = document.querySelector(".toggle");
  let navigation = document.querySelector(".navigation");
  let main = document.querySelector(".main");

  if (toggle) {
    toggle.onclick = function () {
      navigation.classList.toggle("active");
      main.classList.toggle("active");
    };
  }

  // --- 2. CHART CONFIGURATION (DOUGHNUT) ---
  // Cek apakah elemen canvas ada biar gak error
  const chartCanvas = document.getElementById("myChart");

  if (chartCanvas) {
    const ctx = chartCanvas.getContext("2d");

    // Hapus chart lama kalau ada (biar gak numpuk/bug)
    if (window.myDashboardChart) {
      window.myDashboardChart.destroy();
    }

    window.myDashboardChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Organik", "Hidroponik", "Lokal", "Impor"], // Label Sayur
        datasets: [
          {
            label: "Sumber Penjualan",
            data: [1500, 1200, 3500, 500],
            backgroundColor: [
              "#8de02c", // Hijau Segar
              "#6366f1", // Indigo
              "#e9b10a", // Kuning
              "#f00", // Merah
            ],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Biar ngikutin ukuran kotak
        cutout: "75%", // Lubang tengah
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12,
              },
            },
          },
        },
      },
    });
  }
});
