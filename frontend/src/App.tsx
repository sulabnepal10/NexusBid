import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import './App.css'; // Make sure to import the new CSS!

const socket = io('http://localhost:3001');

interface Auction {
  id: number;
  title: string;
  currentPrice: number;
}

function App() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [userId] = useState(1);
  const [flashingCards, setFlashingCards] = useState<Record<number, boolean>>({});

  useEffect(() => {
    axios.get('http://localhost:3001/api/auctions').then((res) => {
      setAuctions(res.data);
    });

    socket.on('bidUpdate', (data: { auctionId: number; newPrice: number }) => {
      setAuctions((prev) =>
        prev.map((auc) =>
          auc.id === data.auctionId ? { ...auc, currentPrice: data.newPrice } : auc
        )
      );

      // Trigger the flash animation
      setFlashingCards((prev) => ({ ...prev, [data.auctionId]: true }));

      // Remove the flash class after 1 second so it can be triggered again
      setTimeout(() => {
        setFlashingCards((prev) => ({ ...prev, [data.auctionId]: false }));
      }, 1000);
    });

    socket.on('bidFailed', (data: { message: string }) => {
      alert(`Bid failed: ${data.message}`);
    });

    return () => {
      socket.off('bidUpdate');
      socket.off('bidFailed');
    };
  }, []);

  const handleBid = (auctionId: number, currentPrice: number) => {
    const amount = currentPrice + 10;
    socket.emit('placeBid', { auctionId, userId, amount });
  };

  return (
    <>
      <header className="header">
        <h1>NexusBid Engine</h1>
        <div className="live-indicator">
          <div className="dot"></div>
          LIVE SYSTEM ACTIVE
        </div>
      </header>

      <main className="auction-grid">
        {auctions.map((auction) => (
          <div
            key={auction.id}
            className={`card ${flashingCards[auction.id] ? 'flash' : ''}`}
          >
            <h3>{auction.title}</h3>
            <p className="price">
              ${auction.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <button
              className="btn"
              onClick={() => handleBid(auction.id, auction.currentPrice)}
            >
              Place Bid (+$10)
            </button>
          </div>
        ))}
      </main>
    </>
  );
}

export default App;