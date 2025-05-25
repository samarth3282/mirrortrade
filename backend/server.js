require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const tradeRoutes = require('./routes/trades');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/trades', tradeRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const { getFriendTrades } = require('./services/sharekhanService');

let connectedClients = [];
let lastSeenTradeId = null;

io.on('connection', socket => {
    connectedClients.push(socket);
    console.log(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        connectedClients = connectedClients.filter(s => s.id !== socket.id);
        console.log(`Client disconnected: ${socket.id}`);
    });
});

setInterval(async () => {
    try {
        const trades = await getFriendTrades();
        const latestTrade = trades[0];
        if (latestTrade?.id && latestTrade.id !== lastSeenTradeId) {
            lastSeenTradeId = latestTrade.id;
            connectedClients.forEach(socket => {
                socket.emit('newTrade', latestTrade);
            });
        }
    } catch (err) {
        console.error("Error polling friend trades:", err.message);
    }
}, 10000); // every 10s

server.listen(process.env.PORT || 4000, () => {
    console.log('Server running on port 4000');
});
