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
    const checkoutBtn = document.querySelector('.checkout-btn');
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

    // Add to Cart logic removed here, handled by dynamic products rendering
    // --- Product Fetching & Rendering ---
    const isLocalhost = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' || window.location.protocol === 'file:';
    const API_BASE = isLocalhost && window.location.port !== '3000' ? 'http://127.0.0.1:3000' : '';
    const productsGrid = document.getElementById('productsGrid');
    async function fetchProducts() {
        if (!productsGrid) return;
        try {
            const res = await fetch(API_BASE + '/api/products');
            const data = await res.json();
            if (data.products && data.products.length > 0) {
                productsGrid.innerHTML = data.products.map(p => `
                    <div class="product-card" style="background: #fff; border-radius: 4px; padding: 1rem; box-shadow: 0 1px 2px rgba(0,0,0,0.1); position: relative; transition: box-shadow 0.2s;">
                        <div class="product-img" style="aspect-ratio:3/4; overflow:hidden; margin-bottom: 1rem;">
                            <img src="${p.image_url ? (p.image_url.startsWith('http') ? p.image_url : API_BASE + '/' + p.image_url) : API_BASE + '/images/model1.jpg'}" alt="${p.name}" style="width:100%; height:100%; object-fit:cover; border-radius: 4px;">
                        </div>
                        <div class="product-info" style="text-align: left;">
                            <h4 class="product-title" style="font-weight: 500; font-size: 0.95rem; margin-bottom: 0.3rem;">${p.name}</h4>
                            <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 0.5rem;">₹${p.price.toLocaleString('en-IN')}</div>
                            <span style="font-size: 0.8rem; color: #878787;">Free delivery</span>
                        </div>
                        <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                            <button class="btn btn-secondary add-to-cart-btn" style="flex:1; padding: 0.6rem; font-size: 0.8rem; height: 36px; border-radius:4px;" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-img="${p.image_url ? (p.image_url.startsWith('http') ? p.image_url : API_BASE + '/' + p.image_url) : API_BASE + '/images/model1.jpg'}">Cart</button>
                            <button class="btn btn-primary buy-now-btn" style="flex:1; padding: 0.6rem; font-size: 0.8rem; height: 36px; border-radius:4px;" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-img="${p.image_url ? (p.image_url.startsWith('http') ? p.image_url : API_BASE + '/' + p.image_url) : API_BASE + '/images/model1.jpg'}">Buy Now</button>
                        </div>
                    </div>
                `).join('');
                attachProductListeners();
            } else {
                productsGrid.innerHTML = '<p>No products available yet. Check back soon!</p>';
            }
        } catch(e) {
            productsGrid.innerHTML = '<p>Failed to load products. Please ensure the backend server (node server.js) is running.</p>';
            console.error("Products fetch error:", e);
        }
    }
    fetchProducts();

    function attachProductListeners() {
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pd = e.target.dataset;
                addToCart({ id: pd.id, name: pd.name, price: parseFloat(pd.price), image: pd.img, quantity: 1 });
                toggleCart();
            });
        });
        document.querySelectorAll('.buy-now-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pd = e.target.dataset;
                cart = [{ id: pd.id, name: pd.name, price: parseFloat(pd.price), image: pd.img, quantity: 1 }];
                updateCartUI();
                if(typeof startCheckoutFlow === 'function') startCheckoutFlow();
            });
        });
    }

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

    // --- New Checkout & Orders Flow ---
    const shopSection = document.getElementById('shop');
    const heroSection = document.getElementById('hero');
    const collectionsSection = document.getElementById('collections');
    const checkoutSection = document.getElementById('checkoutSection');
    const myOrdersSection = document.getElementById('myOrdersSection');

    function hideAllSections() {
        if(shopSection) shopSection.style.display = 'none';
        if(heroSection) heroSection.style.display = 'none';
        if(collectionsSection) collectionsSection.style.display = 'none';
        if(document.getElementById('experience')) document.getElementById('experience').style.display = 'none';
        if(document.querySelector('.newsletter')) document.querySelector('.newsletter').style.display = 'none';
        if(checkoutSection) checkoutSection.style.display = 'none';
        if(myOrdersSection) myOrdersSection.style.display = 'none';
    }

    function showMainSections() {
        if(shopSection) shopSection.style.display = 'block';
        if(heroSection) heroSection.style.display = 'flex';
        if(collectionsSection) collectionsSection.style.display = 'block';
        if(document.getElementById('experience')) document.getElementById('experience').style.display = 'block';
        if(document.querySelector('.newsletter')) document.querySelector('.newsletter').style.display = 'block';
        if(checkoutSection) checkoutSection.style.display = 'none';
        if(myOrdersSection) myOrdersSection.style.display = 'none';
    }
    
    document.querySelectorAll('.go-back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showMainSections();
            window.scrollTo(0,0);
        });
    });

    let currentPaymentTotal = 0;
    
    function startCheckoutFlow() {
        if (cart.length === 0) {
            alert('Your bag is empty!');
            return;
        }
        cartSidebar.classList.remove('active');
        if(overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Ensure user is logged in
        if (!localStorage.getItem('etmek_jwt')) {
            alert('Please login to checkout');
            document.querySelector('.auth-btn').click();
            return;
        }

        hideAllSections();
        checkoutSection.style.display = 'block';
        window.scrollTo(0,0);

        // Render Checkout Summary
        const checkoutItemsList = document.getElementById('checkoutItemsList');
        checkoutItemsList.innerHTML = cart.map(item => `
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem; border-bottom: 1px dashed #eee; padding-bottom: 1rem;">
                <img src="${item.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                <div>
                    <h4 style="font-size: 0.95rem; font-weight: 500;">${item.name}</h4>
                    <div style="color: #666; font-size: 0.85rem;">Qty: ${item.quantity}</div>
                    <div style="font-weight: 500;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
                </div>
            </div>
        `).join('');
        
        currentPaymentTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('checkoutTotalAmount').textContent = `₹${currentPaymentTotal.toLocaleString('en-IN')}`;

        // Fetch Addresses
        fetchAddresses();
    }
    
    if (checkoutBtn) checkoutBtn.addEventListener('click', startCheckoutFlow);

    // --- Address Logic ---
    let selectedAddress = null;
    async function fetchAddresses() {
        const token = localStorage.getItem('etmek_jwt');
        const area = document.getElementById('savedAddressesArea');
        area.innerHTML = 'Loading addresses...';
        try {
            const res = await fetch(API_BASE + '/api/user/addresses', { headers: { 'Authorization': 'Bearer ' + token } });
            
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                     alert("Your session has expired. Please log in again.");
                     localStorage.removeItem('etmek_jwt');
                     window.location.reload();
                     return;
                }
                throw new Error("Failed connecting to server");
            }
            const data = await res.json();
            if (data.addresses && data.addresses.length > 0) {
                area.innerHTML = data.addresses.map((addr, idx) => `
                    <label style="display: block; padding: 1rem; border: 1px solid #ddd; margin-bottom: 0.5rem; border-radius: 4px; cursor: pointer; background: #fafafa;">
                        <input type="radio" name="selectedAddr" value="${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}" ${idx === 0 ? 'checked' : ''}>
                        <div style="display: inline-block; vertical-align: top; margin-left: 0.5rem;">
                            <strong>${addr.fullName}</strong> <span style="background: #e0e0e0; font-size: 0.7rem; padding: 2px 5px; border-radius: 2px; margin-left: 0.5rem;">HOME</span> <span style="color: #666; margin-left: 0.5rem;">${addr.phone}</span><br>
                            <span style="color: #444; font-size: 0.9rem;">${addr.street}, ${addr.city}, ${addr.state} - <strong>${addr.pincode}</strong></span>
                        </div>
                    </label>
                `).join('');
                selectedAddress = document.querySelector('input[name="selectedAddr"]:checked').value;
                document.getElementById('saveAddressBtn').parentElement.style.display = 'none'; // hide new address form
                document.getElementById('addNewAddressBtn').style.display = 'block';
                
                // Add listener to radio changes
                document.querySelectorAll('input[name="selectedAddr"]').forEach(r => {
                    r.addEventListener('change', (e) => {
                        selectedAddress = e.target.value;
                    });
                });
                
                // Show continue button
                if(!document.getElementById('continueToPaymentBtn')) {
                    area.insertAdjacentHTML('afterend', '<button class="btn btn-primary" id="continueToPaymentBtn" style="width: 100%;">Deliver Here</button>');
                    document.getElementById('continueToPaymentBtn').addEventListener('click', () => {
                        document.getElementById('stepDelivery').style.opacity = '0.6';
                        document.getElementById('stepPayment').style.opacity = '1';
                        document.getElementById('stepPayment').style.pointerEvents = 'auto';
                        document.getElementById('continueToPaymentBtn').style.display = 'none';
                    });
                }
                document.getElementById('continueToPaymentBtn').style.display = 'block';
            } else {
                area.innerHTML = '<p>No saved addresses yet.</p>';
                document.getElementById('newAddressForm').style.display = 'block';
                document.getElementById('addNewAddressBtn').style.display = 'none';
                if(document.getElementById('continueToPaymentBtn')) document.getElementById('continueToPaymentBtn').style.display = 'none';
            }
        } catch(e) {
            area.innerHTML = 'Error loading addresses.';
        }
    }

    document.getElementById('addNewAddressBtn').addEventListener('click', () => {
        document.getElementById('newAddressForm').style.display = 'block';
        document.getElementById('addNewAddressBtn').style.display = 'none';
        if(document.getElementById('continueToPaymentBtn')) document.getElementById('continueToPaymentBtn').style.display = 'none';
    });
    document.getElementById('cancelNewAddressBtn').addEventListener('click', () => {
        document.getElementById('newAddressForm').style.display = 'none';
        document.getElementById('addNewAddressBtn').style.display = 'block';
        if(selectedAddress && document.getElementById('continueToPaymentBtn')) document.getElementById('continueToPaymentBtn').style.display = 'block';
    });

    document.getElementById('newAddressForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        document.getElementById('saveAddressBtn').textContent = 'Saving...';
        const payload = {
            fullName: document.getElementById('addrName').value,
            phone: document.getElementById('addrPhone').value,
            street: document.getElementById('addrStreet').value,
            city: document.getElementById('addrCity').value,
            state: document.getElementById('addrState').value,
            pincode: document.getElementById('addrPincode').value
        };
        const token = localStorage.getItem('etmek_jwt');
        await fetch(API_BASE + '/api/user/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(payload)
        });
        document.getElementById('newAddressForm').reset();
        document.getElementById('saveAddressBtn').textContent = 'Save and Deliver Here';
        fetchAddresses();
    });

    const checkoutPaymentForm = document.getElementById('checkoutPaymentForm');
    const paymentOptions = document.querySelectorAll('input[name="checkoutPaymentMethod"]');
    const paymentDetailsDisplay = document.getElementById('checkoutPaymentDetailsSection');
    const paymentHint = document.getElementById('paymentHintText');

    paymentOptions.forEach(opt => {
        opt.addEventListener('change', (e) => {
            paymentDetailsDisplay.style.display = 'block';
            if (e.target.value === 'card') paymentHint.textContent = "You will be redirected to the secure card payment gateway.";
            else if (e.target.value === 'upi') paymentHint.textContent = "Open your UPI app to complete the payment.";
            else if (e.target.value === 'netbanking') paymentHint.textContent = "You will be redirected to your bank's portal.";
            else if (e.target.value === 'wallet') paymentHint.textContent = "Pay using Paytm, PhonePe, or Amazon Pay wallet.";
            else if (e.target.value === 'cod') paymentHint.textContent = "Pay conveniently at your doorstep via Cash or UPI.";
            
            document.getElementById('placeOrderBtn').textContent = e.target.value === 'cod' ? 'Place Order' : 'Pay ₹' + currentPaymentTotal;
        });
    });

    checkoutPaymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('placeOrderBtn');
        btn.disabled = true;
        btn.textContent = 'Processing...';

        function parseJwt (token) {
            if(!token) return null;
            try { return JSON.parse(atob(token.split('.')[1])); } catch(e) { return null; }
        }

        const payload = {
            items: cart,
            total: currentPaymentTotal.toString(),
            email: localStorage.getItem('etmek_email'),
            user_id: parseJwt(localStorage.getItem('etmek_jwt'))?.id,
            paymentMethod: document.querySelector('input[name="checkoutPaymentMethod"]:checked').value,
            shipping_address: selectedAddress
        };

        try {
            const res = await fetch(API_BASE + '/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if(res.ok) {
                cart = [];
                updateCartUI();
                alert('Order placed successfully! Redirecting to your orders...');
                showMyOrders();
            } else {
                alert('Failed to place order.');
            }
        } catch(err) {
            alert('Error placing order.');
        } finally {
            btn.disabled = false;
        }
    });

    // --- My Orders Logic ---
    const myOrdersBtn = document.querySelector('.my-orders-btn');
    if (myOrdersBtn) {
        myOrdersBtn.addEventListener('click', showMyOrders);
    }

    function showMyOrders() {
        const token = localStorage.getItem('etmek_jwt');
        if (!token) return;
        
        hideAllSections();
        myOrdersSection.style.display = 'block';
        window.scrollTo(0,0);
        
        fetchMyOrders();
    }

    async function fetchMyOrders() {
        const list = document.getElementById('myOrdersList');
        const token = localStorage.getItem('etmek_jwt');
        list.innerHTML = '<div style="text-align: center; padding: 3rem;"><div class="loader" style="border-color: #333; border-top-color: transparent;"></div><p style="margin-top: 1rem;">Loading your orders...</p></div>';
        
        try {
            const res = await fetch(API_BASE + '/api/user/orders', { headers: { 'Authorization': 'Bearer ' + token } });
            const data = await res.json();
            
            if (data.orders && data.orders.length > 0) {
                list.innerHTML = data.orders.map(o => `
                    <div style="background: #fff; padding: 1.5rem; border-radius: 4px; border: 1px solid #e0e0e0; display: flex; flex-direction: column; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px dashed #e0e0e0; padding-bottom: 1rem;">
                            <div>
                                <div style="font-weight: 500; font-size: 1.1rem; margin-bottom: 0.3rem;">Order ID: #${o.id}</div>
                                <div style="color: #666; font-size: 0.9rem;">Placed on: ${new Date(o.created_at).toLocaleDateString()}</div>
                            </div>
                            <div style="text-align: right;">
                                <span style="display: inline-block; background: ${o.status === 'Cancelled' ? '#ffebee' : o.status === 'Delivered' ? '#e8f5e9' : '#e3f2fd'}; color: ${o.status === 'Cancelled' ? '#c62828' : o.status === 'Delivered' ? '#2e7d32' : '#1565c0'}; padding: 0.3rem 0.8rem; border-radius: 20px; font-weight: 500; font-size: 0.9rem;">${o.status}</span>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                            ${(o.items || []).map(item => `
                                <div style="display: flex; justify-content: space-between;">
                                    <span>${item.product_name} x ${item.quantity}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #e0e0e0; padding-top: 1rem;">
                            <div style="font-weight: bold; font-size: 1.1rem;">Total: ₹${o.total}</div>
                            ${o.status === 'Ordered' || o.status === 'Packed' ? `<button class="btn btn-secondary cancel-order-btn" data-id="${o.id}" style="color: #d32f2f; border-color: #d32f2f; padding: 0.5rem 1rem;">Cancel Order</button>` : ''}
                        </div>
                        <div style="font-size: 0.85rem; color: #666;">Delivering to: ${o.shipping_address}</div>
                    </div>
                `).join('');
                
                document.querySelectorAll('.cancel-order-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        if(confirm('Are you certain you want to cancel this order?')) {
                            const id = e.target.dataset.id;
                            await fetch(API_BASE + `/api/user/orders/${id}/cancel`, { method: 'PUT', headers: { 'Authorization': 'Bearer ' + token }});
                            fetchMyOrders();
                        }
                    });
                });
            } else {
                list.innerHTML = '<div style="text-align: center; padding: 2rem;"><p>You have no orders yet.</p></div>';
            }
        } catch(e) {
            list.innerHTML = 'Failed to load orders.';
        }
    }

    // --- Authentication & Admin Logic ---
    const authBtn = document.querySelector('.auth-btn');
    const adminDashboardBtn = document.querySelector('.admin-dashboard-btn');

    const authModal = document.getElementById('authModal');
    const closeAuthBtn = document.getElementById('closeAuthBtn');
    const authForm = document.getElementById('authForm');
    const authEmail = document.getElementById('authEmail');
    const authPassword = document.getElementById('authPassword');
    const submitAuthBtn = document.getElementById('submitAuthBtn');

    const authSwitchPrompt = document.getElementById('authSwitchPrompt');
    const authSwitchLink = document.getElementById('authSwitchLink');
    const authModalTitle = document.getElementById('authModalTitle');
    const authModalDesc = document.getElementById('authModalDesc');

    const authSuccess = document.getElementById('authSuccess');
    const closeAuthSuccessBtn = document.getElementById('closeAuthSuccessBtn');

    const adminModal = document.getElementById('adminModal');
    const closeAdminBtn = document.getElementById('closeAdminBtn');
    const logoutAdminBtn = document.getElementById('logoutAdminBtn');
    const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');
    const ordersTableBody = document.getElementById('ordersTableBody');
    const adminLoader = document.getElementById('adminLoader');

    let currentAuthMode = 'login'; // 'login' or 'register'

    // Check auth state on load
    function checkAuthState() {
        const token = localStorage.getItem('etmek_jwt');
        const role = localStorage.getItem('etmek_role');

        if (token) {
            authBtn.style.color = 'var(--clr-accent)'; // highlight when logged in
            authBtn.title = 'Logged In as ' + localStorage.getItem('etmek_email');

            if (role === 'admin' || role === 'superadmin') {
                document.querySelector('.admin-dashboard-btn').style.display = 'inline-block';
            } else {
                document.querySelector('.admin-dashboard-btn').style.display = 'none';
            }
            if(document.querySelector('.my-orders-btn')) document.querySelector('.my-orders-btn').style.display = 'inline-block';
        } else {
            authBtn.style.color = '';
            authBtn.title = 'Login Account';
            document.querySelector('.admin-dashboard-btn').style.display = 'none';
            if(document.querySelector('.my-orders-btn')) document.querySelector('.my-orders-btn').style.display = 'none';
        }
    }
    checkAuthState();

    // Toggle Auth Modal or Redirect to Login Page
    if (authBtn) {
        authBtn.addEventListener('click', (e) => {
            const token = localStorage.getItem('etmek_jwt');
            if (token) {
                e.preventDefault();
                // If already logged in, show a prompt to logout
                if (confirm("Do you want to logout?")) {
                    localStorage.removeItem('etmek_jwt');
                    localStorage.removeItem('etmek_role');
                    localStorage.removeItem('etmek_email');
                    checkAuthState();
                    alert('Logged out successfully.');
                }
                return;
            }
            // If not logged in, the <a> tag navigates to login.html normally
        });
    }

    if (closeAuthBtn) {
        closeAuthBtn.addEventListener('click', () => {
            authModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (closeAuthSuccessBtn) {
        closeAuthSuccessBtn.addEventListener('click', () => {
            authModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Switch between Login and Register
    if (authSwitchLink) {
        authSwitchLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentAuthMode === 'login') {
                currentAuthMode = 'register';
                authModalTitle.textContent = 'Create Account';
                authModalDesc.textContent = 'Join Etmek to track your orders.';
                submitAuthBtn.querySelector('.btn-text').textContent = 'Register';
                authSwitchPrompt.textContent = 'Already have an account?';
                authSwitchLink.textContent = 'Log in here';
            } else {
                currentAuthMode = 'login';
                authModalTitle.textContent = 'Login';
                authModalDesc.textContent = 'Welcome back to Etmek.';
                submitAuthBtn.querySelector('.btn-text').textContent = 'Log In';
                authSwitchPrompt.textContent = "Don't have an account?";
                authSwitchLink.textContent = 'Register here';
            }
        });
    }

    // Submit Auth Form
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            submitAuthBtn.disabled = true;
            submitAuthBtn.querySelector('.btn-text').textContent = 'Processing...';
            submitAuthBtn.querySelector('.loader').style.display = 'inline-block';

            const email = authEmail.value;
            const password = authPassword.value;

            const endpoint = currentAuthMode === 'login' ? '/api/login' : '/api/register';

            try {
                const response = await fetch(API_BASE + endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Authentication failed');
                }

                if (currentAuthMode === 'login') {
                    localStorage.setItem('etmek_jwt', data.token);
                    localStorage.setItem('etmek_role', data.role);
                    localStorage.setItem('etmek_email', data.email);
                    checkAuthState();

                    document.getElementById('authSuccessTitle').textContent = 'Welcome Back!';
                    document.getElementById('authSuccessDesc').textContent = 'You are successfully logged in.';
                } else {
                    document.getElementById('authSuccessTitle').textContent = 'Registration Complete';
                    document.getElementById('authSuccessDesc').textContent = 'You can now log in with your new account.';
                    currentAuthMode = 'login'; // Reset to login for next time
                }

                authForm.style.display = 'none';
                authSuccess.style.display = 'flex';

            } catch (error) {
                alert(error.message);
            } finally {
                submitAuthBtn.disabled = false;
                submitAuthBtn.querySelector('.btn-text').textContent = currentAuthMode === 'login' ? 'Log In' : 'Register';
                submitAuthBtn.querySelector('.loader').style.display = 'none';
            }
        });
    }

    // Toggle Admin Dashboard Modal
    if (adminDashboardBtn) {
        adminDashboardBtn.addEventListener('click', () => {
            adminModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            fetchOrders();
            fetchAdminProducts();
        });
    }

    if (closeAdminBtn) {
        closeAdminBtn.addEventListener('click', () => {
            adminModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (logoutAdminBtn) {
        logoutAdminBtn.addEventListener('click', () => {
            localStorage.removeItem('etmek_jwt');
            localStorage.removeItem('etmek_role');
            localStorage.removeItem('etmek_email');
            checkAuthState();
            adminModal.classList.remove('active');
            document.body.style.overflow = '';
            alert('Logged out from Admin Dashboard.');
        });
    }

    // Tabs logic
    const tabOrdersBtn = document.getElementById('tabOrdersBtn');
    const tabProductsBtn = document.getElementById('tabProductsBtn');
    const adminViewOrders = document.getElementById('adminViewOrders');
    const adminViewProducts = document.getElementById('adminViewProducts');

    if (tabOrdersBtn && tabProductsBtn) {
        tabOrdersBtn.addEventListener('click', () => {
            tabOrdersBtn.style.color = 'var(--clr-accent)';
            tabOrdersBtn.style.borderBottomColor = 'var(--clr-accent)';
            tabProductsBtn.style.color = '#666';
            tabProductsBtn.style.borderBottomColor = 'transparent';
            adminViewOrders.style.display = 'block';
            adminViewProducts.style.display = 'none';
        });

        tabProductsBtn.addEventListener('click', () => {
            tabProductsBtn.style.color = 'var(--clr-accent)';
            tabProductsBtn.style.borderBottomColor = 'var(--clr-accent)';
            tabOrdersBtn.style.color = '#666';
            tabOrdersBtn.style.borderBottomColor = 'transparent';
            adminViewOrders.style.display = 'none';
            adminViewProducts.style.display = 'block';
        });
    }

    if (refreshOrdersBtn) {
        refreshOrdersBtn.addEventListener('click', fetchOrders);
    }

    async function fetchOrders() {
        if(!ordersTableBody) return;
        ordersTableBody.innerHTML = '';
        adminLoader.style.display = 'block';

        const token = localStorage.getItem('etmek_jwt');
        if (!token) return;

        try {
            const response = await fetch(API_BASE + '/api/admin/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            adminLoader.style.display = 'none';

            if (!response.ok) throw new Error(data.error || 'Failed to fetch orders');

            if (!data.orders || data.orders.length === 0) {
                ordersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">No orders found.</td></tr>';
                return;
            }

            data.orders.forEach(order => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #eee';
                
                const statusOptions = ['Ordered', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
                const selectHtml = `
                    <select class="admin-status-select" data-id="${order.id}" style="padding: 0.3rem; border: 1px solid #ccc; border-radius: 3px;">
                        ${statusOptions.map(s => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                `;

                tr.innerHTML = `
                    <td style="padding: 12px 10px;">#${order.id}</td>
                    <td style="padding: 12px 10px;">
                        <div>${order.email}</div>
                        <div style="font-size: 0.8rem; color: #666; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${order.shipping_address}">${order.shipping_address || 'No Address'}</div>
                    </td>
                    <td style="padding: 12px 10px; font-weight: 500;">₹${order.total}</td>
                    <td style="padding: 12px 10px;">${order.payment_method.toUpperCase()}</td>
                    <td style="padding: 12px 10px;">${selectHtml}</td>
                    <td style="padding: 12px 10px; font-size: 0.85rem;">${new Date(order.created_at).toLocaleString()}</td>
                `;
                ordersTableBody.appendChild(tr);
            });
            
            document.querySelectorAll('.admin-status-select').forEach(sel => {
                sel.addEventListener('change', async (e) => {
                    const id = e.target.dataset.id;
                    const newStatus = e.target.value;
                    e.target.disabled = true;
                    try {
                        const res = await fetch(API_BASE + `/api/admin/orders/${id}/status`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ status: newStatus })
                        });
                        if(res.ok) {
                            // Status updated
                        } else {
                            alert('Failed to update status');
                        }
                    } catch(err) {
                        alert('Error updating status');
                    }
                    e.target.disabled = false;
                });
            });

        } catch (error) {
            adminLoader.style.display = 'none';
            ordersTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red;">Error: ${error.message}</td></tr>`;
        }
    }

    // Fetch Admin Products
    const adminProdList = document.getElementById('adminProdList');
    async function fetchAdminProducts() {
        if(!adminProdList) return;
        adminProdList.innerHTML = '<p>Loading...</p>';
        try {
            const token = localStorage.getItem('etmek_jwt');
            const res = await fetch(API_BASE + '/api/products');
            const data = await res.json();
            
            if(data.products && data.products.length > 0) {
                adminProdList.innerHTML = data.products.map(p => `
                    <div style="display: flex; gap: 1rem; align-items: center; background: #fff; padding: 0.8rem; border: 1px solid #e0e0e0; border-radius: 4px;">
                        <img src="${p.image_url ? (p.image_url.startsWith('http') ? p.image_url : API_BASE + '/' + p.image_url) : API_BASE + '/images/model1.jpg'}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                        <div style="flex: 1;">
                            <div style="font-weight: 500; font-size: 0.95rem;">${p.name}</div>
                            <div style="color: #666; font-size: 0.85rem;">₹${p.price} | ${p.category || 'No Cat'}</div>
                        </div>
                        <button class="btn btn-secondary admin-del-prod-btn" data-id="${p.id}" style="color: red; border-color: transparent; padding: 0.5rem;"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `).join('');
                
                document.querySelectorAll('.admin-del-prod-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        if(confirm('Delete product?')) {
                            const id = e.target.closest('button').dataset.id;
                            await fetch(API_BASE + `/api/admin/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                            fetchAdminProducts();
                            fetchProducts(); // Refresh storefront
                        }
                    });
                });
            } else {
                adminProdList.innerHTML = '<p>No products found.</p>';
            }
        } catch(e) {
            adminProdList.innerHTML = '<p>Error loading products.</p>';
        }
    }
    
    // Add Product
    const adminAddProductForm = document.getElementById('adminAddProductForm');
    if(adminAddProductForm) {
        adminAddProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('etmek_jwt');
            const btn = document.getElementById('adminAddProdSubmitBtn');
            btn.disabled = true;
            btn.textContent = 'Adding...';
            
            const payload = {
                name: document.getElementById('adminProdName').value,
                price: parseFloat(document.getElementById('adminProdPrice').value),
                description: document.getElementById('adminProdDesc').value,
                image_url: document.getElementById('adminProdImg').value,
                category: document.getElementById('adminProdCat').value
            };
            
            try {
                const res = await fetch(API_BASE + '/api/admin/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
                if(res.ok) {
                    adminAddProductForm.reset();
                    fetchAdminProducts();
                    fetchProducts(); // Refresh storefront
                } else {
                    alert('Failed to add product');
                }
            } catch(err) {
                alert('Error');
            }
            btn.disabled = false;
            btn.textContent = 'Add Product';
        });
    }

    // --- Newsletter Form Submission ---
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const submitBtn = newsletterForm.querySelector('button[type="submit"]');

            if (emailInput && emailInput.value) {
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Subscribing...';
                submitBtn.disabled = true;

                // Simulate API call
                setTimeout(() => {
                    submitBtn.textContent = 'Subscribed!';
                    submitBtn.style.backgroundColor = 'var(--clr-brand, #28a745)';
                    submitBtn.style.color = '#fff';
                    emailInput.value = '';

                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                        submitBtn.style.backgroundColor = '';
                        submitBtn.style.color = '';
                    }, 3000);
                }, 1000);
            }
        });
    }

});
