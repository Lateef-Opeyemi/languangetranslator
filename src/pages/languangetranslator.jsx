import { useState, useEffect } from "react";
import "./languangetranslator.css"

const home = () => {
  const [translate, setTranslate] = useState(null)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputText, setinputText] = useState("")
  const [status, setStatus] = useState("idle")
  const [rawResp, setRawResp] = useState(null)
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");
  const [history, setHistory] = useState([]);


  const fetchdata = async (textToTranslate) => {

    const text = (typeof textToTranslate === 'string' && textToTranslate.trim() !== '')
      ? textToTranslate
      : (inputText && inputText.trim() !== '' ? inputText : null);

    

    console.log('Calling fetchdata with:', { text, inputText });

    setLoading(true);
    setError(null);
    setStatus('translating...');


   
    const effectiveSource = sourceLang === 'auto' ? 'auto' : sourceLang;
    const effectiveTarget = targetLang === 'auto' ? null : targetLang;

    console.log('PAYLOAD ->', { q: text, source: effectiveSource, target: effectiveTarget });

    // validate target
    if (!effectiveTarget) {
      setError("Please choose a target language (don't leave it as Auto-detect).");
      setLoading(false);
      setStatus("idle");
      return;
    }

    try {
      const translatordata = await fetch("https://deep-translate1.p.rapidapi.com/language/translate/v2", {
        method: 'POST',
        headers: {
          'x-rapidapi-key': '',
          'x-rapidapi-host': 'deep-translate1.p.rapidapi.com',
          'Content-Type': 'application/json'

        },
        body: JSON.stringify({
          q: text,
          source: effectiveSource,
          target: effectiveTarget,
        })
      })
      if (!translatordata.ok) {
        throw new Error("Failed to fetch");

      }

      const response = await translatordata.json()
      console.log("FULL JSON ->", JSON.stringify(response, null, 2))
      setRawResp(response);
      let translatedString = null;
      if (response?.data?.translations) {
        const t = response.data.translations;

        if (Array.isArray(t.translatedText)) translatedString = t.translatedText[0];
        else translatedString = t.translatedText ?? null;
      } else if (Array.isArray(response?.translations)) {
        translatedString = response.translations[0]?.translatedText ?? null;
      } else if (response?.translatedText) {
        translatedString = response.translatedText;
      } else if (response?.result) {
        translatedString = response.result;
      }


      console.log("PARSED translation ->", translatedString)
      setStatus("done")
      // Save to local history and localStorage
      const newEntry = {
        input: text,
        translated: translatedString,
        source: effectiveSource,
        target: effectiveTarget,
        time: new Date().toLocaleString()
      };

      const updatedHistory = [newEntry, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem("translationHistory", JSON.stringify(updatedHistory));

    }
    catch (error) {
      setError(error.message || "Translation failed");
      setStatus("error");
    }
    finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchdata()
    const stored = localStorage.getItem("translationHistory");
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, [])

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;



  const LANGUAGES = [
    { code: "auto", name: "Auto-detect" },
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "pt", name: "Portuguese" },
    { code: "de", name: "German" },
    { code: "ig", name: "Igbo" },
    { code: "yo", name: "Yoruba" },
    

  ];
  return (

    <div className="head">
      <h2>Language Translator</h2>
      <h3>Don't worry — Language got you covered</h3>

      <div className="translator-wrap">
        {/* LEFT panel: input */}
        <div className="panel left">
          <div className="panel-top">
            <div className="lang-select">
              <div className="label">From</div>
              <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }} />
            <div className="lang-select">
              <div className="label">To</div>
              <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                {LANGUAGES.filter(l => l.code !== "auto").map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>
          </div>

          <textarea
            className="input-area"
            value={inputText}
            onChange={(e) => setinputText(e.target.value)}
            placeholder="Type text or paste something to translate..."
          />

          <div className="actions">
            <button className="btn primary" onClick={() => fetchdata(inputText)}>Translate</button>
            <button className="btn ghost" onClick={() => { setinputText(""); setTranslate(null); setStatus("idle"); setRawResp(null); setError(null); }}>Clear</button>
          </div>

          <div className="status-line">
            <span><strong>Status:</strong> {status}</span>
            {loading && <small style={{ color: "var(--primary)" }}>Translating…</small>}
          </div>
        </div>

        {/* SWAP button */}
        <div className="swap-wrap">
          <button className="swap-btn" onClick={() => {
            const s = sourceLang === "auto" ? "en" : sourceLang;
            setSourceLang(targetLang === "auto" ? "en" : targetLang);
            setTargetLang(s);
          }}>
            ⇅
          </button>
        </div>

        {/* RIGHT panel: result */}
        <div className="panel right">
          <div className="panel-top" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 600 }}>Translation</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>Output</div>
          </div>

          <div className="translated-box">
            {translate || (rawResp ? (rawResp.data?.translations?.translatedText ?? JSON.stringify(rawResp)) : "No translation yet")}
          </div>

          <div style={{ marginTop: 12 }}>
            <small className="muted" style={{ color: "var(--muted)" }}>Source: {sourceLang} • Target: {targetLang}</small>
          </div>
        </div>
      </div>

      {/* History section */}
      <div className="history">
        <h4>Recent translations</h4>
        <div className="history-list">
          {history.length === 0 ? (
            <div className="empty-note">No recent translations yet.</div>
          ) : history.map((h, i) => (
            <div className="history-item" key={i}>
              <div>
                <strong>{h.input}</strong>
                <small>{h.time}</small>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "var(--muted)" }}>{h.source} → {h.target}</div>
                <div style={{ fontWeight: 600, marginTop: 6 }}>{h.translated}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default home;