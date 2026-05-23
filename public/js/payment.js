document.addEventListener("DOMContentLoaded", () => {
    const payButton = document.getElementById("complete-payment-btn");
    
    // Retrieve cart items from LocalStorage
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalPrice = 0;
    
    // Calculate total price to update the UI
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
                alert("Your shopping cart is empty. Returning to the pharmacy store.");
                window.location.href = "/pharmacy";
                return;
            }

            // Trigger loading animation on the button
            payButton.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> Processing Payment...`;
            payButton.disabled = true;

            setTimeout(() => {
                // Inject secure sandbox payment modal into the DOM
                const sandboxModalHtml = `
                <div class="modal fade show d-block" id="sandboxPaymentModal" tabindex="-1" style="background: rgba(0,0,0,0.6); z-index: 9999;">
                    <div class="modal-dialog modal-dialog-centered" style="max-width: 420px;">
                        <div class="modal-content border-0 rounded-4 shadow-lg text-start">
                            <div class="modal-header text-white rounded-top-4 p-3" style="background: linear-gradient(135deg, #00a8bd, #007a8c);">
                                <h5 class="modal-title fw-bold h6 mb-0"><i class="fas fa-shield-alt me-2"></i> MedLink Secure Payment Gateway</h5>
                                <button type="button" class="btn-close btn-close-white target-close-sandbox" aria-label="Close"></button>
                            </div>
                            <div class="modal-body p-4 bg-white">
                                
                                
                                <div class="p-3 rounded-3 bg-light border mb-3">
                                    <div class="d-flex justify-content-between mb-1 small text-muted"><span>Total Amount:</span><span class="text-dark fw-bold">₹${totalPrice.toFixed(2)}</span></div>
                                    <div class="d-flex justify-content-between small text-muted"><span>Transaction ID:</span><span class="text-dark small">TXN-${Math.floor(100000 + Math.random() * 900000)}</span></div>
                                </div>

                                <button id="simulateSuccessBtn" class="btn w-100 text-white rounded-3 mb-2 fw-medium" style="background-color: #28a745; border:0; padding:10px;">
                                    <i class="fas fa-check-circle me-1"></i> Authorize Payment
                                </button>
                                <button id="simulateFailBtn" class="btn btn-outline-danger w-100 rounded-3 text-secondary fw-medium small" style="font-size:13px; padding:8px;">
                                    <i class="fas fa-times-circle me-1"></i> Cancel Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;

                document.body.insertAdjacentHTML('beforeend', sandboxModalHtml);

                // Revert main checkout button configuration back to normal state
                payButton.innerHTML = `<i class="fas fa-credit-card me-2"></i> Pay Now`;
                payButton.disabled = false;

                const closeModal = () => {
                    const modal = document.getElementById("sandboxPaymentModal");
                    if (modal) modal.remove();
                };

                document.querySelector(".target-close-sandbox").addEventListener("click", closeModal);
                
                document.getElementById("simulateFailBtn").addEventListener("click", () => {
                    closeModal();
                    alert("❌ Payment cancelled by the user.");
                });

                // Handle successful payment simulation logic
                document.getElementById("simulateSuccessBtn").addEventListener("click", async () => {
                    const successBtn = document.getElementById("simulateSuccessBtn");
                    successBtn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> Placing Order...`;
                    successBtn.disabled = true;

                    // Map client cart data properties to perfectly align with your backend models
                    const structuredMedicines = cart.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price * item.quantity,
                        image: item.image || "/images/unnamed.png",
                        date: new Date()
                    }));

                    try {
                        // Submit purchase data array safely onto the server database route
                        const response = await fetch("/api/users/purchase", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ medicines: structuredMedicines })
                        });
                        
                        const result = await response.json();
                        closeModal();

                        if (response.ok) {
                            alert("🎉 Payment Successful! Your order has been placed successfully.");
                            localStorage.removeItem("cart"); // Clear frontend shopping cart storage
                            window.location.href = "/profile"; // Redirect to patient profile dashboard history logs
                        } else {
                            alert("Payment verification failed: " + result.message);
                        }
                    } catch (error) {
                        console.error("Payment submission error:", error);
                        closeModal();
                        alert("An error occurred while communicating with the payment server.");
                    }
                });

            }, 600);
        });
    }
});