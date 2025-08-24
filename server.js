const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 6040;

// Function to expand short TikTok URLs (vm.tiktok.com)
async function expandTikTokUrl(url) {
  try {
    const response = await axios.get(url, { maxRedirects: 0, validateStatus: null });
    if (response.status === 301 || response.status === 302) {
      return response.headers.location; // full video URL
    }
    return url; // already full URL
  } catch (err) {
    return url;
  }
}

app.post('/download', async (req, res) => {
  let { url } = req.body;

  if (!url) return res.status(400).json({ error: 'No URL provided' });

  try {
    // Expand short TikTok links if needed
    url = await expandTikTokUrl(url);

    // Lookup TikTok video using TikMate API
    const lookup = await axios.get(`https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`);

    if (!lookup.data || !lookup.data.video_url) {
      return res.status(400).json({ error: 'Could not fetch video URL. Make sure it is a valid TikTok video.' });
    }

    const videoUrl = lookup.data.video_url;

    // Fetch video as stream
    const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });

    res.setHeader('Content-Disposition', 'attachment; filename="tiktok_video.mp4"');
    res.setHeader('Content-Type', 'video/mp4');

    videoResponse.data.pipe(res);

  } catch (err) {
    console.error('Error fetching TikTok video:', err.message);
    res.status(500).json({ error: 'Failed to fetch video. Make sure the link is correct and public.' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
