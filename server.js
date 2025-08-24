const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Stream TikTok video
app.post('/download', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'Invalid URL' });

  try {
    // Get video info from TikMate API
    const apiRes = await axios.get(`https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`);
    const data = apiRes.data;

    if (!data || !Array.isArray(data.video) || !data.video[0] || !data.video[0].url_no_watermark) {
      return res.status(404).json({ error: 'Video not found or no download link' });
    }

    const videoUrl = data.video[0].url_no_watermark;

    // Stream video
    const videoStream = await axios.get(videoUrl, { responseType: 'stream' });

    res.setHeader('Content-Disposition', 'attachment; filename="tiktok_video.mp4"');
    res.setHeader('Content-Type', 'video/mp4');

    videoStream.data.pipe(res);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch video. Try again later.' });
  }
});

// Health check
app.get('/', (req, res) => res.send('TikTok Downloader API running!'));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
