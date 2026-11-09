const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// e621 API base URL
const E621_API = 'https://e621.net';

// Configure axios with default headers for e621
const e621Client = axios.create({
  baseURL: E621_API,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://e621.net/'
  },
  timeout: 15000,
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set content type for old browsers
app.use((req, res, next) => {
  res.setHeader('X-UA-Compatible', 'IE=edge');
  next();
});

// Home page - simple landing page
app.get('/', (req, res) => {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>e621 Proxy</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 8px; background: #1a1a2e; color: #e0e0e0; }
    .header { text-align: center; margin-bottom: 10px; padding: 5px; background: #0a0a1a; border-bottom: 1px solid #2a2a4a; }
    .header h1 { color: #4da6ff; margin: 0; }
    .nav { margin-bottom: 10px; text-align: center; }
    .nav a { padding: 5px 10px; margin: 0 3px; border: 1px solid #2a2a4a; text-decoration: none; color: #4da6ff; background: #0a0a1a; }
    .nav a:hover { background: #2a2a4a; }
    .info { text-align: center; margin-top: 20px; padding: 10px; border: 1px solid #2a2a4a; background: #0a0a1a; color: #c0c0c0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>e621 Proxy</h1>
  </div>
  
  <div class="nav">
    <a href="/posts?page=1">Home</a>
    <a href="/search">Search</a>
    <a href="/random">Random</a>
  </div>
  
  <div class="info">
    <p>Browse e621 on mobile browsers</p>
    <p>Click Home to view latest posts, or Search to find specific content</p>
  </div>
</body>
</html>`;
  
  res.send(html);
});

// Search posts
app.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const tags = req.query.tags || '';
    
    let apiUrl = `/posts.json?page=${page}&limit=${limit}`;
    
    if (tags) {
      apiUrl += `&tags=${encodeURIComponent(tags)}`;
    }
    
    const response = await e621Client.get(apiUrl);
    
    const posts = response.data.posts || [];
    
    // Generate simple HTML for old browsers
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>e621 Proxy - Page ${page}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 8px; background: #1a1a2e; color: #e0e0e0; }
    .header { text-align: center; margin-bottom: 10px; padding: 5px; background: #0a0a1a; border-bottom: 1px solid #2a2a4a; }
    .header h1 { color: #4da6ff; margin: 0; }
    .search { margin-bottom: 10px; text-align: center; }
    .search input { width: 70%; padding: 5px; border: 1px solid #2a2a4a; background: #0a0a1a; color: #e0e0e0; }
    .search button { padding: 5px 10px; border: 1px solid #2a2a4a; cursor: pointer; background: #0a0a1a; color: #4da6ff; }
    .post { margin-bottom: 15px; padding: 8px; border: 1px solid #2a2a4a; border-radius: 3px; background: #0a0a1a; }
    .post img { max-width: 100%; height: auto; display: block; margin: 5px 0; background: #0a0a1a; }
    .post .tags { font-size: 12px; color: #88aacc; margin-top: 5px; word-wrap: break-word; }
    .post .score { font-size: 11px; color: #6688cc; }
    .post a { color: #4da6ff; text-decoration: none; }
    .pagination { text-align: center; margin: 15px 0; }
    .pagination a { padding: 5px 10px; margin: 0 3px; border: 1px solid #2a2a4a; text-decoration: none; color: #4da6ff; background: #0a0a1a; }
    .pagination a:hover { background: #2a2a4a; }
    .nav { margin-bottom: 10px; text-align: center; }
    .nav a { padding: 5px 10px; margin: 0 3px; border: 1px solid #2a2a4a; text-decoration: none; color: #4da6ff; background: #0a0a1a; }
    .nav a:hover { background: #2a2a4a; }
  </style>
</head>
<body>
  <div class="header">
    <h1>e621 Proxy</h1>
  </div>
  
  <div class="nav">
    <a href="/posts?page=1">Home</a>
    <a href="/search">Search</a>
    <a href="/random">Random</a>
  </div>
  
  <div class="search">
    <form action="/posts" method="get">
      <input type="text" name="tags" placeholder="Search tags..." value="${tags}">
      <input type="hidden" name="page" value="1">
      <button type="submit">Search</button>
    </form>
  </div>
`;

    if (posts.length === 0) {
      html += '<p style="text-align: center;">No posts found.</p>';
    } else {
      posts.forEach(post => {
        const tags = post.tags.general.join(' ') + ' ' + post.tags.artist.join(' ') + ' ' + post.tags.character.join(' ') + ' ' + post.tags.copyright.join(' ');
        const imageUrl = post.file.url || post.preview.url;
        const score = post.score.total;
        const id = post.id;
        
        html += `
  <div class="post">
    <a href="/post/${id}"><strong>Post #${id}</strong></a> - <span class="score">Score: ${score}</span>
    <a href="/post/${id}"><img src="/img/${encodeURIComponent(imageUrl)}" alt="Post ${id}" onerror="this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='"></a>
    <div class="tags">${tags}</div>
  </div>
`;
      });
    }

    // Pagination
    html += `
  <div class="pagination">
`;
    if (page > 1) {
      html += `<a href="/posts?page=${page - 1}&tags=${encodeURIComponent(tags)}">&laquo; Previous</a>`;
    }
    html += `<span>Page ${page}</span>`;
    html += `<a href="/posts?page=${page + 1}&tags=${encodeURIComponent(tags)}">Next &raquo;</a>`;
    html += `
  </div>
`;

    html += `
  <div class="nav" style="margin-top: 20px;">
    <a href="/posts?page=1">Home</a>
    <a href="/search">Search</a>
    <a href="/random">Random</a>
  </div>
  
  <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #888;">
    e621 Proxy - Read-only mode
  </div>
</body>
</html>
`;

    res.send(html);
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    // Generate error page with search bar so user can still navigate
    let errorMsg = 'Failed to load posts';
    if (error.code === 'ECONNABORTED') {
      errorMsg = 'Request timed out. e621 might be slow or temporarily unavailable. Please try again.';
    } else if (error.response) {
      errorMsg = `Error: ${error.response.status} - ${error.response.statusText}`;
    }
    
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error - e621 Proxy</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 8px; background: #1a1a2e; color: #e0e0e0; }
    .header { text-align: center; margin-bottom: 10px; padding: 5px; background: #0a0a1a; border-bottom: 1px solid #2a2a4a; }
    .header h1 { color: #4da6ff; margin: 0; }
    .error { color: #ff6b6b; padding: 10px; border: 1px solid #ff6b6b; background: #2a0a0a; margin: 10px 0; }
    .search { margin-bottom: 10px; text-align: center; }
    .search input { width: 70%; padding: 5px; border: 1px solid #2a2a4a; background: #0a0a1a; color: #e0e0e0; }
    .search button { padding: 5px 10px; border: 1px solid #2a2a4a; cursor: pointer; background: #0a0a1a; color: #4da6ff; }
    .nav { margin-bottom: 10px; text-align: center; }
    .nav a { padding: 5px 10px; margin: 0 3px; border: 1px solid #2a2a4a; text-decoration: none; color: #4da6ff; background: #0a0a1a; }
    .nav a:hover { background: #2a2a4a; }
  </style>
</head>
<body>
  <div class="header">
    <h1>e621 Proxy</h1>
  </div>
  
  <div class="nav">
    <a href="/posts?page=1">Home</a>
    <a href="/search">Search</a>
    <a href="/random">Random</a>
  </div>
  
  <div class="search">
    <form action="/posts" method="get">
      <input type="text" name="tags" placeholder="Search tags...">
      <input type="hidden" name="page" value="1">
      <button type="submit">Search</button>
    </form>
  </div>
  
  <div class="error">
    <strong>Error:</strong> 
    <br><br>Try again in a moment, or check if e621 is accessible.
  </div>
  
  <div class="nav" style="margin-top: 20px;">
    <a href="/posts?page=1">Home</a>
    <a href="/search">Search</a>
    <a href="/random">Random</a>
  </div>
</body>
</html>`;
    
    res.status(500).send(html);
  }
});

// Single post view
app.get('/post/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const response = await e621Client.get(`/posts/${postId}.json`);
    
    const post = response.data.post;
    const tags = post.tags.general.join(' ') + ' ' + post.tags.artist.join(' ') + ' ' + post.tags.character.join(' ') + ' ' + post.tags.copyright.join(' ');
    const imageUrl = post.file.url || post.preview.url;
    
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Post #${postId} - e621 Proxy</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 8px; background: #1a1a2e; color: #e0e0e0; }
    .header { text-align: center; margin-bottom: 10px; padding: 5px; background: #0a0a1a; border-bottom: 1px solid #2a2a4a; }
    .header h1 { color: #4da6ff; margin: 0; }
    .post { margin-bottom: 15px; padding: 8px; border: 1px solid #2a2a4a; border-radius: 3px; background: #0a0a1a; }
    .post img { max-width: 100%; height: auto; display: block; margin: 5px 0; background: #0a0a1a; }
    .post .info { margin-top: 10px; font-size: 12px; color: #88aacc; }
    .post .tags { font-size: 12px; color: #88aacc; margin-top: 10px; word-wrap: break-word; }
    .nav { margin-bottom: 10px; text-align: center; }
    .nav a { padding: 5px 10px; margin: 0 3px; border: 1px solid #2a2a4a; text-decoration: none; color: #4da6ff; background: #0a0a1a; }
    .nav a:hover { background: #2a2a4a; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Post #${postId}</h1>
  </div>
  
  <div class="nav">
    <a href="/posts?page=1">Home</a>
    <a href="/search">Search</a>
    <a href="/random">Random</a>
  </div>
  
  <div class="post">
    <strong>Post #${postId}</strong>
    <div class="info">
      Score: ${post.score.total} | Rating: ${post.rating} | Uploaded: ${new Date(post.created_at).toLocaleDateString()}<br>
      Size: ${post.file.width}x${post.file.height} | ${post.file.size} bytes | ${post.file.ext}
    </div>
    <img src="/img/${encodeURIComponent(imageUrl)}" alt="Post ${postId}" onerror="this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='">
    <div class="tags">Tags: ${tags}</div>
  </div>
  
  <div class="nav" style="margin-top: 20px;">
    <a href="/posts?page=1">Home</a>
    <a href="/search">Search</a>
    <a href="/random">Random</a>
  </div>
  
  <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #888;">
    <a href="/posts?page=1">&laquo; Back to list</a>
  </div>
</body>
</html>
`;

    res.send(html);
  } catch (error) {
    console.error('Error fetching post:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
    }
    res.status(404).send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error - e621 Proxy</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 8px; background: #1a1a2e; color: #e0e0e0; }
    .header { text-align: center; margin-bottom: 10px; padding: 5px; background: #0a0a1a; border-bottom: 1px solid #2a2a4a; }
    .header h1 { color: #4da6ff; margin: 0; }
    .error { color: #ff6b6b; padding: 10px; border: 1px solid #ff6b6b; background: #2a0a0a; margin: 10px 0; }
    .error a { color: #4da6ff; text-decoration: none; }
    .nav { margin-bottom: 10px; text-align: center; }
    .nav a { padding: 5px 10px; margin: 0 3px; border: 1px solid #2a2a4a; text-decoration: none; color: #4da6ff; background: #0a0a1a; }
    .nav a:hover { background: #2a2a4a; }
  </style>
</head>
<body>
  <div class="header">
    <h1>e621 Proxy</h1>
  </div>
  
  <div class="nav">
    <a href="/posts?page=1">Home</a>
    <a href="/search">Search</a>
    <a href="/random">Random</a>
  </div>
  
  <div class="error">
    <strong>Error:</strong> Post not found or unable to load. ${error.message}
    <br><br><a href="/posts?page=1">&laquo; Back to list</a>
  </div>
</body>
</html>`);
  }
});

// Search page
app.get('/search', (req, res) => {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Search - e621 Proxy</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 8px; background: #1a1a2e; color: #e0e0e0; }
    .header { text-align: center; margin-bottom: 10px; padding: 5px; background: #0a0a1a; border-bottom: 1px solid #2a2a4a; }
    .header h1 { color: #4da6ff; margin: 0; }
    .search-box { margin: 20px 0; padding: 15px; border: 1px solid #2a2a4a; border-radius: 3px; background: #0a0a1a; }
    .search-box form { display: flex; flex-direction: column; gap: 10px; }
    .search-box input[type="text"] { width: 100%; padding: 8px; border: 1px solid #2a2a4a; box-sizing: border-box; background: #1a1a2e; color: #e0e0e0; }
    .search-box button { padding: 10px; border: 1px solid #2a2a4a; background: #0a0a1a; cursor: pointer; color: #4da6ff; }
    .nav { margin-bottom: 10px; text-align: center; }
    .nav a { padding: 5px 10px; margin: 0 3px; border: 1px solid #2a2a4a; text-decoration: none; color: #4da6ff; background: #0a0a1a; }
    .nav a:hover { background: #2a2a4a; }
    .info { font-size: 12px; color: #88aacc; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Search e621</h1>
  </div>
  
  <div class="nav">
    <a href="/posts?page=1">Home</a>
    <a href="/search">Search</a>
    <a href="/random">Random</a>
  </div>
  
  <div class="search-box">
    <form action="/posts" method="get">
      <input type="text" name="tags" placeholder="Enter tags (e.g., rating:safe furry)" required>
      <input type="hidden" name="page" value="1">
      <button type="submit">Search</button>
    </form>
    <div class="info">
      <p><strong>Examples:</strong></p>
      <p>rating:safe furry</p>
      <p>rating:questionable wolf</p>
      <p>character:sonic</p>
      <p>artist:blotch</p>
      <p>copyright:sonic_the_hedgehog</p>
    </div>
  </div>
  
  <div class="nav" style="margin-top: 20px;">
    <a href="/posts?page=1">Home</a>
    <a href="/search">Search</a>
    <a href="/random">Random</a>
  </div>
</body>
</html>
`;
  
  res.send(html);
});

// Random post
app.get('/random', async (req, res) => {
  try {
    res.redirect('/posts?page=' + Math.floor(Math.random() * 100) + 1);
  } catch (error) {
    res.status(500).send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error - e621 Proxy</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 8px; background: #1a1a2e; color: #e0e0e0; }
    .header { text-align: center; margin-bottom: 10px; padding: 5px; background: #0a0a1a; border-bottom: 1px solid #2a2a4a; }
    .header h1 { color: #4da6ff; margin: 0; }
    .error { color: #ff6b6b; padding: 10px; border: 1px solid #ff6b6b; background: #2a0a0a; margin: 10px 0; }
    .nav { margin-bottom: 10px; text-align: center; }
    .nav a { padding: 5px 10px; margin: 0 3px; border: 1px solid #2a2a4a; text-decoration: none; color: #4da6ff; background: #0a0a1a; }
    .nav a:hover { background: #2a2a4a; }
  </style>
</head>
<body>
  <div class="header">
    <h1>e621 Proxy</h1>
  </div>
  <div class="nav">
    <a href="/posts?page=1">Home</a>
    <a href="/search">Search</a>
    <a href="/random">Random</a>
  </div>
  <div class="error">
    <strong>Error:</strong> Failed to load random post.
  </div>
</body>
</html>`);
  }
});

// Image proxy to bypass e621 hotlink protection
app.get('/img/*', async (req, res) => {
  try {
    const imageUrl = decodeURIComponent(req.params[0]);
    
    console.log('Proxying image:', imageUrl);
    
    // Allow HTTPS URLs only for security
    if (!imageUrl.startsWith('https://') && !imageUrl.startsWith('http://localhost')) {
      console.log('Blocked non-HTTPS image URL:', imageUrl);
      const placeholder = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
      return res.type('image/png').send(placeholder);
    }
    
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://e621.net/'
      },
      timeout: 30000
    });
    
    res.type(response.headers['content-type'] || 'image/jpeg');
    res.send(response.data);
  } catch (error) {
    console.error('Error proxying image:', imageUrl, error.message);
    if (error.response) {
      console.error('Image proxy response status:', error.response.status, 'for URL:', imageUrl);
    }
    // Return a small transparent PNG as placeholder
    const placeholder = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    res.type('image/png').send(placeholder);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`e621 Proxy running on port ${PORT}`);
});
