const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const ROLIMONS_URL = "https://www.rolimons.com/itemapi/itemdetails";
let rolimonsData = {};

// Rolimons value mappings
const demandMap = {
  "-1": "N/A",
  "1": "Low",
  "2": "Medium",
  "3": "High",
  "4": "Extreme"
};

const trendMap = {
  "-1": "N/A",
  "1": "Down",
  "2": "Stable",
  "3": "Up"
};

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

  // Ensure Rolimons data is ready
  if (Object.keys(rolimonsData).length === 0) {
    return res.status(503).json({ success: false, error: "Rolimons data not loaded yet." });
  }

  try {
    const url = `https://inventory.roblox.com/v1/users/${userId}/assets/collectibles?limit=100&sortOrder=Asc`;
    const response = await axios.get(url);

    const items = response.data.data.map(item => {
      const assetIdStr = item.assetId.toString();
      const itemInfo = rolimonsData[assetIdStr] || [];

      const rawDemand = itemInfo[4]?.toString() || "-1";
      const rawTrend = itemInfo[5]?.toString() || "-1";

      return {
        name: item.name,
        id: item.assetId,
        rap: item.recentAveragePrice,
        serial: item.serialNumber || null,
        value: itemInfo[3] || -1,
        demand: demandMap[rawDemand] || "N/A",
        trend: trendMap[rawTrend] || "N/A",
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
