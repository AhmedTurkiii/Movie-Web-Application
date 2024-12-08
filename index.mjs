import express, { text } from 'express';
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

// intializing sessions using 
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))


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


  async function searchByTitle(mediaType, title){
    const url = `${TMDB_BASE_URL}/search/${mediaType}?api_key=${TMDB_API_KEY}&query=${title}&language=en-US&page=1`
    const response = await fetch(url);
    const data = await response.json();
    console.log(url);
    return data.results;
  }

app.get('/', async (req, res) => {
    try {
      res.render('index');
    } catch (error) {
        console.error('Error home:', error);
  }
});

app.get('/search', async (req, res) => {
  let mediaType = req.query.mediaType;
  let title = req.query.title;
  
  if(typeof mediaType == 'undefined' || mediaType == 'movie'){
    try {
      const movies = await searchByTitle(mediaType, title);
      res.render('search', { title: `Results for search: ${title}`, movies });
    } catch (error) {
      console.error('Error while searching:', error);
      res.status(500).send('Server Error');
    }
  }else if(mediaType == 'tv'){
    try {
      const tvshows = await searchByTitle(mediaType, title);
      res.render('search', { title: `Results for search: ${title}`, tvshows});
      return;
    } catch (error) {
      console.error('Error while searching:', error);
      res.status(500).send('Server Error');
    }
  }
});

// Route for "Now Playing" movies
app.get('/search', async (req, res) => {
  let mediaType = req.query.mediaType;
  let title = req.query.title;
  
  if(typeof mediaType == 'undefined' || mediaType == 'movie'){
    try {
      const movies = await searchByTitle(mediaType, title);
      res.render('search', { title: `Results for search: ${title}`, movies });
    } catch (error) {
      console.error('Error while searching:', error);
      res.status(500).send('Server Error');
    }
  }else if(mediaType == 'tv'){
    try {
      const tvshows = await searchByTitle(mediaType, title);
      res.render('search', { title: `Results for search: ${title}`, tvshows});
      return;
    } catch (error) {
      console.error('Error while searching:', error);
      res.status(500).send('Server Error');
    }
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

// Route for movie details
app.get('/movies/:id', async (req, res) => {
  const movieId = req.params.id;
  const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos`;

  try {
    const response = await fetch(url);
    const movie = await response.json();
    const director = movie.credits?.crew?.find(person => person.job === 'Director');
    const writer = movie.credits?.crew?.find(person => person.job === 'Writer');
    const trailer = movie.videos?.results?.find(video => video.type === 'Trailer');

    res.render('titleDetails', { mediaType: 'movie', media: movie, director, writer, trailer });
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).send('Server Error');
  }
});

// Route for TV show details
app.get('/tvshows/:id', async (req, res) => {
  const showId = req.params.id;
  const url = `${TMDB_BASE_URL}/tv/${showId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos`;

  try {
    const response = await fetch(url);
    const show = await response.json();
    const director = show.credits?.crew?.find(person => person.job === 'Director');
    const writer = show.credits?.crew?.find(person => person.job === 'Writer');
    const trailer = show.videos?.results?.find(video => video.type === 'Trailer');

    res.render('titleDetails', { mediaType: 'tvshow', media: show, director, writer, trailer });
  } catch (error) {
    console.error('Error fetching show details:', error);
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
      res.redirect('/');
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
      res.redirect('/');
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

app.get('/login', (req, res) => {
  res.render('login');
}
);

app.get('/register', (req, res) => {
  res.render('register');
}
);

app.post('/login', async (req, res) => {

  let username = req.body.username;
  let password = req.body.password;
  console.log(password);

  let sql = `SELECT * FROM admin WHERE username = ?;`;
  let sqlParams = [username];
  const [rows] = await conn.query(sql, sqlParams);

  let passwordHash = "";
  if (rows.length > 0){ // it found at least one record that means the user name and password is equal to what we have in the database
      passwordHash = rows[0].password;
  }
  let match = await bcrypt.compare(password, passwordHash);
  console.log(match);
  console.log(password, passwordHash);

  if(match){
      req.session.auth = true;
      req.session.fullName = rows[0].firstName + " " + rows[0].lastName ;
      res.render('welcome')
  }else{
      res.redirect('/')
  }
});
// Middleware function for checking if user is authenticated
function isAuthenticated(req, res, next){
  if(req.session.auth){
      next();
  }else{
      res.redirect("/");
  }
}

// server port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
