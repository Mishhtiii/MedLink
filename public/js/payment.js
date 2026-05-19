document.addEventListener("DOMContentLoaded", () => {
    const payButton = document.getElementById("complete-payment-btn");
    
    // LocalStorage se total amount get karein ya cart items read karein
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalPrice = 0;
    
    // Total price evaluate karein UI par update karne ke liye
    cart.forEach(item => {
        totalPrice += item.price * item.quantity;
    });

    const amtDisplay = document.getElementById("checkout-total-amt");
    if (amtDisplay) {
        amtDisplay.textContent = `₹${totalPrice.toFixed(2)}`;
    }

    if (payButton) {
        payButton.addEventListener("click", (e) => {
            e.preventDefault();

            if (cart.length === 0) {
                alert("Your shopping cart is empty. Back to pharmacy store.");
                window.location.href = "/pharmacy";
                return;
            }

            // Loader animation logic trigger
            payButton.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> Secure Handshake...`;
            payButton.disabled = true;

            setTimeout(() => {
                // Sandbox modal design framework injection
                const sandboxModalHtml = `
                <div class="modal fade show d-block" id="sandboxPaymentModal" tabindex="-1" style="background: rgba(0,0,0,0.6); z-index: 9999;">
                    <div class="modal-dialog modal-dialog-centered" style="max-width: 420px;">
                        <div class="modal-content border-0 rounded-4 shadow-lg text-start">
                            <div class="modal-header text-white rounded-top-4 p-3" style="background: linear-gradient(135deg, #00a8bd, #007a8c);">
                                <h5 class="modal-title fw-bold style-gateway-title h6 mb-0"><i class="fas fa-shield-alt me-2"></i> MedLink Gateway Sandbox</h5>
                                <button type="button" class="btn-close btn-close-white target-close-sandbox" aria-label="Close"></button>
                            </div>
                            <div class="modal-body p-4 bg-white">
                                <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                                    <div class="bg-light-teal p-2 rounded-3 text-info"><i class="fas fa-pills h5 mb-0"></i></div>
                                    <div>
                                        <h6 class="fw-bold text-dark mb-0">Pharmacy Orders Settlement</h6>
                                        <small class="text-muted">Environment Mode: <span class="text-danger fw-bold">EMULATION GATEWAY</span></small>
                                    </div>
                                </div>
                                <p class="small text-secondary mb-3">Simulate authentication ledger sequence securely without actual financial liabilities logs.</p>
                                
                                <div class="p-3 rounded-3 bg-light border mb-3">
                                    <div class="d-flex justify-content-between mb-1 small text-muted"><span>Billing Value:</span><span class="text-dark fw-bold">₹${totalPrice.toFixed(2)}</span></div>
                                    <div class="d-flex justify-content-between small text-muted"><span>Gateway Hash:</span><span class="text-dark small">MDL-${Math.floor(100000 + Math.random() * 900000)}</span></div>
                                </div>

                                <button id="simulateSuccessBtn" class="btn w-100 text-white rounded-3 mb-2 fw-medium" style="background-color: #28a745; border:0; padding:10px;">
                                    <i class="fas fa-check-circle me-1"></i> Authorize Test Transaction
                                </button>
                                <button id="simulateFailBtn" class="btn btn-outline-danger w-100 rounded-3 text-secondary fw-medium small" style="font-size:13px; padding:8px;">
                                    <i class="fas fa-times-circle me-1"></i> Cancel Checkout Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;

                document.body.insertAdjacentHTML('beforeend', sandboxModalHtml);

                // Revert trigger button configuration styles back to normal
                payButton.innerHTML = `<i class="fas fa-credit-card me-2"></i> Make Payment`;
                payButton.disabled = false;

                const closeModal = () => {
                    const modal = document.getElementById("sandboxPaymentModal");
                    if (modal) modal.remove();
                };

                document.querySelector(".target-close-sandbox").addEventListener("click", closeModal);
                document.getElementById("simulateFailBtn").addEventListener("click", () => {
                    closeModal();
                    alert("❌ Checkout flow stopped by patient authorization cancel loop.");
                });

                // Success Verification Handshake System
                document.getElementById("simulateSuccessBtn").addEventListener("click", async () => {
                    document.getElementById("simulateSuccessBtn").innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> Comitting Order to Ledger...`;
                    document.getElementById("simulateSuccessBtn").disabled = true;

                    // Mapped medicine structure array to align perfectly with userController.js purchaseMedicines schemas
                    const structuredMedicines = cart.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price * item.quantity,
                        image: item.image || "/images/unnamed.png",
                        date: new Date()
                    }));

                    try {
                        // Backend purchase API hit karenge data registers mein write karne ke liye
                        const response = await fetch("/api/users/purchase", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ medicines: structuredMedicines })
                        });
                        
                        const result = await response.json();
                        closeModal();

                        if (response.ok) {
                            alert("🎉 Payment Authorized! Digital pharmaceutical records added to ledger cards.");
                            localStorage.removeItem("cart"); // 🛒 Clean frontend shopping storage tokens
                            window.location.href = "/profile"; // Redirect straight onto dashboard history lists log page!
                        } else {
                            alert("Verification server rejected transaction schema: " + result.message);
                        }
                    } catch (error) {
                        console.error("Payment pipeline compilation exception:", error);
                        closeModal();
                        alert("Exception error occurred running signature checks pipelines.");
                    }
                });

            }, 600);
        });
    }
});