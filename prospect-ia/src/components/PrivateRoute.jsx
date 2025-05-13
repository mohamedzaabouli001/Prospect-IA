// src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Ce composant redirige vers la page de connexion si l'utilisateur n'est pas authentifié
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    // Afficher un spinner de chargement pendant la vérification de l'authentification
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
    if (!isAuthenticated()) {
        return <Navigate to="/login" />;
    }

    // Afficher le contenu protégé si l'utilisateur est authentifié
    return children;
};

export default PrivateRoute;