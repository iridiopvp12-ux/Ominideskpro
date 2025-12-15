import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, Ticket, User, Bot, Send, 
  MoreVertical, Search, LogOut, X, 
  FileText, AlertTriangle,  
  PlusCircle, Building2, Users, CheckCircle
} from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

// --- 1. COMPONENTES VISUAIS ---

const StatusBadge = ({ isAiActive }) => (
  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 w-max ${
    isAiActive 
      ? "bg-green-100 text-green-700 border-green-200" 
      : "bg-yellow-100 text-yellow-700 border-yellow-200"
  }`}>
    {isAiActive ? <><Bot size={12}/> IA ATIVA</> : <><User size={12}/> MANUAL</>}
  </span>
);

const DepartmentBadge = ({ name }) => (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1 w-max uppercase">
        <Building2 size={10}/> {name}
    </span>
);

const TriageReportCard = ({ report }) => {
  if (!report) return null;
  let data = {};
  try { data = typeof report === 'string' ? JSON.parse(report) : report; } catch (e) { return null; }

  return (
    <div className="bg-white border border-l-4 border-l-orange-500 border-gray-200 rounded-lg p-4 space-y-3 shadow-sm mt-4">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-2">
        <span className="text-xl">🚨</span>
        <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Relatório de Triagem</h4>
      </div>
      <div className="space-y-3 text-sm">
        <div><span className="font-bold text-gray-800 block flex items-center gap-1.5 mb-0.5">👤 Cliente:</span><p className="text-gray-600 pl-1">{data.cliente || 'Identificando...'}</p></div>
        <div><span className="font-bold text-gray-800 block flex items-center gap-1.5 mb-0.5">📂 Tema:</span><p className="text-gray-600 pl-1 bg-gray-100 px-2 py-0.5 rounded inline-block">{data.tema || 'Geral'}</p></div>
        <div><span className="font-bold text-gray-800 block flex items-center gap-1.5 mb-0.5">📝 Interpretação:</span><p className="text-gray-600 pl-1 text-sm leading-relaxed">{data.interpretacao}</p></div>
        {data.sugestao && <div className="bg-blue-50 p-2 rounded border border-blue-200"><span className="font-bold text-blue-800 block flex items-center gap-1.5 mb-1 text-xs">⚖ Sugestão:</span><p className="text-blue-900 text-xs pl-1">{data.sugestao}</p></div>}
      </div>
    </div>
  );
};

// --- 2. SIDEBAR ---
const Sidebar = ({ activeTab, setActiveTab, setCurrentUser }) => (
    <div className="w-[72px] bg-slate-900 flex flex-col items-center py-6 gap-6 h-screen flex-shrink-0 z-20 justify-between">
      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold mb-4 shadow-lg shadow-blue-900/50">AI</div>
      <div className="flex flex-col gap-4 w-full px-3">
        <button onClick={() => setActiveTab('chat')} className={`w-full aspect-square rounded-xl flex items-center justify-center transition duration-200 ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`} title="Chats"><MessageSquare size={22} /></button>
        <button onClick={() => setActiveTab('tickets')} className={`w-full aspect-square rounded-xl flex items-center justify-center transition duration-200 ${activeTab === 'tickets' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`} title="Chamados"><Ticket size={22} /></button>
        <button onClick={() => setActiveTab('users')} className={`w-full aspect-square rounded-xl flex items-center justify-center transition duration-200 ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`} title="Equipe"><Users size={22} /></button>
      </div>
      <div className="mt-auto flex flex-col gap-4 w-full px-3">
        <button onClick={() => setCurrentUser(null)} className="w-full aspect-square rounded-xl flex items-center justify-center text-red-400 hover:bg-red-900/30 hover:text-red-200 transition" title="Sair"><LogOut size={22} /></button>
      </div>
    </div>
);

// --- 3. GESTÃO DE EQUIPE ---
const UsersView = () => {
    const [users, setUsers] = useState([]);
    const [depts, setDepts] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'AGENT', departmentId: '' });
    const [newDept, setNewDept] = useState('');

    useEffect(() => { fetchData(); }, []);
    const fetchData = () => {
        fetch(`${API_URL}/users`).then(r => r.json()).then(setUsers);
        fetch(`${API_URL}/departments`).then(r => r.json()).then(setDepts);
    }
    const handleCreateUser = async (e) => {
        e.preventDefault();
        await fetch(`${API_URL}/users`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(formData) });
        alert("Usuário criado!");
        setFormData({ name: '', email: '', password: '', role: 'AGENT', departmentId: '' });
        fetchData();
    };
    const handleCreateDept = async () => {
        if(!newDept) return;
        await fetch(`${API_URL}/departments`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({name: newDept}) });
        setNewDept('');
        fetchData();
    }
    return (
        <div className="flex-1 bg-gray-50 p-8 h-full overflow-y-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestão de Equipe</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg mb-4">Novo Funcionário</h3>
                    <form onSubmit={handleCreateUser} className="space-y-3">
                        <input required placeholder="Nome Completo" className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        <input required placeholder="Email" className="w-full border p-2 rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        <input required type="password" placeholder="Senha" className="w-full border p-2 rounded" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        <div className="flex gap-2">
                            <select className="flex-1 border p-2 rounded" value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})}>
                                <option value="">Selecione o Setor...</option>
                                {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <select className="w-1/3 border p-2 rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                <option value="AGENT">Agente</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold">Cadastrar</button>
                    </form>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-max">
                    <h3 className="font-bold text-lg mb-4">Criar Setor</h3>
                    <div className="flex gap-2"><input placeholder="Nome do Setor (ex: Jurídico)" className="flex-1 border p-2 rounded" value={newDept} onChange={e => setNewDept(e.target.value)} /><button onClick={handleCreateDept} className="bg-purple-600 text-white px-4 rounded hover:bg-purple-700"><PlusCircle/></button></div>
                    <div className="mt-4 flex flex-wrap gap-2">{depts.map(d => <span key={d.id} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">{d.name}</span>)}</div>
                </div>
            </div>
            <h3 className="font-bold text-lg mt-8 mb-4">Funcionários Cadastrados</h3>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs"><tr><th className="p-4">Nome</th><th className="p-4">Email</th><th className="p-4">Setor</th><th className="p-4">Função</th></tr></thead>
                    <tbody>{users.map(u => (<tr key={u.id} className="border-t hover:bg-gray-50"><td className="p-4 font-medium">{u.name}</td><td className="p-4 text-gray-500">{u.email}</td><td className="p-4">{u.department ? <DepartmentBadge name={u.department.name} /> : <span className="text-gray-400">-</span>}</td><td className="p-4">{u.role}</td></tr>))}</tbody>
                </table>
            </div>
        </div>
    );
};

// --- 4. TICKETS VIEW (KANBAN COM AÇÕES COMPLETAS) ---
const TicketsView = ({ tickets, selectedTicket, setSelectedTicket, currentUser, setActiveTab, setSelectedChatId, refreshData }) => {
    const [closingNote, setClosingNote] = useState("");
    const [showCloseInput, setShowCloseInput] = useState(false);

    const columns = [
        { id: 'todo', label: 'Triagem / Entrada', color: 'border-l-red-500', list: tickets.filter(t => t.status === 'todo') },
        { id: 'doing', label: 'Em Atendimento', color: 'border-l-blue-500', list: tickets.filter(t => t.status === 'doing') },
        { id: 'done', label: 'Finalizados', color: 'border-l-green-500', list: tickets.filter(t => t.status === 'done') }
    ];

    // LÓGICA CRÍTICA: ASSUMIR -> MUDAR STATUS -> DESLIGAR IA -> IR PRO CHAT
    const handleTakeOwnership = async () => {
        if(!selectedTicket) return;
        try {
            // 1. Assumir (Muda status para 'doing' no backend)
            await fetch(`${API_URL}/tickets/${selectedTicket.id}/assign`, {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ userId: currentUser.id })
            });

            // 2. Desligar IA
            await fetch(`${API_URL}/contacts/${selectedTicket.contactId}/toggle-ai`, {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ isAiActive: false })
            });

            // 3. Redirecionar
            if(refreshData) refreshData();
            setSelectedChatId(selectedTicket.contactId); // Foca no contato
            setSelectedTicket(null); // Fecha o modal
            setActiveTab('chat'); // Muda de aba

        } catch (e) { alert("Erro ao assumir chamado."); }
    };

    const handleCloseTicket = async () => {
        if(!selectedTicket) return;
        try {
            await fetch(`${API_URL}/tickets/${selectedTicket.id}/close`, {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ closingNote })
            });
            setShowCloseInput(false);
            setClosingNote("");
            setSelectedTicket(null);
            if(refreshData) refreshData();
        } catch (e) { alert("Erro ao encerrar."); }
    };

    const handleGoToChat = () => {
        setSelectedChatId(selectedTicket.contactId);
        setActiveTab('chat');
        setSelectedTicket(null);
    }

    return (
        <div className="flex-1 bg-gray-50 p-8 h-full overflow-y-auto flex flex-col relative">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Central de Chamados</h1>
            <div className="flex-1 overflow-x-auto">
                <div className="flex gap-6 h-full min-w-[1000px]">
                    {columns.map(col => (
                        <div key={col.id} className="w-80 flex flex-col">
                            <div className="flex justify-between items-center mb-4 px-1">
                                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">{col.label}</h3>
                                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{col.list.length}</span>
                            </div>
                            <div className="bg-gray-100/50 p-2 rounded-xl h-full space-y-3 border border-gray-200/50">
                                {col.list.map(ticket => (
                                    <div key={ticket.id} onClick={() => { setSelectedTicket(ticket); setShowCloseInput(false); }} className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer relative group ${col.color} border-l-4`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1 rounded">#{ticket.id.slice(0,6)}</span>
                                            {ticket.priority === 'high' && <AlertTriangle size={14} className="text-red-500" />}
                                        </div>
                                        <div className="mb-3">
                                            <h4 className="font-bold text-gray-800 text-sm leading-tight">{ticket.contactName || 'Desconhecido'}</h4>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ticket.title}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {ticket.department && <DepartmentBadge name={ticket.department.name} />}
                                            {ticket.summary && <div className="flex items-center gap-1 text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded"><FileText size={10}/> Relatório IA</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedTicket && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">Ticket #{selectedTicket.id.slice(0,8)}</span>
                            <button onClick={() => setSelectedTicket(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition"><X size={20} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedTicket.contactName}</h2>
                                <p className="text-gray-600 text-sm">{selectedTicket.title}</p>
                            </div>
                            
                            {/* Relatório de Triagem */}
                            {selectedTicket.summary ? (
                                <TriageReportCard report={selectedTicket.summary} />
                            ) : (
                                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200"><Bot size={32} className="mx-auto mb-2 opacity-50"/><p>Ainda sem relatório gerado.</p></div>
                            )}

                            {/* --- ÁREA DE AÇÕES (EM BAIXO DO RELATÓRIO) --- */}
                            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                                
                                {/* 1. Se estiver na Triagem -> Botão Assumir */}
                                {selectedTicket.status === 'todo' && (
                                    <button onClick={handleTakeOwnership} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                                        ✋ Assumir Tratativa e Ir para Chat
                                    </button>
                                )}

                                {/* 2. Se estiver Em Atendimento -> Botões Chat e Encerrar */}
                                {selectedTicket.status === 'doing' && !showCloseInput && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={handleGoToChat} className="col-span-1 bg-blue-50 text-blue-700 py-3 rounded-xl font-bold text-sm hover:bg-blue-100 transition flex items-center justify-center gap-2 border border-blue-200">
                                            <MessageSquare size={16}/> Ir para Chat
                                        </button>
                                        <button onClick={() => setShowCloseInput(true)} className="col-span-1 bg-green-50 text-green-700 py-3 rounded-xl font-bold text-sm hover:bg-green-100 transition flex items-center justify-center gap-2 border border-green-200">
                                            <CheckCircle size={16}/> Encerrar
                                        </button>
                                    </div>
                                )}

                                {/* Input para Encerrar */}
                                {showCloseInput && (
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-bottom-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Nota de Encerramento (Opcional):</label>
                                        <textarea 
                                            value={closingNote} onChange={e => setClosingNote(e.target.value)} 
                                            className="w-full border p-2 rounded-lg text-sm mb-3 focus:outline-blue-500" 
                                            rows={2} placeholder="Ex: Cliente fechou contrato..." 
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => setShowCloseInput(false)} className="flex-1 py-2 text-gray-500 hover:bg-gray-200 rounded-lg text-sm">Cancelar</button>
                                            <button onClick={handleCloseTicket} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700">Confirmar Encerramento</button>
                                        </div>
                                    </div>
                                )}

                                {/* 3. Se estiver Encerrado */}
                                {selectedTicket.status === 'done' && (
                                    <div className="bg-gray-100 text-gray-500 p-3 rounded-lg text-center text-sm font-medium">
                                        Este chamado foi encerrado.
                                        {selectedTicket.closingNote && <p className="text-xs mt-1 italic">"{selectedTicket.closingNote}"</p>}
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 5. CHAT VIEW (LIMPO E SEM BARRA PRETA) ---
const ChatView = ({ 
    contacts, selectedChatId, setSelectedChatId, activeContact, 
    toggleAi, showRightPanel, setShowRightPanel, messages, 
    inputText, setInputText, handleSendMessage, 
    chatContainerRef, messagesEndRef, handleScroll 
}) => (
    <div className="flex flex-1 h-full overflow-hidden bg-gray-50">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-10">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-800 text-lg mb-3">Conversas</h2>
          <div className="relative"><Search className="absolute left-3 top-2.5 text-gray-400" size={16} /><input type="text" placeholder="Buscar..." className="w-full bg-gray-100 pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none" /></div>
        </div>
        <div className="overflow-y-auto flex-1">
            {contacts.map((contact) => (
                <div key={contact.id} onClick={() => setSelectedChatId(contact.id)} className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-blue-50 transition ${selectedChatId === contact.id ? 'bg-blue-50/80 border-l-4 border-l-blue-600' : ''}`}>
                    <div className="flex gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{contact.avatar}</div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1"><span className="font-semibold text-sm truncate text-gray-900">{contact.name}</span><span className="text-[10px] text-gray-400">{contact.time}</span></div>
                            <p className="text-xs text-gray-500 truncate mb-1">{contact.lastMsg}</p>
                            <StatusBadge isAiActive={contact.isAiActive} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-white/50 backdrop-blur-sm relative">
        {selectedChatId && activeContact ? (
            <>
                <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 shadow-sm z-10">
                    <div className="flex flex-col">
                        <h2 className="font-bold text-gray-800">{activeContact.name}</h2>
                        <span className="text-xs text-gray-500">{activeContact.id}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={toggleAi} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition text-xs font-bold ${activeContact.isAiActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                            {activeContact.isAiActive ? <><Bot size={16}/> IA ATIVA</> : <><User size={16}/> MODO MANUAL</>}
                        </button>
                        <button onClick={() => setShowRightPanel(!showRightPanel)} className={`p-2 rounded-lg transition ${showRightPanel ? 'bg-gray-200 text-gray-800' : 'hover:bg-gray-100'}`}><MoreVertical size={18}/></button>
                    </div>
                </div>

                <div ref={chatContainerRef} onScroll={handleScroll} className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[70%] p-3.5 rounded-2xl shadow-sm text-sm ${msg.sender === 'user' ? 'bg-white text-gray-800 rounded-tl-none' : msg.isAi ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none' : 'bg-gray-800 text-white rounded-tr-none'}`}>
                                {msg.isAi && <div className="text-[10px] opacity-75 mb-1 flex items-center gap-1 font-medium border-b border-white/20 pb-1"><Bot size={10}/> IA Júlia</div>}
                                <p>{msg.text}</p>
                                <div className={`text-[10px] text-right mt-1 ${msg.sender === 'user' ? 'text-gray-400' : 'text-gray-300'}`}>{msg.time}</div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex gap-3 items-end">
                        <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()} placeholder={activeContact.isAiActive ? "IA ativa. Digite para assumir..." : "Digite sua mensagem..."} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 resize-none text-sm" rows={1} />
                        <button onClick={handleSendMessage} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition"><Send size={20} /></button>
                    </div>
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <MessageSquare size={48} className="mb-4 opacity-20"/>
                <p>Selecione uma conversa para atender.</p>
            </div>
        )}
      </div>

      {showRightPanel && selectedChatId && activeContact && (
        <div className="w-96 bg-white border-l border-gray-200 p-6 flex flex-col h-full animate-in slide-in-from-right overflow-y-auto shadow-xl z-20">
            <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-gray-500">{activeContact.avatar}</div>
                <h3 className="font-bold text-gray-800 text-lg">{activeContact.name}</h3>
                <p className="text-xs text-gray-500 mt-1">Status: <StatusBadge isAiActive={activeContact.isAiActive} /></p>
            </div>
            <div className="flex-1 space-y-6">
                {activeContact.lastTicketReport ? (
                    <div className="animate-in fade-in duration-500"><TriageReportCard report={activeContact.lastTicketReport} /></div>
                ) : (
                    <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center text-sm text-gray-500"><Bot size={24} className="mx-auto mb-2 opacity-30"/><p>Nenhum relatório gerado recentemente.</p></div>
                )}
            </div>
        </div>
      )}
    </div>
);

// --- 6. APP PRINCIPAL ---
export default function App() {
  const [currentUser, setCurrentUser] = useState(null); 
  const [contacts, setContacts] = useState([]); 
  const [tickets, setTickets] = useState([]); 
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  const messagesEndRef = useRef(null); 
  const chatContainerRef = useRef(null); 
  const [isScrolledUp, setIsScrolledUp] = useState(false); 
  const prevMessagesLength = useRef(0);

  const activeContact = contacts.find(c => c.id === selectedChatId);

  // Polling de Contatos
  const fetchContacts = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_URL}/contacts`);
      const data = await res.json();
      if (!Array.isArray(data)) return;
      const formattedContacts = data.map(c => ({
        id: c.id,
        name: c.name || c.pushName || c.id.split('@')[0], 
        avatar: (c.name || c.pushName || c.id)[0].toUpperCase(),
        lastMsg: c.messages[0]?.content || 'Nova conversa',
        time: c.messages[0]?.createdAt ? new Date(c.messages[0].createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '',
        isAiActive: c.isAiActive,
        lastTicketReport: c.tickets && c.tickets.length > 0 ? c.tickets[0].summary : null
      }));
      setContacts(formattedContacts);
    } catch (error) { console.error("Erro API Contatos", error); }
  }, [currentUser]);

  useEffect(() => { fetchContacts(); const interval = setInterval(fetchContacts, 3000); return () => clearInterval(interval); }, [fetchContacts]);

  // Polling de Tickets
  const fetchTickets = useCallback(async () => {
    if (!currentUser) return;
    try {
        const res = await fetch(`${API_URL}/tickets`);
        const data = await res.json();
        if (Array.isArray(data)) {
            setTickets(data.map(t => ({...t, contactName: t.contact?.name || t.contactId})));
        }
    } catch (error) { console.error("Erro API Tickets", error); }
  }, [currentUser]);

  useEffect(() => {
      if (activeTab === 'tickets') { fetchTickets(); const interval = setInterval(fetchTickets, 5000); return () => clearInterval(interval); }
  }, [activeTab, fetchTickets]);

  // Polling de Mensagens
  useEffect(() => {
    if (!selectedChatId) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/messages/${selectedChatId}`);
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const formattedMessages = data.map(m => ({
          id: m.id,
          text: m.content,
          sender: m.fromMe ? 'agent' : 'user', 
          isAi: m.isAi,
          time: new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }));
        setMessages(prev => { if (prev.length !== formattedMessages.length) return formattedMessages; return prev; });
      } catch (error) { console.error("Erro API Mensagens", error); }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000); 
    return () => clearInterval(interval);
  }, [selectedChatId]);

  // Scroll
  useEffect(() => { prevMessagesLength.current = 0; setIsScrolledUp(false); }, [selectedChatId]);
  useEffect(() => {
    if (messagesEndRef.current && chatContainerRef.current) {
        const currentLength = messages.length;
        const prevLength = prevMessagesLength.current;
        if (prevLength === 0 && currentLength > 0) messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        else if (currentLength > prevLength && !isScrolledUp) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        prevMessagesLength.current = currentLength;
    }
  }, [messages, isScrolledUp]);

  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop <= clientHeight + 200; 
        if (isScrolledUp === isNearBottom) setIsScrolledUp(!isNearBottom);
    }
  }, [isScrolledUp]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedChatId) return;
    const textToSend = inputText;
    setInputText(''); 
    const optimisticMsg = { id: Date.now(), text: textToSend, sender: 'agent', isAi: false, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setMessages(prevMessages => [...prevMessages, optimisticMsg]);
    setIsScrolledUp(false); 
    try {
      await fetch(`${API_URL}/send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactId: selectedChatId, text: textToSend }) });
    } catch (error) { setMessages(prevMessages => prevMessages.filter(m => m.id !== optimisticMsg.id)); alert("Erro de conexão."); }
  };

  const toggleAi = async () => {
    if (!selectedChatId) return;
    const contact = contacts.find(c => c.id === selectedChatId);
    if (!contact) return;
    const newState = !contact.isAiActive;
    try {
        setContacts(prev => prev.map(c => c.id === selectedChatId ? { ...c, isAiActive: newState } : c));
        await fetch(`${API_URL}/contacts/${selectedChatId}/toggle-ai`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isAiActive: newState }) });
    } catch (error) { console.error("Erro ao alterar IA"); }
  };
  
  if (!currentUser) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-100 font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">AI</div>
                    <h1 className="text-2xl font-bold text-gray-800">OmniDesk Pro</h1>
                    <p className="text-gray-500 text-sm mt-1">Painel de Controle</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); setCurrentUser({ id: 'admin-1', name: 'Admin' }); }} className="space-y-4">
                    <input type="text" placeholder="Usuário" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
                    <input type="password" placeholder="Senha" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition">Entrar</button>
                </form>
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-screen w-full font-sans bg-gray-100 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} setCurrentUser={setCurrentUser} />
      <div className="flex-1 h-full relative">
        {activeTab === 'chat' && (
            <ChatView 
                contacts={contacts} selectedChatId={selectedChatId} setSelectedChatId={setSelectedChatId}
                activeContact={activeContact} toggleAi={toggleAi} showRightPanel={showRightPanel} setShowRightPanel={setShowRightPanel}
                messages={messages} inputText={inputText} setInputText={setInputText} handleSendMessage={handleSendMessage}
                chatContainerRef={chatContainerRef} messagesEndRef={messagesEndRef} handleScroll={handleScroll}
            />
        )}
        {activeTab === 'tickets' && (
            <TicketsView 
                tickets={tickets} selectedTicket={selectedTicket} setSelectedTicket={setSelectedTicket}
                currentUser={currentUser} setActiveTab={setActiveTab} setSelectedChatId={setSelectedChatId} refreshData={() => { fetchTickets(); fetchContacts(); }}
            />
        )}
        {activeTab === 'users' && (
            <UsersView />
        )}
      </div>
    </div>
  );
}