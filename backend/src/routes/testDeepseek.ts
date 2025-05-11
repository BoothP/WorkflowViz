import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

router.get('/test-deepseek', async (_, res) => {
  const key = process.env.DEEPSEEK_API_KEY;
  console.log('🔑 [raw fetch] DEEPSEEK_API_KEY:', key);

  try {
    const apiRes = await fetch('https://api.deepseek.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });
    const body = await apiRes.text();
    return res.status(apiRes.status).json({ status: apiRes.status, body: JSON.parse(body) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
