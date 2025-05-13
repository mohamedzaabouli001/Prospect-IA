// import { Link } from 'react-router-dom';

// function SidebarMenu() {
//     return (
//         <>
//             <ul>
//                 <li>
//                     <Link to="/dashboard">Tableau de bord</Link>
//                 </li>
//                 <li>
//                     <Link to="/dashboard/campagnes">Campagnes</Link>
//                 </li>
//             </ul>
//         </>
//     )
// }

// export default SidebarMenu;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../style_files/SidebarMenu.css'; // Créez ce fichier CSS pour les styles spécifiques

function SidebarMenu() {
    const location = useLocation();
    const { currentUser, isAuthenticated } = useAuth();

    // Vérifier l'authentification
    if (!isAuthenticated()) {
        return null; // Ne pas afficher la sidebar si non authentifié
    }

    // Déterminer si un lien est actif
    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    return (
        <div className="sidebar-container py-4">
            {/* Profil utilisateur */}
            {currentUser && (
                <div className="user-profile text-center mb-4">
                    <div className="avatar-placeholder mb-2">
                        {currentUser.first_name?.charAt(0)}{currentUser.last_name?.charAt(0)}
                    </div>
                    <div className="user-name">{currentUser.first_name} {currentUser.last_name}</div>
                    <div className="user-email small text-muted">{currentUser.email}</div>
                </div>
            )}

            {/* Navigation */}
            <div className="sidebar-menu">
                <ul className="nav flex-column">
                    <li className="nav-item">
                        <Link
                            to="/dashboard"
                            className={`nav-link ${isActive('/dashboard') && !isActive('/dashboard/campagnes') ? 'active' : ''}`}
                        >
                            <i className="bi bi-speedometer2 me-2"></i>
                            Tableau de bord
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link
                            to="/dashboard/campagnes"
                            className={`nav-link ${isActive('/dashboard/campagnes') ? 'active' : ''}`}
                        >
                            <i className="bi bi-megaphone me-2"></i>
                            Campagnes
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link
                            to="/dashboard/profile"
                            className={`nav-link ${isActive('/dashboard/profile') ? 'active' : ''}`}
                        >
                            <i className="bi bi-person me-2"></i>
                            Mon profil
                        </Link>
                    </li>
                </ul>
            </div>

            {/* Bas de la sidebar */}
            <div className="mt-auto sidebar-footer">
                <div className="help-section">
                    <Link to="/dashboard/help" className="nav-link text-muted">
                        <i className="bi bi-question-circle me-2"></i>
                        Aide
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default SidebarMenu;