import { createContext, useContext, useEffect, useState } from "react";
const AuthContext = createContext();
const AUTH_KEY = "shama-chicken-shop-auth";
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    // Get user when application starts
    useEffect(() => {
        const savedUser = localStorage.getItem(AUTH_KEY);
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.log("Invalid user data");
                localStorage.removeItem(AUTH_KEY);
            }
        }
    }, []);
    // Login
    const login = (userData) => {
        localStorage.setItem(
            AUTH_KEY,
            JSON.stringify(userData)
        );
        setUser(userData);
    };
    // Logout
    const logout = () => {
        localStorage.removeItem(AUTH_KEY);
        setUser(null);
    };
    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
export function useAuth() {
    return useContext(AuthContext);
}