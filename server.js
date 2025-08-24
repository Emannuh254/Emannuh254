import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "tiktok-video-no-watermark2.p.rapidapi.com";

app.post("/download", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const apiUrl = `https://${RAPIDAPI_HOST}/?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
    });

    const data = await response.json();

    if (data && data.data && data.data.play) {
      res.json({
        video: data.data.play,
        hd: data.data.hdplay || null,
      });
    } else {
      res.status(404).json({ error: "Failed to fetch video" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
