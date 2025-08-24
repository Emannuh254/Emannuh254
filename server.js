=const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 6040;

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '65d5c39912mshd235d5dd1cfa074p103278jsn44431d37bc90';
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'tiktok-video-no-watermark2.p.rapidapi.com';

app.use(cors({ origin: '*' }));
app.use(express.json());

// POST /download - stream TikTok video
app.post('/download', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'Invalid URL' });

  try {
    // Step 1: Request RapidAPI to get TikTok video download URL
    const apiRes = await axios.get('https://tiktok-video-no-watermark2.p.rapidapi.com/video/url', {
      params: { url },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });

    const videoUrl = apiRes.data && apiRes.data.video && apiRes.data.video.downloadAddr;

    if (!videoUrl) return res.status(404).json({ error: 'Video not found or no download link' });

    // Step 2: Stream video to client
    const videoStream = await axios.get(videoUrl, { responseType: 'stream' });

    res.setHeader('Content-Disposition', 'attachment; filename="tiktok_video.mp4"');
    res.setHeader('Content-Type', 'video/mp4');

    videoStream.data.pipe(res);

  } catch (err) {
    console.error('Error fetching TikTok video:', err.message);
    res.status(500).json({ error: 'Failed to fetch video. Try again later.' });
  }
});

// Health check
app.get('/', (req, res) => res.send('TikTok Downloader API running!'));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
