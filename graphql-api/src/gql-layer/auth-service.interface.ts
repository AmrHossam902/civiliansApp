
export interface AuthService {
    
    createNewUser();
    login(accountId: number, password: string);
    generateNewAccessToken(refreshToken: string);

}