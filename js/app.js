/**
 * Etmek | Premium Dresses - Main Application Script
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Header Scroll Effect ---
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const closeMenuBtn = document.querySelector('.close-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');

    function toggleMenu() {
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMenu);
    }

    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', toggleMenu);
    }

    // Close menu when a link is clicked
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', toggleMenu);
    });

    // --- Cart System ---
    const cartBtn = document.querySelector('.cart-btn');
    const closeCartBtn = document.querySelector('.close-cart-btn');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const overlay = document.querySelector('.overlay');
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartCountElement = document.querySelector('.cart-count');
    const totalPriceElement = document.querySelector('.total-price');
    const emptyCartMsg = `<div class="empty-cart-message">Your bag is empty.</div>`;

    // Cart state
    let cart = [];

    // Toggle Cart
    function toggleCart() {
        cartSidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = cartSidebar.classList.contains('active') ? 'hidden' : '';
    }

    if (cartBtn) cartBtn.addEventListener('click', toggleCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if (overlay) overlay.addEventListener('click', toggleCart);

    // Add to Cart
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productData = e.target.dataset;
            const product = {
                id: productData.id,
                name: productData.name,
                price: parseFloat(productData.price),
                image: productData.img,
                quantity: 1
            };

            addToCart(product);
            toggleCart(); // Open cart to show user
        });
    });

    function addToCart(product) {
        const existingItemIndex = cart.findIndex(item => item.id === product.id);

        if (existingItemIndex !== -1) {
            // Already in cart, prototype behavior: increment qty, wait we don't have qty in snippet, let's keep it simple
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push(product);
        }

        updateCartUI();
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
    }

    function updateCartUI() {
        // Update Count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;

        // Update Total
        const totalCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalPriceElement.textContent = `₹${totalCost.toLocaleString('en-IN')}`;

        // Render Items
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = emptyCartMsg;
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <span class="cart-item-price">₹${item.price.toLocaleString('en-IN')} ${item.quantity > 1 ? `(x${item.quantity})` : ''}</span>
                        <button class="remove-item-btn" data-id="${item.id}">Remove</button>
                    </div>
                </div>
            `).join('');

            // Attach remove listeners
            document.querySelectorAll('.remove-item-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    removeFromCart(e.target.dataset.id);
                });
            });
        }
    }

    // --- Payment System Integration ---
    const checkoutBtn = document.querySelector('.checkout-btn');
    const paymentModalOverlay = document.getElementById('paymentModal');
    const closePaymentBtn = document.getElementById('closePaymentBtn');
    const paymentTotalAmount = document.querySelector('.payment-total-amount');
    const paymentForm = document.getElementById('paymentForm');
    const paymentFormBody = document.getElementById('paymentFormBody');
    const paymentSuccess = document.getElementById('paymentSuccess');
    const submitPaymentBtn = document.getElementById('submitPaymentBtn');
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');

    // Basic input formatting for credit card
    const cardInput = document.querySelector('.card-number');
    const expiryInput = document.querySelector('.card-expiry');

    if (cardInput) {
        cardInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(.{4})/g, '$1 ').trim();
            e.target.value = value;
        });
    }

    if (expiryInput) {
        expiryInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 2) {
                value = value.substring(0, 2) + ' / ' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }

    // Handle payment method toggling
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const cardPaymentDetails = document.getElementById('cardPaymentDetails');
    const upiPaymentDetails = document.getElementById('upiPaymentDetails');
    const codPaymentDetails = document.getElementById('codPaymentDetails');

    // Required inputs for validation
    const cardInputs = cardPaymentDetails ? cardPaymentDetails.querySelectorAll('input') : [];
    const upiInputs = upiPaymentDetails ? upiPaymentDetails.querySelectorAll('input') : [];

    function togglePaymentDetails() {
        if (!cardPaymentDetails) return;

        // Hide all initially
        cardPaymentDetails.style.display = 'none';
        upiPaymentDetails.style.display = 'none';
        codPaymentDetails.style.display = 'none';

        // Remove required attribute from all
        cardInputs.forEach(input => input.removeAttribute('required'));
        upiInputs.forEach(input => input.removeAttribute('required'));

        // Show appropriate section based on selected radio
        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

        if (selectedMethod === 'card') {
            cardPaymentDetails.style.display = 'block';
            cardInputs.forEach(input => input.setAttribute('required', 'required'));
            submitPaymentBtn.querySelector('.btn-text').textContent = 'Pay ₹' + currentPaymentTotal;
        } else if (selectedMethod === 'upi') {
            upiPaymentDetails.style.display = 'block';
            upiInputs.forEach(input => input.setAttribute('required', 'required'));
            submitPaymentBtn.querySelector('.btn-text').textContent = 'Pay ₹' + currentPaymentTotal;
        } else if (selectedMethod === 'cod') {
            codPaymentDetails.style.display = 'block';
            submitPaymentBtn.querySelector('.btn-text').textContent = 'Place Order';
        }
    }

    if (paymentMethods) {
        paymentMethods.forEach(method => {
            method.addEventListener('change', togglePaymentDetails);
        });
    }

    let currentPaymentTotal = "0";

    function openPaymentModal() {
        if (cart.length === 0) {
            alert('Your bag is empty! Please add some items before checking out.');
            return;
        }

        // Close cart sidebar
        cartSidebar.classList.remove('active');
        // Overlay stays for the modal, or we rely on modal's own overlay
        overlay.classList.remove('active');

        // Update payment total
        const totalCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        currentPaymentTotal = totalCost.toLocaleString('en-IN');
        paymentTotalAmount.textContent = `₹${currentPaymentTotal}`;

        // Reset modal state
        paymentFormBody.style.display = 'block';
        paymentSuccess.style.display = 'none';
        paymentForm.reset();

        togglePaymentDetails();

        submitPaymentBtn.querySelector('.loader').style.display = 'none';
        submitPaymentBtn.disabled = false;

        paymentModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closePaymentModal() {
        paymentModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (checkoutBtn) checkoutBtn.addEventListener('click', openPaymentModal);
    if (closePaymentBtn) closePaymentBtn.addEventListener('click', closePaymentModal);

    // Initialize EmailJS (Replace with your actual Public Key)
    // emailjs.init("YOUR_PUBLIC_KEY");

    // Handle form submission
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Show loading state
            submitPaymentBtn.disabled = true;
            submitPaymentBtn.querySelector('.btn-text').textContent = 'Processing...';
            submitPaymentBtn.querySelector('.loader').style.display = 'inline-block';

            // Simulate network request for payment processing
            setTimeout(() => {
                const userEmail = document.getElementById('email').value;
                const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

                // --- EmailJS Integration ---
                /* 
                const templateParams = {
                    to_email: userEmail,
                    order_total: currentPaymentTotal,
                    payment_method: selectedMethod,
                };
                
                emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
                    .then(function(response) {
                       console.log('SUCCESS!', response.status, response.text);
                    }, function(error) {
                       console.log('FAILED...', error);
                    });
                */

                paymentFormBody.style.display = 'none';
                paymentSuccess.style.display = 'flex';

                if (selectedMethod === 'cod') {
                    paymentSuccess.querySelector('h3').textContent = 'Order Placed!';
                    paymentSuccess.querySelector('p').textContent = `Thank you for your order. We will send an email confirmation to ${userEmail}. You can pay with cash upon delivery.`;
                } else {
                    paymentSuccess.querySelector('h3').textContent = 'Payment Successful!';
                    paymentSuccess.querySelector('p').textContent = `Thank you for your purchase. We have sent your order confirmation to ${userEmail}.`;
                }

                // Clear cart after successful payment
                cart = [];
                updateCartUI();

                // Keep the success message visible for a moment before they hit continue
            }, 2500);
        });
    }

    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            closePaymentModal();
            // Scroll smoothly to shop section
            const shopSection = document.getElementById('shop');
            if (shopSection) {
                shopSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});
