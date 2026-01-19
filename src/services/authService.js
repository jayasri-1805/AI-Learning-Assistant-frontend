import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const login = async (email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
      email,
      password,
    });
    console.log("LOGIN RESPONSE FULL:", JSON.stringify(response.data, null, 2));
    const token = response.data.token;
    localStorage.setItem("token", token);

    if (!token) {
      throw new Error("Token not received from server");
    }

    localStorage.setItem("token", token);

    return response.data;
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
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "An unknown error occurred" };
  }
};

const getProfile = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
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
    const response = await axiosInstance.post(
      API_PATHS.AUTH.CHANGE_PASSWORD,
      passwords,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "An unknown error occurred" };
  }
};

const authService = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
};

export default authService;
