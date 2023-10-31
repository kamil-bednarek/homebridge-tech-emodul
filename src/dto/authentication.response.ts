export interface AuthenticationResponse {
    authenticated: boolean;
    user_id: number;
    access_google_home: boolean;
    token: string;
}
