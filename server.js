const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_etmek'; // In production, use environment variables


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve frontend files

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Role Authorization Middleware
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied: insufficient permissions' });
        }
        next();
    };
};

// --- AUTH API Endpoints ---
app.post('/api/register', async (req, res) => {
    const { email, password, fullName, phone, street, city, state, pincode } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(`INSERT INTO users (email, password_hash) VALUES (?, ?)`, [email, hashedPassword], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ error: 'Email already exists' });
                }
                console.error(err);
                return res.status(500).json({ error: 'Failed to register user' });
            }
            
            const userId = this.lastID;

            if (fullName && phone && street && city && state && pincode) {
                db.run(`INSERT INTO addresses (user_id, fullName, phone, street, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [userId, fullName, phone, street, city, state, pincode], function(err2) {
                        if (err2) {
                            console.error('Error adding address for new user', err2);
                        }
                        res.status(201).json({ message: 'User registered with address successfully', userId });
                    });
            } else {
                res.status(201).json({ message: 'User registered successfully', userId });
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, role: user.role, email: user.email });
    });
});

// --- PRODUCTS API Endpoints ---
app.get('/api/products', (req, res) => {
    db.all(`SELECT * FROM products ORDER BY created_at DESC`, [], (err, products) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to retrieve products' });
        }
        res.json({ products });
    });
});

// --- ADMIN API Endpoints ---
app.get('/api/admin/orders', authenticateToken, authorizeRole(['admin', 'superadmin']), (req, res) => {
    db.all(`SELECT * FROM orders ORDER BY created_at DESC`, [], (err, orders) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to retrieve orders' });
        }
        res.json({ orders });
    });
});

app.put('/api/admin/orders/:id/status', authenticateToken, authorizeRole(['admin', 'superadmin']), (req, res) => {
    const { status } = req.body;
    db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to update status' });
        res.json({ message: 'Order status updated successfully' });
    });
});

app.post('/api/admin/products', authenticateToken, authorizeRole(['admin', 'superadmin']), (req, res) => {
    const { name, price, description, image_url, category, stock } = req.body;
    db.run(`INSERT INTO products (name, price, description, image_url, category, stock) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, price, description, image_url, category, stock || 10], function(err) {
            if (err) return res.status(500).json({ error: 'Failed to create product' });
            res.status(201).json({ message: 'Product created', productId: this.lastID });
        });
});

app.put('/api/admin/products/:id', authenticateToken, authorizeRole(['admin', 'superadmin']), (req, res) => {
    const { name, price, description, image_url, category, stock } = req.body;
    db.run(`UPDATE products SET name=?, price=?, description=?, image_url=?, category=?, stock=? WHERE id=?`,
        [name, price, description, image_url, category, stock, req.params.id], function(err) {
            if (err) return res.status(500).json({ error: 'Failed to update product' });
            res.json({ message: 'Product updated' });
        });
});

app.delete('/api/admin/products/:id', authenticateToken, authorizeRole(['admin', 'superadmin']), (req, res) => {
    db.run(`DELETE FROM products WHERE id=?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to delete product' });
        res.json({ message: 'Product deleted' });
    });
});

// --- USER API Endpoints ---
app.get('/api/user/orders', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id], (err, orders) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve orders' });
        
        // Also fetch items for these orders
        if (orders.length === 0) return res.json({ orders });
        
        db.all(`SELECT * FROM order_items WHERE order_id IN (${orders.map(o => o.id).join(',')})`, [], (err, items) => {
            if (err) return res.status(500).json({ error: 'Failed to retrieve order items' });
            
            // Attach items to orders
            orders.forEach(order => {
                order.items = items.filter(item => item.order_id === order.id);
            });
            res.json({ orders });
        });
    });
});

app.put('/api/user/orders/:id/cancel', authenticateToken, (req, res) => {
    db.run(`UPDATE orders SET status = 'Cancelled' WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to cancel order' });
        res.json({ message: 'Order cancelled' });
    });
});

app.get('/api/user/addresses', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id], (err, addresses) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve addresses' });
        res.json({ addresses });
    });
});

app.post('/api/user/addresses', authenticateToken, (req, res) => {
    const { fullName, phone, street, city, state, pincode } = req.body;
    db.run(`INSERT INTO addresses (user_id, fullName, phone, street, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, fullName, phone, street, city, state, pincode], function(err) {
            if (err) return res.status(500).json({ error: 'Failed to add address' });
            res.status(201).json({ message: 'Address added', addressId: this.lastID });
        });
});

// API Endpoints
app.post('/api/orders', (req, res) => {
    const { items, total, email, paymentMethod, shipping_address, user_id } = req.body;

    if (!items || !total || !email || !paymentMethod) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert order into database
    db.run(
        `INSERT INTO orders (email, total, payment_method, shipping_address, user_id, status) VALUES (?, ?, ?, ?, ?, 'Ordered')`,
        [email, total, paymentMethod, shipping_address || '', user_id || null],
        function (err) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: 'Failed to create order' });
            }

            const orderId = this.lastID;

            // Prepare order items
            const placeholders = items.map(() => '(?, ?, ?, ?, ?)').join(',');
            const values = [];
            items.forEach(item => {
                values.push(orderId, item.id, item.name, item.price, item.quantity);
            });

            if (items.length > 0) {
                db.run(
                    `INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES ${placeholders}`,
                    values,
                    (err) => {
                        if (err) {
                            console.error(err.message);
                            return res.status(500).json({ error: 'Failed to save order items' });
                        }
                        res.status(201).json({ message: 'Order created successfully', orderId });
                    }
                );
            } else {
                res.status(201).json({ message: 'Order created successfully', orderId });
            }
        }
    );
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
