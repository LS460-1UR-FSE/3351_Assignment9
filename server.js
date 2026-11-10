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

//return task by id 
app.get('/api/resources/:id', (req, res) => {
    const id = parseInt(req.params.id); //cinvert id to integer
    const resource = resources.find((resource) => resource.id === id);

    if(!resource) { //if resource not found, return 404
        return res.status(404).json({ error: 'Resource not found' }); 
    }

    res.json(resource);
});

// POST /api/items - save a new task in PostgreSQL
// for assignment 9
app.post('/api/items', async (req, res) => {S
    const { title } = req.body || {};

    // Require a non-empty title.
    if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({
            error: 'Title is required and must be a non-empty string'
        });
    }

    try {
        const result = await pool.query(
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

app.put('/api/resources/:id', (req, res) => { //replace task title and status 
    const id = Number(req.params.id);

    const resource = resources.find((resource) => resource.id === id);

    if (!resource) {
        return res.status(404).json({
            error: 'Resource not found.'
        });
    }

    const { title, completed } = req.body || {};

    // Validate both fields before changing the task.
    if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({
            error: 'A task title is required.'
        });
    }

    if (typeof completed !== 'boolean') {
        return res.status(400).json({
            error: 'completed must be true or false.'
        });
    }

    resource.title = title.trim();
    resource.completed = completed;

    res.status(200).json(resource);
});

app.delete('/api/resources/:id', (req, res) => { //delete task by id
    const id = Number(req.params.id);

    const index = resources.findIndex((resource) => resource.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: 'Resource not found.'
        });
    }

    resources.splice(index, 1);

    res.status(200).json({ message: 'Resource deleted.' });
});

app.listen(PORT, () => { //starts server
    console.log(`Server is running on port ${PORT}`);
});

