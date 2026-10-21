import { createContext, useContext, useEffect, useState } from "react";
const AuthContext = createContext();
const AUTH_KEY = "shama-chicken-shop-auth";
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // Get user when application starts
    useEffect(() => {
        try {
            const savedUser = localStorage.getItem(AUTH_KEY);
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.log("Invalid user data");
            localStorage.removeItem(AUTH_KEY);
        } finally {
            setLoading(false);
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
                loading,
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