////Owner Ankit Dhatterwal///////


require('dotenv').config();

const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

const db = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

app.get('/', (req, res) => {
    res.sendFile('./views/index.html', { root: __dirname });
});

app.post('/add-todo', upload.single('image'), (req, res) => {
    const { id, text } = req.body;
    const imagePath = req.file ? '/images/' + req.file.filename : null;
    db.query(
        `INSERT INTO todo_list (id, name, image_path) VALUES (?, ?, ?)`,
        [id, text, imagePath],
        (err, result) => {
            if (err) {
                console.error('Failed to add todo item:', err);
                return res.status(500).send('Failed to add todo item');
            }
            console.log('Todo item added successfully');
            return res.send('Todo item added successfully');
        }
    );
});

app.post('/mark-checked', (req, res) => {
    const completed = req.body.checked ? 1 : 0;
    db.query(`UPDATE todo_list SET completed = ${completed} WHERE id = ${req.body.id}`, (err, result) => {
        if (err) {
            res.status(500).send('Failed to update todo item');
            console.log(err);
            return;
        }
        res.send('Todo item checked successfully');
    });
});

app.post('/delete-todo', (req, res) => {
    db.query(`DELETE FROM todo_list WHERE id = ${req.body.id}`, (err, result) => {
        if (err) {
            res.status(500).send('Failed to delete todo item');
            console.log(err);
            return;
        }
        res.send('Todo item deleted successfully');
    });
});

app.post('/edit-todo', (req, res) => {
    const { id, newText } = req.body;
    db.query(`UPDATE todo_list SET name = ? WHERE id = ?`, [newText, id], (err, result) => {
        if (err) {
            console.error('Failed to edit todo item:', err);
            return res.status(500).send('Failed to edit todo item');
        }
        console.log('Todo item edited successfully');
        return res.send('Todo item edited successfully');
    });
});

app.get('/get-image/:todoId', (req, res) => {
    const todoId = req.params.todoId;
    // Query the database to get the image path based on todo ID
    db.query('SELECT image_path FROM todo_list WHERE id = ?', [todoId], (err, result) => {
        if (err) {
            console.error('Failed to get image from database:', err);
            return res.status(500).send('Failed to get image from database');
        }
        if (result.length === 0) {
            return res.status(404).send('Image not found');
        }
        const imagePath = result[0].image_path;
        // Serve the image file from the public/images directory
        res.sendFile(__dirname + 'public/images/' + imagePath);
    });
});

const server = app.listen(process.env.PORT, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});
