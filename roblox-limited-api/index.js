const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const ROLIMONS_URL = "https://www.rolimons.com/itemapi/itemdetails";
let rolimonsData = {};

// Fetch Rolimons data once when server starts
axios.get(ROLIMONS_URL)
    .then(res => {
        rolimonsData = res.data.items;
        console.log("✅ Rolimons data loaded");
    })
    .catch(err => {
        console.error("❌ Failed to fetch Rolimons data:", err.message);
    });

app.get("/", (req, res) => {
    res.send("Roblox Limited API is running!");
});

app.get("/checkLimiteds/:userId", async (req, res) => {
    const userId = req.params.userId;

    // Optional: wait for Rolimons to be ready
    if (Object.keys(rolimonsData).length === 0) {
        return res.status(503).json({ success: false, error: "Rolimons data not loaded yet." });
    }

    try {
        const url = `https://inventory.roblox.com/v1/users/${userId}/assets/collectibles?limit=100&sortOrder=Asc`;
        const response = await axios.get(url);

        const items = response.data.data.map(item => {
            const itemInfo = rolimonsData[item.assetId.toString()] || [];

            return {
                name: item.assetName,
                id: item.assetId,
                rap: item.recentAveragePrice,
                serial: item.serialNumber || null,
                value: itemInfo[3] || null,   // Rolimons value
                demand: itemInfo[4] || null,  // Rolimons demand
                trend: itemInfo[5] || null    // Rolimons trend
            };
        });

        res.json({ success: true, items });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch data." });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
