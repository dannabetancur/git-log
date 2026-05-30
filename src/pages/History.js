import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import "../shared.css";

const MUSCLE_COLORS = {
  "Glúteo":"tag-purple","Cuádriceps":"tag-green","Femoral":"tag-amber",
  "Espalda":"tag-blue","Pecho":"tag-green","Hombro":"tag-amber",
  "Bíceps":"tag-purple","Tríceps":"tag-pink","Core":"tag-amber","Pantorrilla":"tag-blue"
};

export default function History({ user }) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const q = query(collection(db, `users/${user.uid}/workouts`), orderBy("date","desc"));
    return onSnapshot(q, snap => {
      setWorkouts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [user.uid]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const del = async (id) => {
    await deleteDoc(doc(db, `users/${user.uid}/workouts/${id}`));
    showToast("Eliminado");
  };

  const grouped = workouts.reduce((acc, w) => {
    const d = new Date(w.date).toLocaleDateString("es-ES", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
    if (!acc[d]) acc[d] = [];
    acc[d].push(w);
    return acc;
  }, {});

  return (
    <div>
      <p className="section-title">Todos los entrenamientos</p>
      {loading && <div className="loading">Cargando...</div>}
      {!loading && !workouts.length && (
        <div className="empty"><div className="empty-icon">📋</div><p>No hay entrenamientos aún</p></div>
      )}
      {Object.entries(grouped).map(([date, ws]) => (
        <div key={date} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--radius)",padding:"14px 16px",marginBottom:8}}>
          <div style={{fontSize:12,color:"var(--text2)",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
            📅 {date}
          </div>
          {ws.map(w => (
            <div key={w.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderTop:"1px solid var(--border)"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{fontSize:13,fontWeight:500}}>{w.exerciseName}</div>
                  <span className={`tag ${MUSCLE_COLORS[w.muscle]||"tag-purple"}`}>{w.muscle}</span>
                </div>
                <div style={{fontSize:12,color:"var(--text2)",marginTop:3}}>
                  {w.sets.length} sets · <span style={{color:"var(--text)",fontWeight:500}}>{w.totalVolume.toLocaleString("es")} kg vol.</span>
                </div>
              </div>
              <button className="delete-btn" onClick={() => del(w.id)}>×</button>
            </div>
          ))}
        </div>
      ))}
      <div className={`toast ${toast?"show":""}`}>{toast}</div>
    </div>
  );
}
