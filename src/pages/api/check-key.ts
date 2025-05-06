// pages/api/check-key.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const testChatModel = async (apiKey: string, model: string) => {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 1,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { usable: false, error: data.error?.message || 'Unknown error' };
    }

    return { usable: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return { usable: false, error: err.message || 'Unexpected error' };
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid API key' });
  }

  try {
    const modelsRes = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!modelsRes.ok) {
      const err = await modelsRes.json();
      return res
        .status(401)
        .json({ error: err.error?.message || 'Invalid API key' });
    }

    const modelsData = await modelsRes.json();

    const chatModels = modelsData.data
      .map((m: { id: string }) => m.id)
      .filter((id: string) => id.includes('gpt-')); // Simple filter to test chat models

    const results = await Promise.all(
      chatModels.map(async (model: string) => {
        const usage = await testChatModel(apiKey, model);
        return { id: model, ...usage };
      })
    );

    return res.status(200).json({ models: results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
