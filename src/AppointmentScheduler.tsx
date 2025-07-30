
// Requer: react-router-dom ^6, tailwindcss configurado

import React, { createContext, useContext, useReducer, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { format, parseISO, addHours, differenceInHours, isAfter, isBefore } from "date-fns";
import "./tailwind.css";

/* ----------------------- Interfaces de dominio ----------------------- */
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  schedule: { start: string; end: string }; // HH:mm
}
export interface Appointment {
  id: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: "CONFIRMED" | "CANCELED";
  canceledAt?: string;
}

/* --------------------------fazendo Mock dos dados rodando localmente -------------------------- */
const DOCTORS: Doctor[] = [
  { id: "d1", name: "Dr. Plácido", specialty: "Cardiologia", schedule: { start: "08:00", end: "17:00" } },
  { id: "d2", name: "Dr. Gabriel Leite", specialty: "Dermatologia", schedule: { start: "09:00", end: "18:00" } },
  { id: "d3", name: "Dr. Luis Augusto", specialty: "Pediatria", schedule: { start: "07:00", end: "16:00" } },
];

const withinBusinessHours = (doctor: Doctor, time: string) => time >= doctor.schedule.start && time <= doctor.schedule.end;
const twoHoursAhead = (date: string, time: string) => isAfter(parseISO(`${date}T${time}:00`), addHours(new Date(), 2));

/* --------------------- interface para Contexto / Reducer ---------------------- */
interface State { appointments: Appointment[] }
const initialState: State = { appointments: [] };

type Action = { type: "ADD"; payload: Appointment } | { type: "CANCEL"; payload: { id: string; canceledAt: string } };
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD":
      return { ...state, appointments: [...state.appointments, action.payload] };
    case "CANCEL":
      return { ...state, appointments: state.appointments.map(a => a.id === action.payload.id ? { ...a, status:"CANCELED", canceledAt: action.payload.canceledAt } : a) };
    default: return state;
  }
}
const AppointmentCtx = createContext<{state:State;dispatch: React.Dispatch<Action>}>({state:initialState,dispatch:()=>{}});
const useAppts = ()=>useContext(AppointmentCtx);

/* -------------------------- IU para modal --------------------------- */
const Modal: React.FC<{open:boolean;onClose:()=>void;children:React.ReactNode}> = ({open,onClose,children})=>{
  if(!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md" onClick={e=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

/* ---------------------- Página: Agendar ------------------------ */
const SchedulePage: React.FC = () => {
  const { state, dispatch } = useAppts();
  const [form, setForm] = useState({ patientName:"", specialty:"", doctorId:"", date:"", time:"" });
  const [msg, setMsg] = useState<{t:"error"|""; txt:string}>({t:"", txt:""});
  const [previewOpen, setPreviewOpen] = useState(false);
  const navigate = useNavigate();

  const doctorsFiltered = form.specialty ? DOCTORS.filter(d=>d.specialty===form.specialty) : [];

  const validate = ()=>{
    const {patientName,specialty,doctorId,date,time}=form;
    if(!patientName||!specialty||!doctorId||!date||!time) return "Preencha todos os campos.";
    const doctor = DOCTORS.find(d=>d.id===doctorId)!;
    if(state.appointments.some(a=>a.status==='CONFIRMED'&&a.doctorId===doctorId&&a.date===date&&a.time===time)) return "Horário já ocupado para esse médico.";
    if(state.appointments.some(a=>a.status==='CONFIRMED'&&a.specialty===specialty&&a.date===date)) return "Já existe consulta dessa especialidade nesse dia.";
    if(!withinBusinessHours(doctor,time)) return "Fora do horário de atendimento.";
    if(!twoHoursAhead(date,time)) return "Agende com 2h de antecedência.";
    return "";
  };

  const handlePreview = (e:React.FormEvent)=>{
    e.preventDefault();
    const err = validate();
    if(err) return setMsg({t:"error", txt:err});
    setMsg({t:"",txt:""});
    setPreviewOpen(true);
  };
  const confirmSchedule = ()=>{
    const doctor = DOCTORS.find(d=>d.id===form.doctorId)!;
    const appt:Appointment={id:`appt-${Date.now()}`,patientName:form.patientName,doctorId:doctor.id,doctorName:doctor.name,specialty:doctor.specialty,date:form.date,time:form.time,status:"CONFIRMED"};
    dispatch({type:"ADD", payload: appt});
    setPreviewOpen(false);
    navigate("/consultas");
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded shadow-sm">
      <h1 className="text-2xl font-semibold mb-6">Agendar Consulta</h1>
      {msg.t && <p className="text-red-600 mb-4">{msg.txt}</p>}
      <form className="space-y-4" onSubmit={handlePreview}>
        <input className="input" placeholder="Nome do Paciente" value={form.patientName} onChange={e=>setForm({...form,patientName:e.target.value})}/>
        <select className="input" value={form.specialty} onChange={e=>setForm({...form,specialty:e.target.value,doctorId:""})}>
          <option value="">Selecione a especialidade</option>
          {[...new Set(DOCTORS.map(d=>d.specialty))].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        {form.specialty && (
          <select className="input" value={form.doctorId} onChange={e=>setForm({...form,doctorId:e.target.value})}>
            <option value="">Selecione o médico</option>
            {doctorsFiltered.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        )}
        <input type="date" className="input" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
        <input type="time" className="input" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/>
        <button className="btn-primary w-full">Pré‑visualizar</button>
      </form>

      {/* Modal de confirmação */}
      <Modal open={previewOpen} onClose={()=>setPreviewOpen(false)}>
        <h2 className="text-xl font-medium mb-4">Confirmar Agendamento</h2>
        <ul className="mb-6 text-sm text-gray-700 space-y-1">
          <li><b>Paciente:</b> {form.patientName}</li>
          <li><b>Médico:</b> {doctorsFiltered.find(d=>d.id===form.doctorId)?.name}</li>
          {(() => {
  if (!form.date || !form.time) return (
    <>
      <li><b>Data:</b> —</li>
      <li><b>Hora:</b> —</li>
    </>
  );
  const iso = `${form.date}T${form.time}`;
  return (
    <>
      <li><b>Data:</b> {format(new Date(iso), "dd/MM/yyyy")}</li>
      <li><b>Hora:</b> {form.time}</li>
    </>
  );
})()}
        </ul>
        <div className="flex justify-end gap-3">
          <button className="btn" onClick={()=>setPreviewOpen(false)}>Editar</button>
          <button className="btn-primary" onClick={confirmSchedule}>Confirmar</button>
        </div>
      </Modal>
    </div>
  );
};

/* ------------------- Página: Minhas Consultas ------------------ */
const ConsultasPage: React.FC = () => {
  const { state, dispatch } = useAppts();
  const [dialog, setDialog] = useState<Appointment|null>(null);
  const [err,setErr]=useState("");

  const cancel = ()=>{
    if(!dialog) return;
    const apptDate=parseISO(`${dialog.date}T${dialog.time}:00`);
    if(isBefore(apptDate,new Date())) return setErr("Consulta já passou.");
    if(differenceInHours(apptDate,new Date())<2) return setErr("Só é possível cancelar até 2h antes.");
    dispatch({type:"CANCEL", payload:{id:dialog.id, canceledAt:new Date().toISOString()}});
    setDialog(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Minhas Consultas</h1>
      {state.appointments.filter(a=>a.status==='CONFIRMED').length===0 && <p>Nenhuma consulta agendada.</p>}
      <div className="space-y-4">
        {state.appointments.filter(a=>a.status==='CONFIRMED').map(a=>(
          <div key={a.id} className="flex justify-between items-center bg-white p-4 rounded shadow">
            <span>{format(parseISO(`${a.date}T${a.time}:00`),"dd/MM/yyyy HH:mm")} – {a.doctorName}</span>
            <button className="btn-danger" onClick={()=>{setDialog(a);setErr("");}}>Cancelar</button>
          </div>
        ))}
      </div>

      {/* Modal cancelamento */}
      <Modal open={!!dialog} onClose={()=>setDialog(null)}>
        <h2 className="text-lg font-medium mb-4">Cancelar Consulta?</h2>
        {dialog && <p className="mb-4 text-sm">{format(parseISO(`${dialog.date}T${dialog.time}:00`),"dd/MM/yyyy HH:mm")} – {dialog.doctorName}</p>}
        {err && <p className="text-red-600 text-sm mb-2">{err}</p>}
        <div className="flex justify-end gap-3">
          <button className="btn" onClick={()=>setDialog(null)}>Fechar</button>
          <button className="btn-danger" onClick={cancel}>Cancelar Consulta</button>
        </div>
      </Modal>
    </div>
  );
};

/* --------------------------- Layout ---------------------------- */
const Navbar:React.FC=()=>(
  <nav className="bg-sky-700 text-white py-3">
    <div className="container mx-auto flex gap-6">
      <Link to="/" className="hover:underline">Agendar</Link>
      <Link to="/consultas" className="hover:underline">Minhas Consultas</Link>
    </div>
  </nav>
);

const AppointmentScheduler: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppointmentCtx.Provider value={{state, dispatch}}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<SchedulePage/>} />
          <Route path="/consultas" element={<ConsultasPage/>} />
        </Routes>
      </BrowserRouter>
    </AppointmentCtx.Provider>
  );
};

export default AppointmentScheduler;
