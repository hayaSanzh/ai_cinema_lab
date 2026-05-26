export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};
