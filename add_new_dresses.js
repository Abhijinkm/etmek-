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
        name: 'Botanical Embroidered Linen Dress', 
        price: 3299, 
        description: 'Breezy white linen button-up dress featuring delicate botanical embroidery. Perfect for summer afternoons and resort wear.', 
        image_url: 'images/floral_linen.jpg', 
        category: 'Dresses', 
        stock: 10 
    },
    { 
        name: 'Vibrant Check Sleeveless Midi', 
        price: 2499, 
        description: 'A colorful and playful sleeveless midi dress in a classic madras check pattern. Features a comfortable V-neck design.', 
        image_url: 'images/plaid_midi.jpg', 
        category: 'Dresses', 
        stock: 15 
    },
    { 
        name: 'Dual-Tone Floral Cutout Tunic', 
        price: 2799, 
        description: 'Striking black and white colorblock tunic featuring modern floral cutout designs. Elegant and sophisticated daywear.', 
        image_url: 'images/bw_tunic.jpg', 
        category: 'Tunics', 
        stock: 8 
    }
];

db.serialize(() => {
    const stmt = db.prepare("INSERT INTO products (name, price, description, image_url, category, stock) VALUES (?, ?, ?, ?, ?, ?)");
    
    newProducts.forEach(p => {
        stmt.run(p.name, p.price, p.description, p.image_url, p.category, p.stock);
    });
    
    stmt.finalize();
    console.log("Successfully added the 3 new dresses to the catalog!");
});

db.close();
