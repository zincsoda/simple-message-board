import React, { useEffect, useState, useRef } from "react";
import "./App.css";

const COLORFUL_BACKGROUNDS = [
  "#1a1a2e", // Dark blue
  "#16213e", // Deep blue
  "#0f3460", // Navy
  "#533483", // Purple
  "#6a1b9a", // Deep purple
  "#7b1fa2", // Purple
  "#ad1457", // Pink
  "#c2185b", // Rose
  "#b71c1c", // Dark red
  "#e65100", // Dark orange
  "#f57f17", // Dark amber
  "#1b5e20", // Dark green
  "#004d40", // Dark teal
  "#006064", // Dark cyan
  "#0d47a1", // Dark blue
  "#283593", // Indigo
];

function App() {
  const [message, setMessage] = useState("Loading...");
  const [error, setError] = useState("");
  // Initialize with a random color from the array
  const initialColorIndex = Math.floor(Math.random() * COLORFUL_BACKGROUNDS.length);
  const [backgroundColor, setBackgroundColor] = useState(COLORFUL_BACKGROUNDS[initialColorIndex]);
  const previousMessageRef = useRef("");
  const colorIndexRef = useRef(initialColorIndex);

  const changeBackgroundColor = () => {
    colorIndexRef.current = (colorIndexRef.current + 1) % COLORFUL_BACKGROUNDS.length;
    setBackgroundColor(COLORFUL_BACKGROUNDS[colorIndexRef.current]);
  };

  useEffect(() => {
    // Apply background color to body for full screen
    document.body.style.backgroundColor = backgroundColor;
    return () => {
      // Cleanup on unmount
      document.body.style.backgroundColor = '';
    };
  }, [backgroundColor]);

  useEffect(() => {
    // Change background every 1 minute
    const colorInterval = setInterval(() => {
      changeBackgroundColor();
    }, 1 * 60 * 1000);
    return () => clearInterval(colorInterval);
  }, []);

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
          const newMessage = jsonContent.message;
          // Check if message has changed
          if (newMessage !== previousMessageRef.current) {
            previousMessageRef.current = newMessage;
            setMessage(newMessage);
            setError("");
            // Change background when message changes
            changeBackgroundColor();
          } else {
            setMessage(newMessage);
            setError("");
          }
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