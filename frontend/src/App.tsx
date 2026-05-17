import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3001');

interface Auction {
  id: number;
  title: string;
  currentPrice: number;
}

function App() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [userId] = useState(1); // Hardcoded for demo purposes (User ID 1)

  useEffect(() => {
    // Fetch initial data
    axios.get('http://localhost:3001/api/auctions').then((res) => {
      setAuctions(res.data);
    });

    // Listen for successful bids
    socket.on('bidUpdate', (data: { auctionId: number; newPrice: number }) => {
      setAuctions((prev) =>
        prev.map((auc) =>
          auc.id === data.auctionId ? { ...auc, currentPrice: data.newPrice } : auc
        )
      );
    });

    // Listen for failed bids
    socket.on('bidFailed', (data: { message: string }) => {
      alert(data.message);
    });

    return () => {
      socket.off('bidUpdate');
      socket.off('bidFailed');
    };
  }, []);

  const handleBid = (auctionId: number, currentPrice: number) => {
    const amount = currentPrice + 10; // Bid $10 higher
    socket.emit('placeBid', { auctionId, userId, amount });
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>NexusBid Live Auctions 🔨</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {auctions.map((auction) => (
          <div key={auction.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
            <h3>{auction.title}</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'green' }}>
              ${auction.currentPrice.toFixed(2)}
            </p>
            <button
              onClick={() => handleBid(auction.id, auction.currentPrice)}
              style={{ padding: '0.5rem 1rem', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Bid +$10
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;