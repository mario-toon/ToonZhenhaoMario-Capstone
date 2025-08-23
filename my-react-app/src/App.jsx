import { useState, useContext, createContext, useEffect, useCallback } from 'react'

import './App.css';

 const StockContext = createContext();

function App() {
  const [stocks, setStocks] = useState([]);
  const API_Key = "1SCADSD5WSF7KDY6";
  const fetchStockPrice = useCallback(async (symbol) => {
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
  }, [API_Key]);

useEffect(() => {
  let cancelled = false;

  const fillMissingPrices = async () => {
    const needs = [];
    for (let i = 0; i < stocks.length; i++) {
      const s = stocks[i];
      const hasPrice = typeof s.currentPrice === "number" && !Number.isNaN(s.currentPrice);
      if (!hasPrice) needs.push(i);
    }

    if (needs.length === 0) return;

    const updated = [...stocks];
    for (const i of needs) {
      const sym = updated[i].symbol;
      const price = await fetchStockPrice(sym);
      if (cancelled) return;

      if (typeof price === "number" && !Number.isNaN(price)) {
        updated[i] = { ...updated[i], currentPrice: price };
      }
    }

    if (!cancelled) {
      setStocks(updated);
    }
  };

  fillMissingPrices();

  return () => { cancelled = true; };
}, [stocks, fetchStockPrice, setStocks]);

  return (
    <div id="app">
      <h1>Finance Dashboard</h1>

      <StockContext.Provider value={{ stocks, setStocks, fetchStockPrice }}>
        <StockForm />
        <h2>Stock List</h2>
        <div className="stock-list-container">
          <StockList />
        </div>
      </StockContext.Provider>
    </div>
  );
}

function StockForm() {
  const { setStocks, fetchStockPrice } = useContext(StockContext);

  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const ticker = symbol.toUpperCase().trim();
    const price = await fetchStockPrice(ticker);

    setLoading(false);

    if (!price) {
      alert("Invalid stock symbol!");
      return;
    }

    setStocks ((prev) => [
      {
        symbol: ticker,
        quantity: Number(quantity),
        purchasePrice: Number(purchasePrice),
        currentPrice: price,
      },
      ...prev,
    ]);

    setSymbol("");
    setQuantity("");
    setPurchasePrice("");
  };

  return (
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
  );
}

function StockList() {
  const { stocks } = useContext(StockContext);

  return (
    <div className="stock-list">
      {stocks.length === 0 ? (
        <p className="empty-message">No stocks added yet</p>
      ) : (
        stocks.map((s, i) => {
          const hasPrice =
            typeof s.currentPrice === "number" && !Number.isNaN(s.currentPrice);
          const hasPurchase =
            typeof s.purchasePrice === "number" && !Number.isNaN(s.purchasePrice);
          const hasQty = Number.isFinite(s.quantity);

          const pl =
            hasPrice && hasPurchase && hasQty
              ? (s.currentPrice - s.purchasePrice) * s.quantity
              : null;

          return (
            <div className="stock-card" key={`${s.symbol}-${i}`}>
              <p><strong>Symbol:</strong> {s.symbol}</p>
              <p><strong>Quantity:</strong> {hasQty ? s.quantity : "—"}</p>
              <p>
                <strong>Purchase Price:</strong>{" "}
                {hasPurchase ? s.purchasePrice.toFixed(2) : "—"}
              </p>
              <p>
                <strong>Current Price:</strong>{" "}
                {hasPrice ? s.currentPrice.toFixed(2) : "—"}
              </p>
              <p>
                <strong>Profit/Loss:</strong>{" "}
                {pl != null ? (
                  <span className={pl >= 0 ? "profit" : "loss"}>
                    {pl >= 0 ? "+" : ""}
                    {pl.toFixed(2)}
                  </span>
                ) : (
                  "—"
                )}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
}
      
export default App
