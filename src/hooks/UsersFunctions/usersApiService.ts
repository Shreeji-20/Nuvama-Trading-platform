import axios from "axios";
import config from "../../config/api";

const fetchUsers = async () => {
  try {
    const response = await axios.get(`${config.API_BASE_URL}/users`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users aXIOS:", error);
    return [];
  }
};

const createUser = async (userData: any) => {
  try {
    const response = await axios.post(`${config.API_BASE_URL}/user`, userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

const updateUser = async (userData: any) => {
  try {
    console.log("Updating user with data:", userData);
    const response = await axios.patch(`${config.API_BASE_URL}/user`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

const deleteUser = async (userId: string) => {
  try {
    const response = await axios.delete(
      `${config.API_BASE_URL}/deleteuser/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

const loginUser = async (userData: any) => {
  try {
    console.log("Logging in user with data:", userData);
    const response = await axios.post(
      `${config.API_BASE_URL}/userlogin`,
      userData
    );

    return response.data;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

export { fetchUsers, createUser, updateUser, deleteUser, loginUser };
