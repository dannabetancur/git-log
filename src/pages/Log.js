import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import "../shared.css";

const MUSCLE_COLORS = {
  "Glúteo":"tag-purple","Cuádriceps":"tag-green","Femoral":"tag-amber",
  "Espalda":"tag-blue","Pecho":"tag-green","Hombro":"tag-amber",
  "Bíceps":"tag-purple","Tríceps":"tag-pink","Core":"tag-amber","Pantorrilla":"tag-blue"
};

export default function Log({ user }) {
  const [exercises, setExercises] = useState([]);
  const [selectedEx, setSelectedEx] = useState("");
  const [currentSets, setCurrentSets] = useState([]);
  const [lastWorkout, setLastWorkout] = useState(null);
  const [setModal, setSetModal] = useState(false);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("1");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const q = query(collection(db, `users/${user.uid}/exercises`), orderBy("name"));
    return onSnapshot(q, snap => setExercises(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user.uid]);

  useEffect(() => {
    const q = query(collection(db, `users/${user.uid}/workouts`), orderBy("date","desc"), limit(1));
    return onSnapshot(q, snap => {
      if (snap.docs.length) setLastWorkout({ id: snap.docs[0].id, ...snap.docs[0].data() });
      else setLastWorkout(null);
    });
  }, [user.uid]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const addSet = () => {
    const w = parseFloat(weight), r = parseInt(reps), s = parseInt(sets)||1;
    if (!w || !r) { showToast("Completa peso y reps"); return; }
    setCurrentSets([...currentSets, { weight: w, reps: r, sets: s }]);
    setSetModal(false); setWeight(""); setReps(""); setSets("1");
  };

  const saveWorkout = async () => {
    if (!selectedEx) { showToast("Selecciona un ejercicio"); return; }
    if (!currentSets.length) { showToast("Añade al menos una serie"); return; }
    const ex = exercises.find(e => e.id === selectedEx);
    const totalVolume = currentSets.reduce((a, s) => a + (s.weight * s.reps * s.sets), 0);
    await addDoc(collection(db, `users/${user.uid}/workouts`), {
      date: new Date().toISOString(),
      exerciseId: selectedEx,
      exerciseName: ex.name,
      muscle: ex.muscle,
      sets: currentSets,
      totalVolume
    });
    setCurrentSets([]); setSelectedEx("");
    showToast("Entrenamiento guardado ✓");
  };

  const d = new Date();
  const dateStr = d.toLocaleDateString("es-ES", { weekday:"long", day:"numeric", month:"long" });

  return (
    <div>
      <p className="section-title" style={{marginTop:16}}>{dateStr}</p>

      <div className="card" style={{padding:12}}>
        <select className="input-field" value={selectedEx} onChange={e => setSelectedEx(e.target.value)}>
          <option value="">Selecciona un ejercicio...</option>
          {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
        </select>
      </div>

      {selectedEx && (
        <>
          <div className="row" style={{marginBottom:8}}>
            <p className="section-title" style={{margin:0}}>Series de hoy</p>
            <button className="btn btn-ghost" style={{width:"auto",padding:"6px 12px",fontSize:12}} onClick={() => setSetModal(true)}>+ Serie</button>
          </div>

          {!currentSets.length && (
            <div style={{textAlign:"center",padding:16,color:"var(--text3)",fontSize:13}}>Pulsa "+ Serie" para añadir</div>
          )}
          {currentSets.map((s, i) => (
            <div key={i} className="set-row">
              <div className="set-num">{i+1}</div>
              <div><div className="set-val">{s.weight}kg</div><div className="set-label">peso</div></div>
              <div><div className="set-val">{s.reps}</div><div className="set-label">reps</div></div>
              <div><div className="set-val">{s.sets}</div><div className="set-label">series</div></div>
              <button className="delete-btn" onClick={() => setCurrentSets(currentSets.filter((_,j)=>j!==i))}>×</button>
            </div>
          ))}
          {currentSets.length > 0 && (
            <button className="btn btn-primary" style={{marginTop:8}} onClick={saveWorkout}>Guardar entrenamiento</button>
          )}
        </>
      )}

      <p className="section-title">Último registro</p>
      {!lastWorkout ? (
        <div className="card-sm" style={{color:"var(--text3)",fontSize:13,textAlign:"center"}}>Aún no hay entrenamientos</div>
      ) : (
        <div className="card">
          <div className="record-header">
            <div className="record-dot"/>
            <div style={{fontSize:14,fontWeight:500}}>{lastWorkout.exerciseName}</div>
            <span className={`tag ${MUSCLE_COLORS[lastWorkout.muscle]||"tag-purple"}`} style={{marginLeft:"auto"}}>{lastWorkout.muscle}</span>
          </div>
          <div style={{fontSize:12,color:"var(--text2)",marginBottom:10}}>
            {new Date(lastWorkout.date).toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long"})}
          </div>
          {lastWorkout.sets.map((s,i) => (
            <div key={i} className="set-row">
              <div className="set-num">{i+1}</div>
              <div><div className="set-val">{s.weight}kg</div><div className="set-label">peso</div></div>
              <div><div className="set-val">{s.reps}</div><div className="set-label">reps</div></div>
              <div><div className="set-val">{s.sets}</div><div className="set-label">series</div></div>
              <div/>
            </div>
          ))}
          <div className="divider"/>
          <div className="row">
            <div style={{fontSize:12,color:"var(--text2)"}}>Volumen total</div>
            <div style={{fontSize:14,fontWeight:600,fontFamily:"'DM Mono',monospace",color:"var(--accent)"}}>{lastWorkout.totalVolume.toLocaleString("es")} kg</div>
          </div>
        </div>
      )}

      {setModal && (
        <div className="modal-overlay" onClick={e => e.target.className==="modal-overlay" && setSetModal(false)}>
          <div className="modal">
            <div className="modal-title">Añadir serie</div>
            <div className="input-row">
              <div><div className="input-label">Peso (kg)</div><input className="input-field" type="number" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="40" min="0" step="0.5" autoFocus /></div>
              <div><div className="input-label">Reps</div><input className="input-field" type="number" value={reps} onChange={e=>setReps(e.target.value)} placeholder="12" min="1" /></div>
              <div><div className="input-label">Series</div><input className="input-field" type="number" value={sets} onChange={e=>setSets(e.target.value)} placeholder="3" min="1" max="10" /></div>
            </div>
            <button className="btn btn-primary" onClick={addSet}>Añadir</button>
            <div style={{height:8}}/>
            <button className="btn btn-ghost" onClick={() => setSetModal(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div className={`toast ${toast?"show":""}`}>{toast}</div>
    </div>
  );
}
