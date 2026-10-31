// ==========================================
// Maison de Jun- E-COMMERCE CORE SCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    console.log("FourthTech E-Commerce Engine Ready!");

    // Inisialisasi Fitur
    updateCartCount();
    initBeliButtons();
    initContactForm();
    renderCart();
});

// Ambil data keranjang dari memori browser (localStorage)
function getCart() {
    return JSON.parse(localStorage.getItem("fourthtech_cart")) || [];
}

// ------------------------------------------
// 1. CUSTOM TOAST NOTIFICATION (Tanpa 127.0.0.1)
// ------------------------------------------
function showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `custom-toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✅' : 'ℹ️'}</span>
        <span class="toast-msg">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");
    }, 100);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ------------------------------------------
// 2. NAVIGASI KERANJANG & BADGE COUNT
// ------------------------------------------
function updateCartCount() {
    const cart = getCart();
    const countElement = document.getElementById("cart-count");
    if (countElement) {
        countElement.innerText = cart.length;
    }
}

// ------------------------------------------
// 3. TOMBOL BELI (PEMILIHAN PRODUK)
// ------------------------------------------
function initBeliButtons() {
    const buttons = document.querySelectorAll(".card button, .btn-beli");

    buttons.forEach(function (button) {
        // Biarkan submit form kontak ditangani terpisah
        if (button.getAttribute("type") === "submit") return;

        button.addEventListener("click", function (event) {
            const card = event.target.closest(".card");
            if (!card) return;

            const nama = card.querySelector("h3") ? card.querySelector("h3").innerText : "Produk";
            const hargaTeks = card.querySelector("strong") ? card.querySelector("strong").innerText : "Rp0";
            const harga = parseInt(hargaTeks.replace(/[^0-9]/g, "")) || 0;
            const imgElement = card.querySelector("img");
            const img = imgElement ? imgElement.src : "images/produk1.jpg";

            const cart = getCart();
            cart.push({ nama, harga, img });
            localStorage.setItem("fourthtech_cart", JSON.stringify(cart));

            updateCartCount();
            showToast(`<b>${nama}</b> berhasil dimasukkan ke keranjang!`);
        });
    });
}


function renderCart() {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalContainer = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkout-btn");

    if (!cartItemsContainer) return;

    const cart = getCart();

    // JIKA KERANJANG KOSONG
    if (cart.length === 0) {
        cartItemsContainer.innerHTML =
            `<p class="empty-msg">Keranjang belanja Anda masih kosong.</p>`;

        if (cartTotalContainer) {
            cartTotalContainer.innerText = "Rp0";
        }

        // Nonaktifkan tombol checkout
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.onclick = null;
        }

        return;
    }

    let html = "";
    let total = 0;

    cart.forEach(function (item, index) {
        total += item.harga;

        html += `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.nama}">
                <div class="item-info">
                    <h4>${item.nama}</h4>
                    <p>Rp${item.harga.toLocaleString("id-ID")}</p>
                </div>
                <button onclick="hapusItem(${index})" class="btn-hapus">
                    ❌ Hapus
                </button>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = html;

    if (cartTotalContainer) {
        cartTotalContainer.innerText =
            "Rp" + total.toLocaleString("id-ID");
    }

    // Aktifkan tombol checkout jika keranjang berisi produk
    if (checkoutBtn) {
        checkoutBtn.disabled = false;

        checkoutBtn.onclick = function () {
            const cartTerbaru = getCart();

            if (cartTerbaru.length === 0) {
                renderCart();
                showToast("Keranjang Anda masih kosong!", "error");
                return;
            }

            const totalTerbaru = cartTerbaru.reduce(
                (sum, item) => sum + item.harga, 0
            );

            openPaymentModal(totalTerbaru);
        };
    }
}


// Hapus item dari keranjang
function hapusItem(index) {
    const cart = getCart();
    const itemNama = cart[index].nama;
    cart.splice(index, 1);
    localStorage.setItem("fourthtech_cart", JSON.stringify(cart));
    renderCart();
    updateCartCount();
    showToast(`${itemNama} dihapus dari keranjang.`, "error");
}

// ------------------------------------------
// 5. KONTROL MODAL PEMBAYARAN
// ------------------------------------------
function openPaymentModal(total) {
    const modal = document.getElementById("payment-modal");
    const modalTotal = document.getElementById("modal-total-bayar");
    const paymentSelection = document.getElementById("payment-selection");
    const paymentDetail = document.getElementById("payment-detail");

    if (!modal || !modalTotal || !paymentSelection || !paymentDetail) {
        console.error("Elemen pembayaran tidak ditemukan!");
        return;
    }

    modalTotal.innerText = "Rp" + total.toLocaleString("id-ID");

    paymentSelection.style.display = "block";
    paymentDetail.style.display = "none";

    modal.classList.add("active");
}

function closePaymentModal() {
    const modal = document.getElementById("payment-modal");
    if (modal) modal.classList.remove("active");
}

function updateEmoji(emoji) {
    const selectedEmoji = document.getElementById("selected-emoji");
    const btnEmoji = document.getElementById("btn-emoji");
    
    if (selectedEmoji) selectedEmoji.innerText = emoji;
    if (btnEmoji) btnEmoji.innerText = emoji;
}



// ==========================================
// TAHAP PEMBAYARAN
// ==========================================

function lanjutDetailPembayaran() {
    const selectedRadio = document.querySelector(
        'input[name="payment_method"]:checked'
    );

    if (!selectedRadio) {
        showToast("Silakan pilih metode pembayaran!", "error");
        return;
    }

    const method = selectedRadio.value;
    const instruction = document.getElementById("payment-instruction");
    const bankField = document.getElementById("bank-field");
    const bankSelect = document.getElementById("customer-bank");
    const accountInput = document.getElementById("customer-account");

    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.harga, 0);
    const totalFormat = "Rp" + total.toLocaleString("id-ID");

    if (method === "QRIS") {
        bankField.style.display = "none";
        bankSelect.required = false;
        bankSelect.value = "";
        accountInput.required = false;

        instruction.innerHTML = `
            <div class="payment-instruction-card">
                <p class="instruction-label">Metode Pembayaran</p>
                <h4>📱 Pembayaran QRIS</h4>
                <p class="account-owner">
                    QRIS dapat digunakan melalui aplikasi pembayaran
                    digital seperti GoPay, OVO, DANA, dan ShopeePay.
                </p>
                <div class="payment-total">
                    <span>Total Pembayaran</span>
                    <strong>${totalFormat}</strong>
                </div>
                
            
        `;
    } else {
        bankField.style.display = "flex";
        bankSelect.required = true;
        accountInput.required = true;

        instruction.innerHTML = `
            <div class="payment-instruction-card">
                <p class="instruction-label">Metode Pembayaran</p>
                <h4>🏦 Transfer Bank</h4>
                <p class="account-owner">
                    Silakan pilih bank yang digunakan pada formulir
                    informasi pembeli.
                </p>
                <div class="payment-total">
                    <span>Total Transfer</span>
                    <strong>${totalFormat}</strong>
                </div>
                
        `;
    }

    document.getElementById("payment-selection").style.display = "none";
    document.getElementById("payment-detail").style.display = "block";
}


// KEMBALI KE PILIHAN METODE
function kembaliPilihMetode() {
    document.getElementById("payment-detail").style.display = "none";
    document.getElementById("payment-selection").style.display = "block";
}


// KONFIRMASI PEMBAYARAN
function prosesBayar() {
    const nama = document.getElementById("customer-name").value.trim();
    const bank = document.getElementById("customer-bank").value;
    const rekening = document.getElementById("customer-account").value.trim();

    const selectedRadio = document.querySelector(
        'input[name="payment_method"]:checked'
    );

    if (!nama) {
        showToast("Masukkan nama lengkap terlebih dahulu!", "error");
        return;
    }

    if (!selectedRadio) {
        showToast("Silakan pilih metode pembayaran!", "error");
        return;
    }

    const method = selectedRadio.value;

    if (method !== "QRIS" && !bank) {
        showToast("Silakan pilih bank yang digunakan!", "error");
        return;
    }

    if (method !== "QRIS" && !rekening) {
        showToast("Masukkan nomor rekening contoh!", "error");
        return;
    }

    if (rekening && !/^[0-9]{6,20}$/.test(rekening)) {
        showToast("Nomor rekening contoh harus 6-20 angka!", "error");
        return;
    }

    const cart = getCart();

    if (cart.length === 0) {
        showToast("Keranjang belanja masih kosong!", "error");
        return;
    }

    const metodeDipilih = method === "QRIS"
        ? "QRIS"
        : "Transfer Bank " + bank;

    // Kosongkan keranjang
    localStorage.removeItem("fourthtech_cart");

    // Reset formulir
    document.getElementById("customer-name").value = "";
    document.getElementById("customer-bank").value = "";
    document.getElementById("customer-account").value = "";

    // Kembalikan tampilan modal
    document.getElementById("payment-detail").style.display = "none";
    document.getElementById("payment-selection").style.display = "block";
    document.getElementById("bank-field").style.display = "flex";

    // Kembalikan pilihan ke QRIS
    const qris = document.querySelector(
        'input[name="payment_method"][value="QRIS"]'
    );

    if (qris) {
        qris.checked = true;
        updateEmoji("📱");
    }

    closePaymentModal();

    showToast(
        `Pesanan ${nama} berhasil dibuat melalui ${metodeDipilih}!`,
        "success"
    );

    renderCart();
    updateCartCount();
}



// ------------------------------------------
// 6. FORM KONTAK INTERAKTIF
// ------------------------------------------
function initContactForm() {
    const form = document.getElementById("contactForm");

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const nama = document.getElementById("nama") ? document.getElementById("nama").value : "Pengunjung";
            const submitBtn = form.querySelector("button[type='submit']");
            const originalText = submitBtn ? submitBtn.innerText : "Kirim Pesan";
            
            if (submitBtn) {
                submitBtn.innerText = "Mengirim...";
                submitBtn.disabled = true;
            }

            setTimeout(function () {
                showToast(`Pesan dari <b>${nama}</b> berhasil dikirim!`, "success");
                form.reset();

                if (submitBtn) {
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                }
            }, 800);
        });
    }
}
document.addEventListener("DOMContentLoaded", function () {

    // =================================
    // TEKS KECIL BERGANTI OTOMATIS
    // =================================

    const changingText = document.getElementById("changing-text");

    const labels = [
        "TECHNOLOGY FOR YOUR FUTURE",
        "UPGRADE YOUR EXPERIENCE",
        "DISCOVER YOUR DIGITAL WORLD",
        "INNOVATION STARTS HERE"
    ];

    let labelIndex = 0;

    if (changingText) {
        changingText.style.transition = "opacity 0.35s ease";

        setInterval(function () {

            changingText.style.opacity = "0";

            setTimeout(function () {
                labelIndex = (labelIndex + 1) % labels.length;

                changingText.textContent = labels[labelIndex];
                changingText.style.opacity = "1";

            }, 350);

        }, 2800);
    }


    // =================================
    // JUDUL BERGANTI DENGAN EFEK SLIDE
    // =================================

    const changingTitle = document.getElementById("changing-title");

    const titles = [
        "Beyond Limits.",
        "Think Smarter.",
        "Create More.",
        "Go Further."
    ];

    let titleIndex = 0;

    if (changingTitle) {
        setInterval(function () {

            changingTitle.classList.add("changing");

            setTimeout(function () {

                titleIndex = (titleIndex + 1) % titles.length;

                changingTitle.textContent = titles[titleIndex];

                changingTitle.classList.remove("changing");

            }, 350);

        }, 3200);
    }


    // =================================
    // SLIDESHOW PRODUK
    // =================================

    const products = document.querySelectorAll(".hero-product");

    const slideNumber = document.getElementById("hero-slide-number");

    const progressBars = document.querySelectorAll(".slide-progress-bar");

    let productIndex = 0;

    function showProduct(index) {

        products.forEach(function (product) {
            product.classList.remove("active");
        });

        progressBars.forEach(function (bar) {
            bar.classList.remove("active");
        });

        products[index].classList.add("active");

        if (progressBars[index]) {
            progressBars[index].classList.add("active");
        }

        if (slideNumber) {
            slideNumber.textContent =
                String(index + 1).padStart(2, "0");
        }
    }

    if (products.length > 0) {

        showProduct(productIndex);

        setInterval(function () {

            productIndex = (productIndex + 1) % products.length;

            showProduct(productIndex);

        }, 3500);

    }

})