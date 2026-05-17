const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Fetch active auctions for the frontend initial load
app.get('/api/auctions', async (req, res) => {
    const auctions = await prisma.auction.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { id: 'desc' },
        take: 20
    });
    res.json(auctions);
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Listen for incoming bids
    socket.on('placeBid', async (data) => {
        const { auctionId, userId, amount } = data;

        try {
            const result = await prisma.$queryRaw`CALL CheckAndPlaceBid(${auctionId}, ${userId}, ${amount})`;

            // Safely extract the row whether it's a nested array or a flat array
            const row = Array.isArray(result[0]) ? result[0][0] : result[0];

            // Prisma sometimes returns database numbers as BigInts. Number() safely converts them.
            const success = Number(row?.success) === 1;
            const newPrice = Number(row?.newPrice);

            if (success) {
                io.emit('bidUpdate', { auctionId, newPrice, message: 'New highest bid!' });
            } else {
                socket.emit('bidFailed', { auctionId, message: `Bid too low. Current price is ${newPrice}` });
            }
        } catch (error) {
            console.error('Bidding Error:', error);
            socket.emit('bidFailed', { auctionId, message: 'Server error processing bid.' });
        }
    });

    socket.on('disconnect', () => console.log(`User disconnected: ${socket.id}`));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));