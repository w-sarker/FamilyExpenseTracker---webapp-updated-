import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [familyPin, setFamilyPin] = useState(localStorage.getItem('FAMILY_PIN') || '');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // If PIN exists in storage, we consider them "authenticated" for UI purposes
        // Real validation happens on API calls (401 response)
        if (familyPin) {
            localStorage.setItem('FAMILY_PIN', familyPin);
            setIsAuthenticated(true);
        } else {
            localStorage.removeItem('FAMILY_PIN');
            setIsAuthenticated(false);
        }
    }, [familyPin]);

    const login = (pin) => {
        setFamilyPin(pin);
    };

    const logout = () => {
        setFamilyPin('');
        localStorage.removeItem('FAMILY_PIN');
        localStorage.removeItem('ADMIN_PIN'); // Clear admin too just in case
    };

    return (
        <AuthContext.Provider value={{ familyPin, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
