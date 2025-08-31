// Global ambient types for the HospiLink app

export {};

declare global {
  interface Window {
    __HOSPILINK_AUTH__?: {
      isAuthenticated: boolean;
      user?: {
        id: string;
        email: string;
        name: string;
        username?: string;
  role?: 'patient' | 'doctor' | 'admin';
  roles?: Array<'patient' | 'doctor' | 'admin'>;
      } | null;
    };
  }
}
