// // src/contexts/AuthContext.js
// import React, { createContext, useState, useEffect, useContext } from 'react';
// import { authService } from '../services/api';

// // Création du contexte d'authentification
// const AuthContext = createContext(null);

// // Hook personnalisé pour utiliser le contexte d'authentification
// export const useAuth = () => useContext(AuthContext);

// // Fournisseur du contexte d'authentification
// export const AuthProvider = ({ children }) => {
//     const [currentUser, setCurrentUser] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // Charger l'utilisateur au chargement de la page
//     useEffect(() => {
//         const loadUser = async () => {
//             if (authService.isAuthenticated()) {
//                 try {
//                     const userData = await authService.getCurrentUser();
//                     setCurrentUser(userData);
//                 } catch (err) {
//                     console.error("Erreur lors du chargement de l'utilisateur:", err);
//                     setError(err.message);
//                     // Si l'erreur est due à un token invalide, logout() est déjà appelé dans getCurrentUser
//                 }
//             }
//             setLoading(false);
//         };

//         loadUser();
//     }, []);

//     // Fonction de connexion
//     const login = async (email, password, rememberMe) => {
//         try {
//             setLoading(true);
//             await authService.login(email, password, rememberMe);
//             const userData = await authService.getCurrentUser();
//             setCurrentUser(userData);
//             return { success: true };
//         } catch (err) {
//             setError(err.message);
//             return { success: false, error: err.message };
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Fonction d'inscription
//     const register = async (userData) => {
//         try {
//             setLoading(true);
//             await authService.register(userData);
//             return { success: true };
//         } catch (err) {
//             setError(err.message);
//             return { success: false, error: err.message };
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Fonction de déconnexion
//     const logout = () => {
//         authService.logout();
//         setCurrentUser(null);
//     };

//     // Valeur du contexte à fournir
//     const value = {
//         currentUser,
//         loading,
//         error,
//         login,
//         register,
//         logout,
//         isAuthenticated: authService.isAuthenticated
//     };

//     return (
//         <AuthContext.Provider value={value}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

//*********************************************************************************************************** */

// // src/contexts/AuthContext.js
// import React, { createContext, useState, useEffect, useContext } from 'react';
// import { authService } from '../services/api';

// // Création du contexte d'authentification
// const AuthContext = createContext(null);

// // Hook personnalisé pour utiliser le contexte d'authentification
// export const useAuth = () => useContext(AuthContext);

// // Fournisseur du contexte d'authentification
// export const AuthProvider = ({ children }) => {
//     const [currentUser, setCurrentUser] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // Charger l'utilisateur au chargement de la page
//     useEffect(() => {
//         const loadUser = async () => {
//             if (authService.isAuthenticated()) {
//                 try {
//                     const userData = await authService.getCurrentUser();
//                     setCurrentUser(userData);
//                 } catch (err) {
//                     console.error("Erreur lors du chargement de l'utilisateur:", err);
//                     setError(err.message);
//                     // Si l'erreur est due à un token invalide, logout() est déjà appelé dans getCurrentUser
//                 }
//             }
//             setLoading(false);
//         };

//         loadUser();
//     }, []);

//     // Fonction de connexion
//     const login = async (email, password, rememberMe) => {
//         try {
//             setLoading(true);
//             await authService.login(email, password, rememberMe);
//             const userData = await authService.getCurrentUser();
//             setCurrentUser(userData);
//             return { success: true };
//         } catch (err) {
//             setError(err.message);
//             return { success: false, error: err.message };
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Fonction d'inscription
//     const register = async (userData) => {
//         try {
//             setLoading(true);
//             await authService.register(userData);
//             return { success: true };
//         } catch (err) {
//             setError(err.message);
//             return { success: false, error: err.message };
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Fonction de déconnexion
//     const logout = () => {
//         authService.logout();
//         setCurrentUser(null);
//     };

//     // Fonction pour vérifier si l'utilisateur est authentifié
//     const isAuthenticated = () => {
//         return authService.isAuthenticated() && currentUser !== null;
//     };

//     // Valeur du contexte à fournir
//     const value = {
//         currentUser,
//         loading,
//         error,
//         login,
//         register,
//         logout,
//         isAuthenticated
//     };

//     return (
//         <AuthContext.Provider value={value}>
//             {children}
//         </AuthContext.Provider>
//     );
// };



// *******************************************
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Création du contexte d'authentification
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Configuration de l'URL de base de l'API
const API_URL = 'http://127.0.0.1:8000';

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }) => {
    // États pour gérer l'authentification
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);

    // Vérification de l'authentification au chargement
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');

                // Si pas de token, l'utilisateur n'est pas connecté
                if (!token) {
                    setLoading(false);
                    setAuthChecked(true);
                    return;
                }

                // Configurer l'en-tête avec le token
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };

                // Récupérer les infos de l'utilisateur depuis l'API
                const response = await axios.get(`${API_URL}/auth/me`, config);

                if (response.data) {
                    // Mettre à jour l'état de l'utilisateur
                    setCurrentUser(response.data);
                }
            } catch (error) {
                console.error("Erreur lors de la vérification de l'authentification:", error);
                // En cas d'erreur, effacer le token (il peut être invalide)
                localStorage.removeItem('token');
                setCurrentUser(null);
            } finally {
                setLoading(false);
                setAuthChecked(true);
            }
        };

        checkAuth();
    }, []);

    // Fonction pour vérifier si l'utilisateur est authentifié
    const isAuthenticated = () => {
        // Vérifier d'abord si un token existe
        const token = localStorage.getItem('token');

        if (!token) {
            return false;
        }

        // Vérifier si le token est expiré
        try {
            // Décodage simplifié du JWT (partie payload)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));

            // Vérifier l'expiration du token
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                // Token expiré
                localStorage.removeItem('token');
                setCurrentUser(null);
                return false;
            }

            // Le token est valide et l'utilisateur est authentifié
            return true;
        } catch (error) {
            console.error("Erreur lors de la vérification du token:", error);
            // En cas d'erreur, on considère que l'utilisateur n'est pas authentifié
            localStorage.removeItem('token');
            setCurrentUser(null);
            return false;
        }
    };

    // Fonction de connexion
    const login = async (email, password) => {
        try {
            // Préparation des données pour l'API
            const formData = new FormData();
            formData.append('username', email); // L'API utilise 'username' même si c'est un email
            formData.append('password', password);

            // Requête de connexion
            const response = await axios.post(`${API_URL}/auth/login`, formData);

            // Stockage du token et des infos utilisateur
            localStorage.setItem('token', response.data.access_token);
            setCurrentUser(response.data.user);

            return { success: true, data: response.data };
        } catch (error) {
            console.error("Erreur lors de la connexion:", error);
            return {
                success: false,
                error: error.response?.data?.detail || "Une erreur est survenue lors de la connexion"
            };
        }
    };

    // Fonction d'inscription
    const register = async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, userData);
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Erreur lors de l'inscription:", error);
            return {
                success: false,
                error: error.response?.data?.detail || "Une erreur est survenue lors de l'inscription"
            };
        }
    };

    // Fonction de déconnexion
    const logout = () => {
        localStorage.removeItem('token');
        setCurrentUser(null);
    };

    // Valeurs à exposer dans le contexte
    const value = {
        currentUser,
        loading,
        authChecked,
        isAuthenticated,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};