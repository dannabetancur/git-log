import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Filler } from "chart.js";
import "../shared.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Filler);

const chartOptions = (yLabel) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: "#1e1e21", titleColor: "#f4f4f5", bodyColor: "#a1a1aa", borderColor: "#3a3a3e", borderWidth: 1 } },
  scales: {
    x: { ticks: { color: "#71717a", font: { size: 11 } }, grid: { color: "#2a2a2e" } },
    y: { ticks: { color: "#71717a", font: { size: 11 }, callback: v => v + yLabel }, grid: { color: "#2a2a2e" } }
  }
});

export default function Progress({ user }) {
  const [exercises, setExercises] = useState([]);
  const [selectedEx, setSelectedEx] = useState("");
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, `users/${user.uid}/exercises`), orderBy("name"));
    return onSnapshot(q, snap => setExercises(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user.uid]);

  useEffect(() => {
    if (!selectedEx) { setWorkouts([]); return; }
    setLoading(true);
    const q = query(collection(db, `users/${user.uid}/workouts`), where("exerciseId","==",selectedEx), orderBy("date","asc"));
    return onSnapshot(q, snap => {
      setWorkouts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [user.uid, selectedEx]);

  const labels = workouts.map(w => new Date(w.date).toLocaleDateString("es-ES",{day:"numeric",month:"short"}));
  const maxWeights = workouts.map(w => Math.max(...w.sets.map(s => s.weight)));
  const volumes = workouts.map(w => w.totalVolume);
  const best = maxWeights.length ? Math.max(...maxWeights) : 0;
  const lastVol = volumes[volumes.length-1] || 0;
  const firstVol = volumes[0] || 0;
  const volChange = firstVol ? Math.round(((lastVol-firstVol)/firstVol)*100) : 0;

  const lineData = {
    labels,
    datasets: [{
      data: maxWeights,
      borderColor: "#a78bfa",
      backgroundColor: "rgba(167,139,250,0.15)",
      borderWidth: 2,
      pointBackgroundColor: "#a78bfa",
      pointRadius: 4,
      fill: true,
      tension: 0.4
    }]
  };

  const barData = {
    labels,
    datasets: [{
      data: volumes,
      backgroundColor: "rgba(52,211,153,0.25)",
      borderColor: "#34d399",
      borderWidth: 1.5,
      borderRadius: 6
    }]
  };

  return (
    <div>
      <p className="section-title" style={{marginTop:16}}>Selecciona ejercicio</p>
      <div className="card" style={{padding:12,marginBottom:16}}>
        <select className="input-field" value={selectedEx} onChange={e => setSelectedEx(e.target.value)}>
          <option value="">Selecciona ejercicio...</option>
          {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
        </select>
      </div>

      {loading && <div className="loading">Cargando...</div>}

      {!loading && selectedEx && !workouts.length && (
        <div className="empty"><div className="empty-icon">📈</div><p>No hay datos aún para este ejercicio</p></div>
      )}

      {!loading && workouts.length > 0 && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-val" style={{color:"var(--accent)"}}>{best}kg</div>
              <div className="stat-label">Mejor peso</div>
            </div>
            <div className="stat-card">
              <div className="stat-val" style={{color:volChange>=0?"var(--green)":"var(--red)"}}>{volChange>=0?"+":""}{volChange}%</div>
              <div className="stat-label">Progreso volumen</div>
            </div>
          </div>

          <div className="card">
            <div style={{fontSize:12,color:"var(--text2)",marginBottom:12}}>Peso máximo por sesión (kg)</div>
            <div style={{height:200}}>
              <Line data={lineData} options={chartOptions("kg")} />
            </div>
          </div>

          <div className="card" style={{marginTop:10}}>
            <div style={{fontSize:12,color:"var(--text2)",marginBottom:12}}>Volumen por sesión (kg total)</div>
            <div style={{height:200}}>
              <Bar data={barData} options={chartOptions("kg")} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
