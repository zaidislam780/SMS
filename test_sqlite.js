import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('test.db', (err) => {
    if (err) console.error(err);
    else console.log('Connected');
});

db.serialize(() => {
    try {
        db.run("CREATE TABLE IF NOT EXISTS lorem (info TEXT)");
        console.log("Table created");

        const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
        stmt.run("Ipsum");
        stmt.finalize();

        db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
            console.log(row.id + ": " + row.info);
        });
    } catch (e) {
        console.error("Error:", e);
    }
});

db.close();
