const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'ecommerce.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Create Orders table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            total TEXT NOT NULL,
            payment_method TEXT NOT NULL,
            status TEXT DEFAULT 'Ordered',
            shipping_address TEXT,
            user_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating orders table', err.message);
            } else {
                // Ignore errors if columns already exist
                db.run(`ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'Ordered'`, () => {});
                db.run(`ALTER TABLE orders ADD COLUMN shipping_address TEXT`, () => {});
                db.run(`ALTER TABLE orders ADD COLUMN user_id INTEGER`, () => {});
            }
        });

        // Create Order Items table
        db.run(`CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id TEXT NOT NULL,
            product_name TEXT NOT NULL,
            price REAL NOT NULL,
            quantity INTEGER NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders (id)
        )`, (err) => {
            if (err) {
                console.error('Error creating order_items table', err.message);
            }
        });

        // Create Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'superadmin')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating users table', err.message);
            } else {
                // Pre-populate a superadmin user if they don't exist
                // Default password for superadmin will be "superadmin123"
                // Hash generated manually or via bcrypt for 'superadmin123' -> cost 10: $2b$10$wT.fB.xK1Q06i91v66dK/eiT7O8XW9OQqNKVf.Q8s8iI8c8n9Wz5K
                const superadminHash = '$2b$10$wT.fB.xK1Q06i91v66dK/eiT7O8XW9OQqNKVf.Q8s8iI8c8n9Wz5K';
                db.run(`INSERT OR IGNORE INTO users (email, password_hash, role) VALUES ('superadmin@etmek.com', ?, 'superadmin')`, [superadminHash]);
            }
        });

        // Create Products table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT,
            image_url TEXT,
            category TEXT,
            stock INTEGER DEFAULT 10,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('Error creating products table', err.message);
        });

        // Create Addresses table
        db.run(`CREATE TABLE IF NOT EXISTS addresses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            fullName TEXT NOT NULL,
            phone TEXT NOT NULL,
            street TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            pincode TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`, (err) => {
            if (err) console.error('Error creating addresses table', err.message);
        });
    }
});

module.exports = db;
