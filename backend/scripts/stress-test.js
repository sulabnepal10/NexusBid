const { io } = require("socket.io-client");

const SOCKET_URL = "http://localhost:3001";
const CONCURRENT_USERS = 50;

console.log(`Starting stress test with ${CONCURRENT_USERS} users...`);

for (let i = 1; i <= CONCURRENT_USERS; i++) {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
        // Every 1-3 seconds, place a random bid on a random auction
        setInterval(() => {
            const auctionId = Math.floor(Math.random() * 200) + 1;
            const userId = Math.floor(Math.random() * 500) + 1;
            const bidAmount = Math.floor(Math.random() * 1000) + 10;

            socket.emit("placeBid", { auctionId, userId, amount: bidAmount });
        }, Math.random() * 2000 + 1000);
    });

    socket.on("bidUpdate", (data) => {
        // Keep console relatively clean, only log occasional updates
        if (Math.random() > 0.95) console.log(`[Auction ${data.auctionId}] New Price: $${data.newPrice}`);
    });
}