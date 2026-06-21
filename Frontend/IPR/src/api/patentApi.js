import axios from 'axios';

const API_URL = 'http://localhost:5000/api/patents';

export const getAllPatents = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getPatentById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const addPatent = async (patentData) => {
  const response = await axios.post(API_URL, patentData);
  return response.data;
};

export const deletePatent = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
