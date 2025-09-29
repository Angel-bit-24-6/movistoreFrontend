import api from '../../../../src/services/api';
import { LoginCredentials, RegisterData, ApiResponse, User } from '../../../../src/types';

interface AuthResponseData {
  user: User;
  token: string;
}

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponseData> => {
  const response = await api.post<ApiResponse<AuthResponseData>>('/auth/login', credentials);
  return response.data.data;
};

export const registerUser = async (data: RegisterData): Promise<AuthResponseData> => {
  const response = await api.post<ApiResponse<AuthResponseData>>('/auth/register', data);
  return response.data.data;
};

export const getUserProfile = async (): Promise<User> => {
  const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
  return response.data.data.user;
};
