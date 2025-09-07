const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = __dirname + "/db.json";

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

// --- работа с базой ---
function loadDB() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// --- GET /location/:id ---
app.get("/location/:id", (req, res) => {
    const db = loadDB();
    const user = db.users.find(u => u.id === req.params.id);
    if (user) res.json(user);
    else res.status(404).json({ error: "User not found" });
});

// --- POST /location ---
app.post("/location", (req, res) => {
    const { id, lat, lon } = req.body;
    if (!id || !lat || !lon) return res.status(400).json({ error: "Missing parameters" });

    const db = loadDB();
    let user = db.users.find(u => u.id === id);

    if (user) {
        user.lat = lat;
        user.lon = lon;
        user.updatedAt = new Date().toISOString();
    } else {
        user = { id, lat, lon, updatedAt: new Date().toISOString() };
        db.users.push(user);
    }

    saveDB(db);
    res.json({ success: true, user });
});

app.listen(PORT, () => {
    console.log(`🌍 Server running at http://localhost:${PORT}`);
});
