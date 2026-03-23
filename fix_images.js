const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'ecommerce.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("Error opening database:", err);
});

db.serialize(() => {
    // Update the broken image URLs to valid fallback ones
    db.run("UPDATE products SET image_url = 'images/dress1.jpg' WHERE name = 'Botanical Embroidered Linen Dress'");
    db.run("UPDATE products SET image_url = 'images/dress2.jpg' WHERE name = 'Vibrant Check Sleeveless Midi'");
    db.run("UPDATE products SET image_url = 'images/dress3.jpg' WHERE name = 'Dual-Tone Floral Cutout Tunic'");
    console.log("Fixed broken images securely.");
});

db.close();
