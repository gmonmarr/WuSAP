// pages/admin/UserList.jsx

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import ListComponent from '../../components/ListComponent';
import Header from '../../components/Header';
import "@ui5/webcomponents/dist/Button.js";
import './UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    // Simulate fetching user data
    const fetchUsers = async () => {
      const mockUsers = [
        { id: 1, name: 'Juan Pérez', email: 'juan.perez@example.com', role: 'Admin' },
        { id: 2, name: 'Ana Gómez', email: 'ana.gomez@example.com', role: 'Usuario' },
        { id: 3, name: 'Carlos López', email: 'carlos.lopez@example.com', role: 'Distribuidor' },
        { id: 4, name: 'Danny Wu', email: 'danny.wu@example.com', role: 'Usuario' }, 
      ];
      setUsers(mockUsers);
    };

    fetchUsers();
  }, []);

  // Filter users based on the search query and selected role
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedRole === '' || user.role === selectedRole)
  );

  const renderUserItem = (user) => (
    <>
      <span>{user.name}</span>
      <span>{user.email}</span>
      <span>{user.role}</span>
    </>
  );

  return (
    <>
      <Navbar />
      <Header title={"Usuarios"} />
      <div className="user-list-container">
        <div className="filter-container">
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-input"
          />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="filter-dropdown"
          >
            <option value="">Todos los roles</option>
            <option value="Admin">Admin</option>
            <option value="Usuario">Usuario</option>
            <option value="Distribuidor">Distribuidor</option>
          </select>
        </div>
        <ListComponent 
          data={filteredUsers} 
          renderItem={renderUserItem} 
        />
      </div>
    </>
  );
};

export default UserList;
