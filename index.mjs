import express, { text } from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const TMDB_API_KEY="3150a1889c99611d3bcdfdc513a87194"
const PORT=10064
const app = express();
// const PORT = process.env.PORT || 3000;
// const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

app.use(express.static('public'));
app.set('view engine', 'ejs');

// fetch data from the TMDB API and return it in an array
async function fetchMovies(category) {
  const url = `${TMDB_BASE_URL}/movie/${category}?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results; // array of movies
}
async function fetchTv(category) {

    const url = `${TMDB_BASE_URL}/tv/${category}?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results; // array of tv shows
  }

app.get('/', async (req, res) => {
    try {
      res.render('index');
    } catch (error) {
        console.error('Error home:', error);

  }
});

// Route for "Now Playing" movies
app.get('/now-playing', async (req, res) => {
  let mediaType = req.query.mediaType;
  if(typeof mediaType == 'undefined' || mediaType == 'movies'){
    try {
      const movies = await fetchMovies('now_playing');
      res.render('titles', { title: 'Now Playing', movies });
    } catch (error) {
      console.error('Error fetching Now Playing movies:', error);
      res.status(500).send('Server Error');
    }
  }else if(mediaType == 'tvShows'){
    try {
      const tvshows = await fetchTv('on_the_air');
      res.render('titles', { title: 'Now Playing', tvshows});
      return;
    } catch (error) {
      console.error('Error fetching Now Playing TV shows:', error);
      res.status(500).send('Server Error');
    }
  }
});

// Route for "Popular" movies
app.get('/popular', async (req, res) => {
  let mediaType = req.query.mediaType;
  if(typeof mediaType == 'undefined' || mediaType == 'movies'){
    try {
      const movies = await fetchMovies('popular');
      res.render('titles', { title: 'Popular', movies });
    } catch (error) {
      console.error('Error fetching Popular movies:', error);
      res.status(500).send('Server Error');
    }
  }else if(mediaType == 'tvShows'){
    try {
      const tvshows = await fetchTv('popular'); 
      res.render('titles', { title: 'Popular', tvshows});
      return;
    } catch (error) {
      console.error('Error fetching Popular TV shows:', error);
      res.status(500).send('Server Error');
    }
  }
});

// Route for "Top Rated" movies
app.get('/top-rated', async (req, res) => {
  let mediaType = req.query.mediaType;
  if(typeof mediaType == 'undefined' || mediaType == 'movies'){
    try {
      const movies = await fetchMovies('top_rated');
      res.render('titles', { title: 'Top Rated', movies });
    } catch (error) {
      console.error('Error fetching Top Rated movies:', error);
      res.status(500).send('Server Error');
    }
  }else if(mediaType == 'tvShows'){
    try {
      const tvshows = await fetchTv('top_rated'); 
      res.render('titles', { title: 'Top Rated', tvshows});
      return;
    } catch (error) {
      console.error('Error fetching Top Rated TV shows:', error);
      res.status(500).send('Server Error');
    }
  }
});

// Route for "Upcoming" movies
app.get('/upcoming', async (req, res) => {
  let mediaType = req.query.mediaType;
  if(typeof mediaType == 'undefined' || mediaType == 'movies'){
    try {
      const movies = await fetchMovies('upcoming');
      res.render('titles', { title: 'Upcoming', movies });
    } catch (error) {
      console.error('Error fetching Upcoming movies:', error);
      res.status(500).send('Server Error');
    }
  }else if(mediaType == 'tvShows'){
    try {
      const tvshows = await fetchTv('airing_today'); 
      res.render('titles', { title: 'Upcoming', tvshows});
      return;
    } catch (error) {
      console.error('Error fetching Upcoming TV shows:', error);
      res.status(500).send('Server Error');
    } 
  }
});

// server port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
