const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get("/", (req, res) => {
    res.send("Roblox Limited API is running!");
});

app.get("/checkLimiteds/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
        const url = `https://inventory.roblox.com/v1/users/${userId}/assets/collectibles?limit=100&sortOrder=Asc`;
        const response = await axios.get(url);

        const items = response.data.data.map(item => ({
            name: item.assetName,
            id: item.assetId,
            rap: item.recentAveragePrice,
            serial: item.serialNumber || null
        }));

        res.json({ success: true, items });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch data." });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
