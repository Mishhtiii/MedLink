document.addEventListener('DOMContentLoaded', () => {
  const paymentBtn = document.getElementById('complete-payment-btn');

  paymentBtn.addEventListener('click', async () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
      alert('No items in cart to purchase.');
      return;
    }

    try {
      const response = await fetch('/api/users/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ medicines: cart })
      });

      if (response.ok) {
        alert('✅ Payment done successfully! Medicines added to your profile.');
        localStorage.removeItem('cart');
        window.location.href = '/pharmacy';
      } else {
        alert('Error processing payment. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing payment. Please try again.');
    }
  });
});
