// controllers/authController.js

import { loginUser, registerUser } from "../services/authService.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export const register = async (req, res) => {
  const { name, lastName, email, cellphone, password, role } = req.body;

  try {
    const result = await registerUser(name, lastName, email, cellphone, password, role);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
