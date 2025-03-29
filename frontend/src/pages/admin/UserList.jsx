import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import ListComponent from '../../components/ListComponent';
import "@ui5/webcomponents/dist/Button.js";
import './UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Simulate fetching user data
    const fetchUsers = async () => {
      const mockUsers = [
        { id: 1, name: 'Juan Pérez', email: 'juan.perez@example.com', role: 'Admin' },
        { id: 2, name: 'Ana Gómez', email: 'ana.gomez@example.com', role: 'Usuario' },
        { id: 3, name: 'Carlos López', email: 'carlos.lopez@example.com', role: 'Distribuidor' },
      ];
      setUsers(mockUsers);
    };

    fetchUsers();
  }, []);

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
      <div className="user-list-container">
        <h2>Lista de Usuarios</h2>
        <ListComponent 
          data={users} 
          renderItem={renderUserItem} 
          headerText="Lista de Usuarios" 
        />
      </div>
    </>
  );
};

export default UserList;
