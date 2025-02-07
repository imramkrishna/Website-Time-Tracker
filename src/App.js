/* global chrome */
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Returns stored data if the stored date matches today, else resets.
  const getInitialData = () => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('siteDataDate');
    if (savedDate === today) {
      const data = localStorage.getItem('siteData');
      return data ? JSON.parse(data) : {};
    } else {
      localStorage.setItem('siteDataDate', today);
      localStorage.setItem('siteData', JSON.stringify({}));
      return {};
    }
  };

  const [siteData, setSiteData] = useState(getInitialData());

  useEffect(() => {
    const handleMessage = (request, sender, sendResponse) => {
      if (request.type === 'TIME_UPDATE' && request.url && request.timeSpent) {
        setSiteData(prevData => {
          const updated = { ...prevData };
          updated[request.url] = (updated[request.url] || 0) + request.timeSpent;
          localStorage.setItem('siteData', JSON.stringify(updated));
          return updated;
        });
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  return (
    <div className="App">
      <h1>Website Time Tracker</h1>
      <table>
        <thead>
          <tr>
            <th>Website</th>
            <th>Time Spent (seconds)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(siteData).map(([url, time]) => (
            <tr key={url}>
              <td>{url}</td>
              <td>{time.toFixed(0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;