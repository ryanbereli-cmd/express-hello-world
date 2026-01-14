// Twitter API Proxy Server for X Feed Analyzer
// Deploy this on Render.com (free tier)

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (you can restrict this to claude.ai if needed)
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Twitter API Proxy Server is running',
    endpoints: [
      'GET /api/user/me',
      'GET /api/user/lists',
      'GET /api/list/tweets/:listId'
    ]
  });
});

// Get authenticated user info
app.get('/api/user/me', async (req, res) => {
  try {
    const bearerToken = req.headers.authorization;
    
    if (!bearerToken) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const response = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': bearerToken
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Error in /api/user/me:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get user's lists
app.get('/api/user/lists', async (req, res) => {
  try {
    const bearerToken = req.headers.authorization;
    const userId = req.query.userId;
    
    if (!bearerToken) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter required' });
    }

    const response = await fetch(`https://api.twitter.com/2/users/${userId}/owned_lists`, {
      headers: {
        'Authorization': bearerToken
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Error in /api/user/lists:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get tweets from a list
app.get('/api/list/tweets/:listId', async (req, res) => {
  try {
    const bearerToken = req.headers.authorization;
    const { listId } = req.params;
    const maxResults = req.query.max_results || 100;
    
    if (!bearerToken) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const url = `https://api.twitter.com/2/lists/${listId}/tweets?max_results=${maxResults}&tweet.fields=created_at,author_id,public_metrics&expansions=author_id&user.fields=username,name`;

    const response = await fetch(url, {
      headers: {
        'Authorization': bearerToken
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Error in /api/list/tweets:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Twitter API Proxy Server running on port ${PORT}`);
});
