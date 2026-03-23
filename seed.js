const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'ecommerce.db');

const db = new sqlite3.Database(dbPath);

const products = [
    { name: 'Midnight Silk Slip', price: 1999, description: 'Elegant midnight silk slip dress', image_url: 'images/model1.jpg', category: 'Dresses', stock: 10 },
    { name: 'Ivory Lace Gown', price: 1499, description: 'Beautiful ivory lace gown', image_url: 'images/model2.jpg', category: 'Dresses', stock: 15 },
    { name: 'Crimson Wrap Dress', price: 2499, description: 'Stunning crimson wrap dress', image_url: 'images/model3.jpg', category: 'Dresses', stock: 5 },
    { name: 'Botanical Linen Dress', price: 3000, description: 'Fresh botanical linen dress', image_url: 'images/dress1.jpg', category: 'Casual', stock: 20 },
    { name: 'Vibrant Madras Check Midi', price: 2500, description: 'Vibrant check midi dress', image_url: 'images/dress2.jpg', category: 'Casual', stock: 12 },
    { name: 'Monochrome Tulip Tunic', price: 2000, description: 'Sleek monochrome tulip tunic', image_url: 'images/dress3.jpg', category: 'Tunics', stock: 8 },
    { name: 'Emerald Tropical Co-ord Set', price: 2000, description: 'Tropical emerald co-ord set', image_url: 'images/dress4.jpg', category: 'Sets', stock: 25 },
    { name: 'Lavender Daisy Maxi', price: 1500, description: 'Flowy lavender daisy maxi dress', image_url: 'images/dress5.jpg', category: 'Dresses', stock: 18 },
    { name: 'Classic White Collection', price: 1800, description: 'Classic clean white collection', image_url: 'images/white 1.jpeg', category: 'Collections', stock: 10 },
    { name: 'Monochrome Black & White', price: 2200, description: 'Monochrome elegant collection', image_url: 'images/black&white.jpeg', category: 'Collections', stock: 5 },
    { name: 'Sunny Yellow Special', price: 1700, description: 'Bright yellow special collection', image_url: 'images/yellow.jpeg', category: 'Dresses', stock: 10 },
    { name: 'Royal Purple Kurti', price: 1200, description: 'Graceful royal purple kurti', image_url: 'images/purple.jpeg', category: 'Kurtis', stock: 20 },
    { name: 'Light Green Flora', price: 1800, description: 'Refreshing light green floral dress', image_url: 'images/lightgreen.jpeg', category: 'Dresses', stock: 15 },
    { name: 'Red Floral Fusion', price: 1950, description: 'Vibrant red floral fusion', image_url: 'images/redflower.jpeg', category: 'Dresses', stock: 8 },
    { name: 'Mixed Patterns Top', price: 950, description: 'Playful mixed patterns top', image_url: 'images/mixed.jpeg', category: 'Tops', stock: 30 }
];

db.serialize(() => {
    // Ensure table exists
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        image_url TEXT,
        category TEXT,
        stock INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Clear existing products to ensure clean images
    db.run("DELETE FROM products");
    
    const stmt = db.prepare("INSERT INTO products (name, price, description, image_url, category, stock) VALUES (?, ?, ?, ?, ?, ?)");
    products.forEach(p => {
        stmt.run(p.name, p.price, p.description, p.image_url, p.category, p.stock);
    });
    stmt.finalize();
    console.log("Successfully seeded database with products and images!");
});

db.close();
