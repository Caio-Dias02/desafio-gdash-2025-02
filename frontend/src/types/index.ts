// =====================
// AUTENTICAÇÃO
// =====================

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// =====================
// DADOS CLIMÁTICOS
// =====================

export interface WeatherLog {
  _id: string;
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  rainChance: number;
  pressure: number;
  visibility: number;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherStats {
  city: string;
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  avgHumidity: number;
  avgPressure: number;
  days: number;
}

// =====================
// API RESPONSES
// =====================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
