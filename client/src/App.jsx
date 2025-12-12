import { useEffect, useState } from 'react';
import { api } from './services/api';
import UserForm from './components/UserForm';
import UsersTable from './components/UsersTable';
import './index.css';

import TestController from './modules/test.controller';

function App() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.listUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (payload) => {
    if (editing) {
      const updated = await api.updateUser(editing.id, payload);
      setUsers((prev) => prev.map((u) => (u.id === editing.id ? updated : u)));
      setEditing(null);
      setNotif('Usuario actualizado');
    } else {
      const created = await api.createUser(payload);
      setUsers((prev) => [created, ...prev]);
      setNotif('Usuario creado');
    }
    setTimeout(() => setNotif(''), 1500);
  };

  const del = async (id) => {
    await api.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setNotif('Usuario eliminado');
    setTimeout(() => setNotif(''), 1500);
  };

  return (
    <div className="container">
      <header>
        <h1>SGU-JTG-10A</h1>
        <p>One-page: registra y consulta usuarios</p>
      </header>

      {notif && <div className="toast">{notif}</div>}

      <UserForm
        onSubmit={create}
        editingUser={editing}
        onCancelEdit={() => setEditing(null)}
      />

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : (
        <UsersTable users={users} onEdit={setEditing} onDelete={del} />
      )}

      <div>
        <button onClick={() => TestController.callToApi()}>Llamar api</button>
      </div>
    </div>
  );
}

export default App;
