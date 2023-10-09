// Import the Express.js framework
const express = require('express');
// Import the 'path' module for file path handling
const path = require('path');
// Import the 'fs' module for file system operations
const fs = require('fs');
// Import the 'uuid' module and rename the v4 function as 'uuidv4'
const { v4: uuidv4 } = require('uuid');
// Create an instance of the Express application
const app = express();
// Port number for the server
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// Serve the HTML pages index & notes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

// API Routes
// Listens for HTTP GET requests at the path
app.get('/api/notes', (req, res) => {
  fs.readFile('db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const notes = JSON.parse(data);
      res.json(notes);
    }
  });
});

// Listens for HTTP POST requests at the path
app.post('/api/notes', (req, res) => {
  fs.readFile('db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    const notes = JSON.parse(data);

    const newNote = {
      id: uuidv4(),
      title: req.body.title,
      text: req.body.text,
    };

    notes.push(newNote);

    fs.writeFile('db/db.json', JSON.stringify(notes), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      res.json(newNote);
    });
  });
});

//  Listens for HTTP DELETE requests at the path
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;

  fs.readFile('db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      let notes = JSON.parse(data);

      const index = notes.findIndex((note) => note.id === noteId);

      if (index !== -1) {
        notes.splice(index, 1);

        fs.writeFile('db/db.json', JSON.stringify(notes), (err) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
          } else {
            res.json({ message: 'Note deleted successfully' });
          }
        });
      } else {
        res.status(404).json({ error: 'Note not found' });
      }
    }
  });
});
 
// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
