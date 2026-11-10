const express = require('express');
const pool = require('./db'); // import the pool from db.js for assignment 9 

const app = express();
const PORT = 3000;



//log timestamps, http method, and url of requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    next();
});


app.use(express.json()); // parse JSON request


const resources = [

    {
        id: 1,
        title: 'Task 1: Study Node.js',
        completed: false,
    },

    {
        id: 2,
        title: 'Task 2: Study Express.js',
        completed: false,
    },

    {
        id: 3,
        title: 'Task 3: Study MongoDB',
        completed: false,
    }
];

let nextId = 4; // next id to assign to a new resource

// GET /api/items - retrieve all tasks from PostgreSQL 
// for assignment 9
app.get('/api/items', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, title, completed FROM items ORDER BY id'
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error retrieving tasks:', error.message);
        res.status(500).json({ error: 'Failed to retrieve tasks.' });
    }
});


// GET /api/items/:id - retrieve one task from PostgreSQL
// for assignment 9
app.get('/api/items/:id', async (req, res) => {
    const id = Number(req.params.id);

    // Reject invalid IDs before querying the database.
    if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
        return res.status(404).json({ error: 'Task not found.' });
    }

    try {
        const result = await pool.query(
            'SELECT id, title, completed FROM items WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error retrieving task:', error.message);
        res.status(500).json({ error: 'Failed to retrieve task.' });
    }
});

// POST /api/items - save a new task in PostgreSQL
// for assignment 9
app.post('/api/items', async (req, res) => {
    const { title } = req.body || {};

    // Require a non-empty title.
    if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({
            error: 'Title is required and must be a non-empty string'
        });
    }

    try {
        const result = await pool.query( //sql query to insert new task into items table
            `INSERT INTO items (title, completed)
             VALUES ($1, $2)
             RETURNING id, title, completed`,
            [title.trim(), false]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating task:', error.message);
        res.status(500).json({ error: 'Failed to create task.' });
    }
});

// PUT /api/items/:id - update a saved task
app.put('/api/items/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
        return res.status(404).json({ error: 'Task not found.' });
    }

    const { title, completed } = req.body || {};

    if (title === undefined && completed === undefined) {
        return res.status(400).json({
            error: 'Provide a title or completed status.'
        });
    }

    if (title !== undefined &&
        (typeof title !== 'string' || title.trim() === '')) {
        return res.status(400).json({
            error: 'Title must be a non-empty string.'
        });
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
        return res.status(400).json({
            error: 'completed must be true or false.'
        });
    }

    try {
        const result = await pool.query(
            `UPDATE items
             SET title = COALESCE($1, title),
                 completed = COALESCE($2, completed)
             WHERE id = $3
             RETURNING id, title, completed`,
            [
                title === undefined ? null : title.trim(),
                completed === undefined ? null : completed,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating task:', error.message);
        res.status(500).json({ error: 'Failed to update task.' });
    }
});

// DELETE /api/items/:id - permanently delete a saved task
// for assignment 9
app.delete('/api/items/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
        return res.status(404).json({ error: 'Task not found.' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM items WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        res.status(200).json({ message: 'Task deleted.' });
    } catch (error) {
        console.error('Error deleting task:', error.message);
        res.status(500).json({ error: 'Failed to delete task.' });
    }
});
app.listen(PORT, () => { //starts server
    console.log(`Server is running on port ${PORT}`);
});

