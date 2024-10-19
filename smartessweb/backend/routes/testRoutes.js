const express = require('express');
const router = express.Router();
const { test1, test2 } = require('../queries/testQueries');

router.get('/', async (req, res) => {
  try {
    const data = await test1();
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/test2', async (req, res) => {
  try {
    const data = await test2();
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;