import { useState } from 'react';
import {
  TextField,
  Button,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import { Model } from '@/resources/types/Model';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const handleCheckApiKey = async () => {
    setLoading(true);
    setError('');
    setModels([]);

    try {
      const response = await fetch('/api/check-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      if (!response.ok) {
        throw new Error('Failed to check API key.');
      }

      const data = await response.json();
      setModels(data.models);
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the server or invalid API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 2 }}>
      <Typography variant="h1" gutterBottom>
        OpenAI API Key Validator
      </Typography>

      <TextField
        label="API Key"
        variant="outlined"
        fullWidth
        value={apiKey}
        onChange={handleApiKeyChange}
        margin="normal"
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleCheckApiKey}
        fullWidth
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Check API Key'}
      </Button>

      {error && (
        <Typography color="error" sx={{ marginTop: 2 }}>
          {error}
        </Typography>
      )}

      {models.length > 0 && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6">Models</Typography>
          {models.map((model) => (
            <Box key={model.id} sx={{ marginBottom: 1 }}>
              <Typography variant="body1">
                <strong>{model.id}</strong> -{' '}
                {model.usable ? 'Usable' : `Not Usable: ${model.error}`}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
