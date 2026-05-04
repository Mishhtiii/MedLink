document.addEventListener("DOMContentLoaded", function () {
    loadCart(); 
    document.getElementById("clear-cart-btn").addEventListener("click", clearCart); 
    const buyBtn = document.getElementById("buy-btn");
    if (buyBtn) {
        buyBtn.addEventListener("click", function () {
            fetch('/api/users/user')
                .then(response => response.json())
                .then(data => {
                    if (data.user) {
                        window.location.href = '/payment';
                    } else {
                        alert('Please log in to proceed with the purchase.');
                    }
                })
                .catch(() => {
                    alert('Error checking login status. Please try again.');
                });
        });
    }
});

function loadCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    cartItems.innerHTML = '';
    let total = 0;
    let oldTotal = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty.</p>';
        cartTotal.innerHTML = '';
        return;
    }

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        const itemOldTotal = item.oldPrice * item.quantity;
        total += itemTotal;
        oldTotal += itemOldTotal;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";

        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>Price: ₹${(item.price * item.quantity).toFixed(2)} <span class="old-price">₹${(item.oldPrice * item.quantity).toFixed(2)}</span></p>
                <p>Quantity: 
                    <button class="decrease-btn" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase-btn" data-index="${index}">+</button>
                </p>
            </div>
            <button class="remove-btn" data-index="${index}">Remove</button>
        `;

        cartItems.appendChild(cartItem);
    });

    const savedAmount = oldTotal - total;
    cartTotal.innerHTML = `
        Total: ₹${total.toFixed(2)} <span class="old-price">₹${oldTotal.toFixed(2)}</span>
        <br>
        <span class="saved-amount">You saved: ₹${savedAmount.toFixed(2)}</span>
    `;

    document.querySelectorAll(".increase-btn").forEach(button => {
        button.addEventListener("click", () => {
            const index = button.getAttribute("data-index");
            increaseQuantity(index);
        });
    });

    document.querySelectorAll(".decrease-btn").forEach(button => {
        button.addEventListener("click", () => {
            const index = button.getAttribute("data-index");
            decreaseQuantity(index);
        });
    });

    document.querySelectorAll(".remove-btn").forEach(button => {
        button.addEventListener("click", () => {
            const index = button.getAttribute("data-index");
            removeItem(index);
        });
    });
}

function clearCart() {
    localStorage.removeItem("cart");
    document.getElementById("cart-items").innerHTML = '<p>Your cart is empty.</p>';
    document.getElementById("cart-total").innerHTML = '';
    updateCartCount();
}

function increaseQuantity(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart[index]) {
        cart[index].quantity += 1;
        localStorage.setItem("cart", JSON.stringify(cart));
        loadCart();
        updateCartCount();
    }
}

function decreaseQuantity(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart[index] && cart[index].quantity > 1) {
        cart[index].quantity -= 1;
        localStorage.setItem("cart", JSON.stringify(cart));
        loadCart();
        updateCartCount();
    }
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart[index]) {
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        loadCart();
        updateCartCount();
    }
}
