const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Serve static frontend files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Connect to XAMPP MySQL database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // default XAMPP password is empty
    database: 'todo_db'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to XAMPP MySQL database successfully!');
});

// --- API ROUTES ---

// 1. Get all tasks
app.get('/api/tasks', (req, res) => {
    db.query('SELECT * FROM tasks ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. Add a new task
app.post('/api/tasks', (req, res) => {
    const { title, due_date } = req.body;
    db.query('INSERT INTO tasks (title, due_date) VALUES (?, ?)', [title, due_date || null], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: results.insertId, title, due_date, completed: false });
    });
});

// 3. Update task completion status (Tick / Untick)
app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    
    db.query('UPDATE tasks SET completed = ? WHERE id = ?', [completed, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Task status updated successfully' });
    });
});

// 4. Delete a task
app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM tasks WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Task deleted successfully' });
    });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running live at http://localhost:${PORT}`);
});