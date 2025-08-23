import { useState } from 'react'

import './App.css'

function App() {
  const [stocks, setStocks] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");

  const fetchStockPrice = async (symbol) => {
    try {
      const res = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=1SCADSD5WSF7KDY6`
      );
      const data = await res.json();

      if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
        return parseFloat(data["Global Quote"]["05. price"]);
      } else {
        return null; 
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const price = await fetchStockPrice(symbol.toUpperCase());

    if (!price) {
      alert("Invalid stock symbol.");
      return;
    }

    const newStock = {
      symbol: symbol.toUpperCase(),
      quantity: Number(quantity),
      purchasePrice: Number(purchasePrice),
      currentPrice: price,
    };

    setStocks([...stocks, newStock]);

    setSymbol("");
    setQuantity("");
    setPurchasePrice("");
  };

  return (
    <div>
      <h1>Finance Dashboard</h1>

  
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Stock Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <input
          type="number"
          placeholder="Purchase Price"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
        />
        <button type="submit">Add Stock</button>
      </form>

      <h2>Stock List</h2>

      <div className="stock-list">
        {stocks.length === 0 ? (
          <p className="empty-message">No stocks added yet</p>
          ) : (
        stocks.map((s, i) => {
          const profitLoss = (s.currentPrice - s.purchasePrice) * s.quantity;
        return (
          <div className="stock-card" key={i}>
            <p><strong>Symbol:</strong> {s.symbol}</p>
            <p><strong>Quantity:</strong> {s.quantity}</p>
            <p><strong>Purchase Price:</strong> {s.purchasePrice.toFixed(2)}</p>
            <p><strong>Current Price:</strong> {s.currentPrice.toFixed(2)}</p>
            <p><strong>Profit/Loss:</strong>{" "}
              <span className={profitLoss >= 0 ? "profit" : "loss"}>
                {profitLoss >= 0 ? "+" : ""}
                {profitLoss.toFixed(2)}
              </span>
            </p>
          </div>
        );
        })
       )}
      </div>
    </div>
  );
}
export default App
