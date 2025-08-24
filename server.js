const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Endpoint to download TikTok video
app.post('/download', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'No URL provided' });

  try {
    // Use a free TikTok API (TikMate) to get download link
    const apiRes = await axios.get(`https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`);
    const data = apiRes.data;

    if (data && data.video && data.video[0] && data.video[0].url_no_watermark) {
      res.json({ downloadUrl: data.video[0].url_no_watermark });
    } else {
      res.status(500).json({ error: 'Failed to fetch video' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
