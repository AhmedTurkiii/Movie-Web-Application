import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import session from 'express-session';

dotenv.config();
const TMDB_API_KEY="3150a1889c99611d3bcdfdc513a87194"
const PORT=10064
const app = express();
// const PORT = process.env.PORT || 3000;
// const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

app.use(express.static('public'));
app.set('view engine', 'ejs');

//initializing sessions
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));
app.use(express.json());
// Middleware to set common variables
app.use((req, res, next) => {
  console.log('Middleware - Authenticated:', req.session.authenticated);  // Log authentication status
  console.log('Middleware - Username:', req.session.username);  // Log username
  res.locals.isLoggedIn = req.session.authenticated || false;
  res.locals.username = req.session.username || '';
  next();
});

const pool = mysql.createPool({
  host: "eric-rios.tech",
  user: "ericrios_webuser",
  password: "Cst-336",
  database: "ericrios_movies",
  connectionLimit: 10,
  waitForConnections: true
});

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
  try {
    const movies = await fetchMovies('now_playing');
    res.render('movies', { title: 'Now Playing', movies });
  } catch (error) {
    console.error('Error fetching Now Playing movies:', error);
    res.status(500).send('Server Error');
  }
});

// Route for "Popular" movies
app.get('/popular', async (req, res) => {
  try {
    const movies = await fetchMovies('popular');
    res.render('movies', { title: 'Popular Movies', movies });
  } catch (error) {
    console.error('Error fetching Popular movies:', error);
    res.status(500).send('Server Error');
  }
});

// Route for "Top Rated" movies
app.get('/top-rated', async (req, res) => {
  try {
    const movies = await fetchMovies('top_rated');
    res.render('movies', { title: 'Top Rated Movies', movies });
  } catch (error) {
    console.error('Error fetching Top Rated movies:', error);
    res.status(500).send('Server Error');
  }
});

// Route for "Upcoming" movies
app.get('/upcoming', async (req, res) => {
  try {
    const movies = await fetchMovies('upcoming');
    res.render('movies', { title: 'Upcoming Movies', movies });
  } catch (error) {
    console.error('Error fetching Upcoming movies:', error);
    res.status(500).send('Server Error');
  }
});

// route for TV shows using the user input
app.get('/tvshows', async (req, res) => {
    const category = req.query.category || 'popular';
    try {
        const tvshows = await fetchTv(category); 
        if (category === 'popular') {
            res.render('tvshows', { title: 'Popular TV Shows', tvshows, selectedCategory: category });
            return;
        }else if (category === 'top_rated') {
            res.render('tvshows', { title: 'Top Rated TV Shows', tvshows, selectedCategory: category });
            return;
        }else if (category === 'on_the_air') {
            res.render('tvshows', { title: 'On The Air TV Shows', tvshows, selectedCategory: category });
            return;
        }else if (category === 'airing_today') {
            res.render('tvshows', { title: 'Airing Today TV Shows', tvshows, selectedCategory: category });
            return;
        }
    } catch (error) {
        console.error('Error fetching TV shows:', error);
        res.status(500).send('Server Error');
    }
});

app.get('/movie/:id', async (req, res) => {
  const movieId = req.params.id;
  const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos`;

  try {
    const response = await fetch(url);
    const movie = await response.json();
    const director = movie.credits.crew.find(person => person.job === 'Director');
    const writer = movie.credits.crew.find(person => person.job === 'Writer');
    const trailer = movie.videos.results.find(video => video.type === 'Trailer');

    res.render('movieDetail', { movie, director, writer, trailer });
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).send('Server Error');
  }
});



app.get('/login', (req, res) => {
   res.render('login');
});

app.post('/login', async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  console.log(password);
  let sql = `SELECT * 
             FROM user
             WHERE username = ? AND password = ?`;
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(sql, [username, password]);
    connection.release();

    if (rows.length > 0) {
      req.session.authenticated = true;
      req.session.username = username;
      res.render('index', {isLoggedIn: req.session.authenticated, username: req.session.username});
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.error("Error during login: ", error);
    res.status(500).send("Server Error");
  }
});

app.get('/signup', (req, res) => { 
  res.render('signup');
});

app.post('/signup', async (req, res) => { 
  let username = req.body.username;
  let password = req.body.password;
  console.log(password);
  let sqlCheck = `SELECT * 
             FROM user
             WHERE username = ?`;
  let sqlInsert = `INSERT into user (username, password)
                   VALUES (?, ?)`;
  try {
    const connection = await pool.getConnection();
    const [existingUser] = await connection.query(sqlCheck, [username]);
    if (existingUser.length > 0) {
      res.send("Username already exists");
    } else {
      await connection.query(sqlInsert, [username, password]);
      req.session.authenticated = true;
      req.session.username = username;
      res.render('index', {isLoggedIn: req.session.authenticated, username: req.session.username});
    }
    connection.release();
  } catch (error) {
    console.error("Error during signup:", error); 
    res.status(500).send("Server Error");
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/')
});

// server port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
