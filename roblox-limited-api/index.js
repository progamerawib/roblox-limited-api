const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const ROLIMONS_URL = "https://www.rolimons.com/itemapi/itemdetails";
let rolimonsData = {};

// Fetch Rolimons data on startup
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

    if (Object.keys(rolimonsData).length === 0) {
        return res.status(503).json({ success: false, error: "Rolimons data not loaded yet." });
    }

    try {
        const url = `https://inventory.roblox.com/v1/users/${userId}/assets/collectibles?limit=100&sortOrder=Asc`;
        const response = await axios.get(url);

        // Rolimons mappings
        const demandMap = ["N/A", "Low", "Normal", "High", "Amazing"];
        const trendMap  = ["N/A", "Lowering", "Stable", "Rising", "Fluctuating"];

        const items = response.data.data.map(item => {
            const info = rolimonsData[item.assetId.toString()] || [];

            return {
                name:   item.name,
                id:     item.assetId,
                rap:    item.recentAveragePrice,
                serial: item.serialNumber || null,
                value:  info[3] != null ? info[3] : null,
                // demand at index 5
                demand: info[5] != null
                    ? demandMap[info[5]]
                    : "N/A",
                // trend at index 6
                trend: info[6] != null
                    ? trendMap[info[6]]
                    : "N/A",
                imageUrl: `https://www.roblox.com/asset-thumbnail/image?assetId=${item.assetId}&width=420&height=420&format=png`
            };
        });

        res.json({ success: true, items });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch data." });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
