const express = require('express');
const router = express.Router();
const { placeTrade, getBalance } = require('../services/sharekhanService');

router.post('/execute', async (req, res) => {
    try {
        const result = await placeTrade(req.body);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/balance', async (req, res) => {
    try {
        const result = await getBalance();
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
