import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import "../shared.css";

const MUSCLES = ["Glúteo","Cuádriceps","Femoral","Espalda","Pecho","Hombro","Bíceps","Tríceps","Core","Pantorrilla"];
const MUSCLE_COLORS = {
  "Glúteo":"tag-purple","Cuádriceps":"tag-green","Femoral":"tag-amber",
  "Espalda":"tag-blue","Pecho":"tag-green","Hombro":"tag-amber",
  "Bíceps":"tag-purple","Tríceps":"tag-pink","Core":"tag-amber","Pantorrilla":"tag-blue"
};

export default function Exercises({ user }) {
  const [exercises, setExercises] = useState([]);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [muscle, setMuscle] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const q = query(collection(db, `users/${user.uid}/exercises`), orderBy("name"));
    const unsub = onSnapshot(q, snap => {
      setExercises(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user.uid]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const save = async () => {
    if (!name.trim()) { showToast("Escribe un nombre"); return; }
    if (!muscle) { showToast("Selecciona un músculo"); return; }
    await addDoc(collection(db, `users/${user.uid}/exercises`), { name: name.trim(), muscle, createdAt: Date.now() });
    setModal(false); setName(""); setMuscle("");
    showToast("Ejercicio añadido ✓");
  };

  const del = async (id) => {
    await deleteDoc(doc(db, `users/${user.uid}/exercises/${id}`));
    showToast("Eliminado");
  };

  return (
    <div>
      <p className="section-title">Mis ejercicios</p>
      <button className="btn btn-primary" style={{marginBottom:16}} onClick={() => setModal(true)}>+ Añadir ejercicio</button>

      {loading && <div className="loading">Cargando...</div>}
      {!loading && !exercises.length && (
        <div className="empty"><div className="empty-icon">🏋️</div><p>No hay ejercicios aún.<br/>Añade el primero arriba.</p></div>
      )}
      {exercises.map(ex => (
        <div key={ex.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:"var(--bg3)",borderRadius:"var(--radius-sm)",marginBottom:6,border:"1px solid var(--border)"}}>
          <div>
            <div style={{fontSize:14,fontWeight:500}}>{ex.name}</div>
            <div style={{fontSize:11,color:"var(--text2)",marginTop:2}}>{ex.muscle}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span className={`tag ${MUSCLE_COLORS[ex.muscle]||"tag-purple"}`}>{ex.muscle}</span>
            <button className="delete-btn" onClick={() => del(ex.id)}>×</button>
          </div>
        </div>
      ))}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target.className==="modal-overlay" && setModal(false)}>
          <div className="modal">
            <div className="modal-title">Nuevo ejercicio</div>
            <div style={{marginBottom:8}}>
              <div className="input-label">Nombre</div>
              <input className="input-field" value={name} onChange={e=>setName(e.target.value)} placeholder="Ej: Hip thrust" autoFocus />
            </div>
            <div style={{marginBottom:12}}>
              <div className="input-label">Músculo principal</div>
              <div className="chip-row">
                {MUSCLES.map(m => (
                  <div key={m} className={`chip ${muscle===m?"selected":""}`} onClick={() => setMuscle(m)}>{m}</div>
                ))}
              </div>
            </div>
            <button className="btn btn-primary" onClick={save}>Guardar ejercicio</button>
            <div style={{height:8}}/>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div className={`toast ${toast?"show":""}`}>{toast}</div>
    </div>
  );
}
