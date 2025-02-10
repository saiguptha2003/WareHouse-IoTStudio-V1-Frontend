export interface FileEntry {
  uuid: string;
  filename: string;
  timeStamp?: string;
}

export interface ApiResponse<T> {
  error?: string;
  message?: string;
  connect_files?: T[];
  trigger_files?: T[];
  static_files?: T[];
}

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}