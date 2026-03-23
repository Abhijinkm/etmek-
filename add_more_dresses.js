const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'ecommerce.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database:", err);
        process.exit(1);
    }
});

const newProducts = [
    { 
        name: 'Purple Floral Maxi Dress', 
        price: 2899, 
        description: 'A deeply hued purple maxi dress featuring delicate floral prints, perfect for evening gatherings.', 
        image_url: 'images/purple_floral.jpg', 
        category: 'Dresses', 
        stock: 12 
    },
    { 
        name: 'Teal Flora Summer Dress', 
        price: 2199, 
        description: 'Bright teal summer dress with scattered flora patterns. Lightweight and wonderfully comfortable.', 
        image_url: 'images/teal_flora.jpg', 
        category: 'Dresses', 
        stock: 18 
    },
    { 
        name: 'Blue Plaid Midi Dress', 
        price: 2399, 
        description: 'Classic blue plaid midi dress, offering timeless elegance and a relaxed fit.', 
        image_url: 'images/plaid_midi_2.jpg', 
        category: 'Dresses', 
        stock: 10 
    }
];

db.serialize(() => {
    const stmt = db.prepare("INSERT INTO products (name, price, description, image_url, category, stock) VALUES (?, ?, ?, ?, ?, ?)");
    
    newProducts.forEach(p => {
        stmt.run(p.name, p.price, p.description, p.image_url, p.category, p.stock);
    });
    
    stmt.finalize();
    console.log("Successfully added the 3 new image products to the catalog!");
});

db.close();
