const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// POST /download - get TikTok video link
app.post('/download', async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing URL' });
  }

  try {
    // Fetch TikTok video info from TikMate API
    const response = await axios.get(`https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`);
    const data = response.data;

    if (
      data &&
      Array.isArray(data.video) &&
      data.video[0] &&
      data.video[0].url_no_watermark
    ) {
      return res.json({ downloadUrl: data.video[0].url_no_watermark });
    }

    return res.status(404).json({ error: 'Video not found or no download link available' });
  } catch (error) {
    console.error('Error fetching TikTok video:', error.message);
    return res.status(500).json({ error: 'Failed to fetch video. Try again later.' });
  }
});

// Health check endpoint
app.get('/', (req, res) => res.send('TikTok Downloader API is running!'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
