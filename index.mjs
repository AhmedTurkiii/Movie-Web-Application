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
      let likedLists = [];
      if (req.session.authenticated) {
        const userId = req.session.userId;
        const sqlLikedLists = `SELECT userLists.listId, userLists.listName, user.username
                               FROM likes
                               JOIN userLists ON likes.listId = userLists.listId
                               JOIN user ON userLists.userId = user.userId
                               WHERE likes.userId = ? AND userLists.isPublished = 1`;
  
        const connection = await pool.getConnection();
        [likedLists] = await connection.query(sqlLikedLists, [userId]);
        connection.release();
      }
      res.render('index', {
        isLoggedIn: req.session.authenticated,
        username: req.session.username,
        likedLists
      });
    } catch (error) {
      console.error('Error fetching liked lists:', error);
      res.status(500).send('Server Error');
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
  const userId = req.session.userId;
  const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos`;

  try {
    const connection = await pool.getConnection();
    const response = await fetch(url);
    const movie = await response.json();
    const [lists] = await connection.query('SELECT * FROM userLists WHERE userId = ?', [userId]);
    const [listItems] = await connection.query('SELECT titleId, listId FROM listItems WHERE userId = ?', [userId]);
    connection.release();
    const director = movie.credits?.crew?.find(person => person.job === 'Director');
    const writer = movie.credits?.crew?.find(person => person.job === 'Writer');
    const trailer = movie.videos?.results?.find(video => video.type === 'Trailer');

    res.render('titleDetails', { mediaType: 'movie', media: movie, director, writer, trailer, lists, listItems});
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).send('Server Error');
  }
});

// Route for TV show details
app.get('/tvshows/:id', async (req, res) => {
  const showId = req.params.id;
  const userId = req.session.userId;
  const url = `${TMDB_BASE_URL}/tv/${showId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos`;
  try {
    const connection = await pool.getConnection();
    const response = await fetch(url);
    const show = await response.json();
    const [lists] = await connection.query('SELECT * FROM userLists WHERE userId = ?', [userId]);
    const [listItems] = await connection.query('SELECT titleId, listId FROM listItems WHERE userId = ?', [userId]);
    connection.release();
    const director = show.credits?.crew?.find(person => person.job === 'Director');
    const writer = show.credits?.crew?.find(person => person.job === 'Writer');
    const trailer = show.videos?.results?.find(video => video.type === 'Trailer');

    res.render('titleDetails', { mediaType: 'tvshow', media: show, director, writer, trailer, lists, listItems});
  } catch (error) {
    console.error('Error fetching show details:', error);
    res.status(500).send('Server Error');
  }
});

// Route to display all lists
app.get('/lists', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).send('Unauthorized');
  }
  let sql = `SELECT * 
             FROM userLists
             WHERE userId = ?`;
  try {
    const connection = await pool.getConnection();
    const [lists] = await connection.query(sql, [userId]);
    connection.release();
    res.render('lists', {lists, isLoggedIn: req.session.authenticated, username: req.session.username });
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).send('Server Error');
  }
});

// Route to display a specific list
app.get('/lists/:listId', async (req, res) => {
  const userId = req.session.userId;
  const { listId } = req.params;
  const sqlList = `SELECT userLists.*, user.username 
                   FROM userLists 
                   JOIN user ON userLists.userId = user.userId
                   WHERE userLists.listId = ? AND (userLists.isPublished = 1 OR userLists.userId = ?)`;
  const sqlItems = 'SELECT * FROM listItems WHERE listId = ?';
  try {
    const connection = await pool.getConnection();
    const [lists] = await connection.query(sqlList, [listId, userId]);
    const [items] = await connection.query(sqlItems, [listId]);
    connection.release();
    if (lists.length === 0) {
      return res.status(404).send('List not found or not accessible');
    }
    // Fetch details for each item in the list
    const movieDetails = [];
    const tvShowDetails = [];
    for (const item of items) {
      const urlMovie = `${TMDB_BASE_URL}/movie/${item.titleId}?api_key=${TMDB_API_KEY}&language=en-US`;
      const urlTvShow = `${TMDB_BASE_URL}/tv/${item.titleId}?api_key=${TMDB_API_KEY}&language=en-US`;
      try {
        const responseMovie = await fetch(urlMovie);
        if (responseMovie.ok) {
          const movie = await responseMovie.json();
          movieDetails.push(movie);
        } else {
          const responseTvShow = await fetch(urlTvShow);
          if (responseTvShow.ok) {
            const show = await responseTvShow.json();
            tvShowDetails.push(show);
          }
        }
      } catch (err) {
        console.error(`Error fetching details for titleId ${item.titleId}:`, err);
      }
    }
    res.render('listItems', {
      list: lists[0],
      movieDetails,
      tvShowDetails,
      isLoggedIn: req.session?.authenticated || false,
      username: req.session?.username || ''
    });
  } catch (error) {
    console.error('Error fetching list items:', error);
    res.status(500).send('Server Error');
  }
});


// Route to create a new list
app.post('/lists', async (req, res) => {
  const { listName, isPublished } = req.body;
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).send('Unauthorized');
  }
  if (!listName) {
    return res.status(400).send('List name is required');
  }
  const sql = `INSERT INTO userLists (userId, listName, isPublished) 
               VALUES (?, ?, ?)`;
  try {
    const connection = await pool.getConnection();
    await connection.query(sql, [userId, listName, isPublished]);
    connection.release();
    res.redirect('/lists');
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).send('Server Error');
  }
});


// Route to add a title to a list
app.post('/lists/add', async (req, res) => {
  const { listId, titleId } = req.body;
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).send('Unauthorized');
  }
  const sql = 'INSERT INTO listItems (userId, listId, titleId) VALUES (?, ?, ?)';
  try {
    const connection = await pool.getConnection();
    await connection.query(sql, [userId, listId, titleId]);
    connection.release();
    res.redirect(`/lists/${listId}`);
  } catch (error) {
    console.error("Error adding to list:", error);
    res.status(500).send("Server Error");
  }
});


// Route to create a new list and add title to it
app.post('/lists/new', async (req, res) => {
  const { listName, isPublished, titleId } = req.body;
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).send('Unauthorized');
  }
  const sqlCreateList = 'INSERT INTO userLists (userId, listName, isPublished) VALUES (?, ?, ?)';
  const sqlGetListId = 'SELECT LAST_INSERT_ID() as listId';
  const sqlAddToList = 'INSERT INTO listItems (userId, listId, titleId) VALUES (?, ?, ?)';
  try {
    const connection = await pool.getConnection();
    await connection.query(sqlCreateList, [userId, listName, isPublished]);
    const [result] = await connection.query(sqlGetListId);
    const listId = result[0].listId;
    await connection.query(sqlAddToList, [userId, listId, titleId]);
    connection.release();
    res.redirect(`/lists/${listId}`);
  } catch (error) {
    console.error("Error creating list and adding title:", error);
    res.status(500).send("Server Error");
  }
});


// Route to remove a title from a list
app.post('/lists/:listId/remove', async (req, res) => {
  const {listId} = req.params;
  const {titleId} = req.body;
  const userId = req.session.userId; 
  if (!userId) {
    return res.status(401).send('Unauthorized');
  }
  const sql = 'DELETE FROM listItems WHERE userId = ? AND listId = ? AND titleId = ?';
  try {
    const connection = await pool.getConnection();
    await connection.query(sql, [userId, listId, titleId]);
    connection.release();
    res.redirect(`/lists/${listId}`); // Redirect to the specific list page
  } catch (error) {
    console.error("Error removing from list:", error);
    res.status(500).send("Server Error");
  }
});

// Route to delete a list
app.post('/lists/:listId/delete', async (req, res) => {
  const userId = req.session.userId;
  const { listId } = req.params;

  if (!userId) {
    return res.status(401).send('Unauthorized');
  }

  const sqlDeleteList = 'DELETE FROM userLists WHERE userId = ? AND listId = ?';
  const sqlDeleteItems = 'DELETE FROM listItems WHERE userId = ? AND listId = ?';

  try {
    const connection = await pool.getConnection();
    await connection.query(sqlDeleteItems, [userId, listId]);
    await connection.query(sqlDeleteList, [userId, listId]);
    connection.release();
    res.redirect('/lists');
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).send('Server Error');
  }
});

app.get('/userLists', async (req, res) => {
  const sql = `SELECT userLists.listId, userLists.listName, user.username, COUNT(likes.listId) AS likeCount
               FROM userLists
               JOIN user ON userLists.userId = user.userId
               LEFT JOIN likes ON userLists.listId = likes.listId
               WHERE userLists.isPublished = 1
               GROUP BY userLists.listId
               ORDER BY likeCount DESC`;
  try {
    const connection = await pool.getConnection();
    const [lists] = await connection.query(sql);
    connection.release();
    res.render('userLists', { lists, isLoggedIn: req.session.authenticated, username: req.session.username });
  } catch (error) {
    console.error('Error fetching published lists:', error);
    res.status(500).send('Server Error');
  }
});


// Route to handle liking a list
app.post('/lists/:listId/like', async (req, res) => {
  const userId = req.session.userId;
  const { listId } = req.params;
  if (!userId) {
    return res.status(401).send('Unauthorized');
  }
  const sqlCheckLike = 'SELECT * FROM likes WHERE userId = ? AND listId = ?';
  const sqlInsertLike = 'INSERT INTO likes (userId, listId) VALUES (?, ?)';
  try {
    const connection = await pool.getConnection();
    const [existingLikes] = await connection.query(sqlCheckLike, [userId, listId]);
    if (existingLikes.length === 0) {
      await connection.query(sqlInsertLike, [userId, listId]);
    }
    connection.release();
    res.redirect('/userLists');
  } catch (error) {
    console.error('Error liking the list:', error);
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
      req.session.userId = rows[0].userId;
      console.log('User authenticated:', req.session);
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
  let sqlCheck = `SELECT * FROM user WHERE username = ?`;
  let sqlInsert = `INSERT INTO user (username, password) VALUES (?, ?)`;
  let sqlGetUserId = `SELECT userId FROM user WHERE username = ?`;
  try {
    const connection = await pool.getConnection();
    const [existingUser] = await connection.query(sqlCheck, [username]);
    if (existingUser.length > 0) {
      res.json({ success: false, message: "Username already exists" });
    } else {
      await connection.query(sqlInsert, [username, password]);
      const [userRows] = await connection.query(sqlGetUserId, [username]);
      req.session.authenticated = true;
      req.session.username = username;
      req.session.userId = userRows[0].userId; // Set the userId in session
      res.json({ success: true, redirectUrl: '/' });
    }
    connection.release();
  } catch (error) {
    console.error("Error during signup:", error); 
    res.status(500).json({ success: false, message: "Server Error" });
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
