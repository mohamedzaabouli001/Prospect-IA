
// Création d'un service d'API pour gérer toutes les interactions avec le backend

const API_URL = 'http://localhost:8000';

// Fonction pour récupérer le token d'authentification
const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Fonction pour vérifier si l'utilisateur est connecté
const isAuthenticated = () => {
    return getToken() !== null;
};

// Fonction de déconnexion
const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    window.location.href = '/login';
};

// Fonction pour enregistrer un nouvel utilisateur
const register = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: userData.email,
                password: userData.password,
                confirm_password: userData.confirmPassword,
                first_name: userData.firstName,
                last_name: userData.lastName
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Erreur lors de l\'inscription');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

// Fonction pour la connexion d'un utilisateur
const login = async (email, password, rememberMe = false) => {
    try {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Email ou mot de passe incorrect');
        }

        // Stocker le token selon le choix "Se souvenir de moi"
        if (rememberMe) {
            localStorage.setItem('token', data.access_token);
        } else {
            sessionStorage.setItem('token', data.access_token);
        }

        return data;
    } catch (error) {
        throw error;
    }
};

// Fonction pour récupérer les informations de l'utilisateur connecté
const getCurrentUser = async () => {
    try {
        const token = getToken();

        if (!token) {
            throw new Error('Utilisateur non connecté');
        }

        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                logout(); // Déconnexion si le token est invalide
            }
            throw new Error(data.detail || 'Erreur lors de la récupération des données utilisateur');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

// Export des fonctions du service
export const authService = {
    register,
    login,
    logout,
    getCurrentUser,
    isAuthenticated,
    getToken
};

