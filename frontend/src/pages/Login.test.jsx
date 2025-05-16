import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import React from 'react';


// Mockea el servicio de autenticación
jest.mock('../services/api.js', () => ({
  authService: {
    login: jest.fn(() => Promise.resolve({ success: true }))
  }
}));

describe('Login Page', () => {
    test('renders email and password inputs', () => {
        render(<Login />, { wrapper: MemoryRouter });
        
        expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
    });

    test('shows error when fields are empty', async () => {
    render(<Login />, { wrapper: MemoryRouter });

    const submitButton = screen.getByRole('button', { name: /ingresar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
        const errors = screen.getAllByText(/este campo no puede estar vacío/i);
        expect(errors).toHaveLength(2);
    });
    });

  test('calls authService.login with valid credentials', async () => {
    const { authService } = require('../services/api.js');

    render(<Login />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'test@example.com' }
    });

    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: '123456' }
    });

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test@example.com', '123456');
    });
  });
});
