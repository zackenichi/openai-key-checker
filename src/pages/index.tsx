import { useState } from 'react';
import Head from 'next/head';
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  Alert,
} from '@mui/material';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setModels(null);

    try {
      const res = await fetch('/api/check-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Unknown error');
      } else {
        setModels(data.models);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>OpenAI API Key Checker</title>
      </Head>
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Typography variant="h1" gutterBottom>
          OpenAI API Key Checker
        </Typography>

        <TextField
          label="API Key"
          variant="outlined"
          fullWidth
          margin="normal"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading || !apiKey}
          sx={{ mt: 2 }}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : 'Check Models'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {models && (
          <List sx={{ mt: 3 }}>
            {models.map((model) => (
              <ListItem key={model}>{model}</ListItem>
            ))}
          </List>
        )}
      </Container>
    </>
  );
}
