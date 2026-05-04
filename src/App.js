import React, { useState, useEffect, useRef, useCallback } from "react";
import * as satellite from "satellite.js";
import "./App.css";
import MapView from "./MapView";
import GlobeView from "./GlobeView";

const REFRESH_MS = 3000;
const PAST_MINUTES = 2;
const PREDICT_MINUTES = 90;
const STEP_SECONDS = 60;

function buildPredictedPath(satrec, fromDate, minutes, stepSec) {
  const points = [];
  const totalSteps = Math.ceil((minutes * 60) / stepSec);
  for (let i = 0; i <= totalSteps; i++) {
    const t = new Date(fromDate.getTime() + i * stepSec * 1000);
    const posVel = satellite.propagate(satrec, t);
    if (!posVel.position) continue;
    const gmst = satellite.gstime(t);
    const geo = satellite.eciToGeodetic(posVel.position, gmst);
    const lat = satellite.radiansToDegrees(geo.latitude);
    const lon = satellite.radiansToDegrees(geo.longitude);
    if (isNaN(lat) || isNaN(lon)) continue;
    points.push([lat, lon]);
  }
  return points;
}

export default function App() {
  const [view, setView] = useState("2d");
  const [issData, setIssData] = useState(null);
  const [pastPath, setPastPath] = useState([]);
  const [predictedPath, setPredictedPath] = useState([]);
  const satrecRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchTLE = async () => {
      try {
        const res = await fetch("https://tle.ivanstanojevic.me/api/tle/25544");
        const json = await res.json();
        if (json.line1 && json.line2) {
          satrecRef.current = satellite.twoline2satrec(json.line1, json.line2);
        }
      } catch (e) {
        console.error("TLE fetch failed", e);
      }
    };
    fetchTLE();
  }, []);

  const tick = useCallback(async () => {
    try {
      const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
      const data = await res.json();
      const { latitude, longitude, altitude, velocity, visibility } = data;

      setIssData({ latitude, longitude, altitude, velocity, visibility });

      setPastPath((prev) => {
        const next = [...prev, [latitude, longitude]];
        const cutoff = (PAST_MINUTES * 60 * 1000) / REFRESH_MS;
        return next.slice(-Math.ceil(cutoff));
      });

      if (satrecRef.current) {
        const path = buildPredictedPath(satrecRef.current, new Date(), PREDICT_MINUTES, STEP_SECONDS);
        setPredictedPath(path);
      }
    } catch (e) {
      console.error("ISS fetch failed", e);
    }
  }, []);

  useEffect(() => {
    tick();
    intervalRef.current = setInterval(tick, REFRESH_MS);
    return () => clearInterval(intervalRef.current);
  }, [tick]);

  if (!issData) {
    return (
      <div style={{ width:"100vw", height:"100vh", display:"flex", alignItems:"center",
        justifyContent:"center", background:"#000", color:"#4ecdc4", fontSize:15,
        fontFamily:"'Segoe UI', sans-serif" }}>
        Loading ISS position…
      </div>
    );
  }

  const { latitude, longitude, altitude, velocity, visibility } = issData;

  return (
    <div style={{ width:"100vw", height:"100vh", position:"relative" }}>
      {view === "2d" ? (
        <MapView issLat={latitude} issLon={longitude} pastPath={pastPath} predictedPath={predictedPath} />
      ) : (
        <GlobeView issLat={latitude} issLon={longitude} pastPath={pastPath} predictedPath={predictedPath} />
      )}

      <div className="info-panel">
        <h1>🛰 ISS Tracker</h1>
        <div className="info-row"><span className="label">Lat:</span>{latitude.toFixed(4)}°</div>
        <div className="info-row"><span className="label">Lon:</span>{longitude.toFixed(4)}°</div>
        <div className="info-row"><span className="label">Alt:</span>{altitude.toFixed(1)} km</div>
        <div className="info-row"><span className="label">Speed:</span>{(velocity / 3600).toFixed(2)} km/s</div>
        <div className="info-row">
          <span className="label">Visibility:</span>
          {visibility === "daylight"
            ? <span className="badge-sunlight">Sunlight</span>
            : <span className="badge-eclipse">Eclipse</span>}
        </div>
      </div>

      <button className="toggle-btn" onClick={() => setView((v) => (v === "2d" ? "3d" : "2d"))}>
        {view === "2d" ? "3D Globe" : "2D Map"}
      </button>

      <div className="legend">
        <div className="leg-row"><div className="dot-red" />Past path (~{PAST_MINUTES} min)</div>
        <div className="leg-row"><div className="dot-blue" />Predicted (~{PREDICT_MINUTES} min)</div>
      </div>
    </div>
  );
}