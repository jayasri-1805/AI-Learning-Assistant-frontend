import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const login = async (email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
      email,
      password,
    });

    // Backend returns: { success: true, data: { user: {...} }, token: "..." }
    // We want to return { user: ... } or { user: ..., token: ... }

    if (!response.data.data || !response.data.data.user) {
      throw new Error("User data not received from server");
    }

    // Return the data object which contains 'user'.
    // We can also include 'token' from the root if needed, but for cookies we primarily need user.
    return {
      user: response.data.data.user,
      token: response.data.token,
    };
  } catch (error) {
    throw error.response?.data || { message: "An unknown error occurred" };
  }
};

const register = async (username, email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
      name: username,
      email,
      password,
    });
    // Similar to login
    return {
      user: response.data.data.user,
      token: response.data.token,
    };
  } catch (error) {
    throw error.response?.data || { message: "An unknown error occurred" };
  }
};

const getProfile = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
    // Backend: { success: true, data: { ...user fields... } }
    // We expect to return { data: ... } or just the user object.
    // AuthContext expects response.data to be the user object?
    // Step 768 AuthContext: "if (response && response.data) { setUser(response.data); }"
    // So getProfile should return the response object or response.data.

    // Let's return the full response from axios so AuthContext can handle it?
    // Or return response.data (the body).
    // If I return response.data, then AuthContext sees { success, data: user }.
    // AuthContext: setUser(response.data.data) ??
    // Step 768: "setUser(response.data)" -> this sets user to { success: true, data: user }.
    // That is WRONG. User state should be the user object.

    // Let's fix getProfile to return { data: userObject }.
    // Backend returns { data: { id, name... } }.
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "An unknown error occurred" };
  }
};

const updateProfile = async (userData) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.AUTH.UPDATE_PROFILE,
      userData,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "An unknown error occurred" };
  }
};

const changePassword = async (passwords) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.AUTH.CHANGE_PASSWORD,
      passwords,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "An unknown error occurred" };
  }
};

const logout = async () => {
  try {
    await axiosInstance.post(API_PATHS.AUTH.LOGOUT || "/api/auth/logout");
  } catch (error) {
    console.error("Logout failed", error);
  }
};

const authService = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  logout,
};

export default authService;
