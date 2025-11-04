import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Loading...");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gistParam = params.get("gist");
    if (!gistParam) {
      setError("Missing ?gist=<GIST_ID_OR_URL> in URL.");
      return;
    }

    async function fetchMessage() {
      try {
        let jsonContent;

        if (/^https?:\/\//.test(gistParam)) {
          // If it's a raw URL
          const res = await fetch(`${gistParam}?t=${Date.now()}`);
          if (!res.ok) throw new Error("Failed to fetch gist raw data.");
          jsonContent = await res.json();
        } else {
          // Assume it's a Gist ID
          const res = await fetch(`https://api.github.com/gists/${gistParam}?cacheBust=${Date.now()}`);
          const data = await res.json();
          const file = data.files["message.json"];
          jsonContent = JSON.parse(file.content);
        }

        if (jsonContent && jsonContent.message) {
          setMessage(jsonContent.message);
          setError("");
        } else {
          setError("Message not found in gist content.");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching gist content.");
      }
    }

    fetchMessage();
    const interval = setInterval(fetchMessage, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <div id="message" className={error ? "error" : ""}>
        {error || message}
      </div>
    </div>
  );
}

export default App;