# Movie App  

## Overview  
This is a collaborative full-stack web application built with **Node.js**, **Express**, **EJS**, **bcrypt**, and **MySQL2**. The app allows users to:  

- **Browse and view movie information** fetched from a MySQL database.  
- **Register and log in** securely using **bcrypt** for password hashing.  
- **Like, comment on, and add movies to their favorites list.**  
- **Remove movies from their favorites list.**  

## Collaborators  
This project is developed by:  
- **Eric Rios**  
- **Ezequiel Reyes**  
- **Ahmed Torki**  

## Features  

### User Management  
- **User Registration**: Users can create accounts, with passwords securely hashed using bcrypt.  
- **User Authentication**: Users log in to access personalized features like liking and adding to favorites.  

### Movies Management  
- **View Movies**: Users can browse a list of movies or view detailed information about a specific movie.  
- **Like Movies**: Users can like their favorite movies, and the app tracks the total likes for each movie.  
- **Comment on Movies**: Users can leave comments on movies they enjoy.  
- **Favorite Movies**: Users can add movies to their favorites list and remove them later if desired.  

### Backend Functionality  
- **MySQL Database**: Stores user information, movie data, likes, comments, and favorites.  
- **Secure Routes**: Protect sensitive routes, ensuring only authenticated users can interact with features like commenting or managing favorites.  

## Tech Stack  

### Backend  
- **Node.js**: Runtime environment for server-side JavaScript.  
- **Express.js**: Framework for building the API and managing routes.  
- **bcrypt**: Library for hashing and verifying passwords.  

### Frontend  
- **EJS**: Template engine for dynamic server-side HTML rendering.  

### Database  
- **MySQL2**: Manages data storage, queries, and relationships.  

## Setup Instructions  

### Prerequisites  
1. **Node.js** and **npm** installed on your system.  
2. **MySQL** installed and running.  

### Installation  
1. Clone this repository:  
   ```bash  
   git clone <repository-url>  
   cd <repository-folder>  
2. Install dependencies:
      npm install  
