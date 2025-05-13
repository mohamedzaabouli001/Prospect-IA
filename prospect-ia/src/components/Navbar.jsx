import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Importez votre contexte d'authentification

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { currentUser, logout, isAuthenticated } = useAuth(); // Récupérer l'état d'authentification
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Fermer le dropdown quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fonction pour gérer la déconnexion
    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsDropdownOpen(false);
    };

    // Fonction pour obtenir les initiales de l'utilisateur
    const getUserInitials = () => {
        if (!currentUser) return "U";

        const firstName = currentUser.first_name || "";
        const lastName = currentUser.last_name || "";

        if (firstName && lastName) {
            return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
        } else if (firstName) {
            return firstName.charAt(0).toUpperCase();
        } else if (currentUser.email) {
            return currentUser.email.charAt(0).toUpperCase();
        }

        return "U";
    };

    return (
        <nav className="navbar navbar-expand-lg bg-gradient shadow-sm">
            <div className="container">
                {/* Brand */}
                <Link className="navbar-brand fw-bold text-primary" to="/">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-layers me-2" viewBox="0 0 16 16">
                        <path d="M8.235 1.559a.5.5 0 0 0-.47 0l-7.5 4a.5.5 0 0 0 0 .882L3.188 8 .765 9.559a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882L12.813 8l2.922-1.559a.5.5 0 0 0 0-.882l-7.5-4zm3.515 7.008L14.438 10 8 13.433 1.562 10 4.25 8.567l3.515 1.874a.5.5 0 0 0 .47 0l3.515-1.874zM8 9.433 1.562 6 8 2.567 14.438 6 8 9.433z" />
                    </svg>
                    <span>BrandName</span>
                </Link>

                {/* Mobile Toggle Button */}
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={toggleMenu}
                    aria-expanded={isOpen}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navbar Links */}
                <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
                    {/* Center Links */}
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 mx-auto">
                        <li className="nav-item">
                            <Link className="nav-link px-3 active" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link px-3" to="/features">Features</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link px-3" to="/pricing">Pricing</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link px-3" to="/about">About</Link>
                        </li>
                    </ul>

                    {/* Right Authentication Links - Conditionnels selon l'état d'authentification */}
                    <div className="d-flex align-items-center gap-3">
                        {isAuthenticated() ? (
                            // Utilisateur connecté - Avatar avec dropdown
                            <div className="position-relative" ref={dropdownRef}>
                                <button
                                    className="btn btn-primary rounded-circle p-0 d-flex justify-content-center align-items-center"
                                    style={{ width: '40px', height: '40px' }}
                                    onClick={toggleDropdown}
                                >
                                    <span>{getUserInitials()}</span>
                                </button>

                                {/* Menu déroulant */}
                                {isDropdownOpen && (
                                    <div className="position-absolute end-0 mt-2 py-2 bg-white rounded shadow" style={{ minWidth: '200px', zIndex: 1000 }}>
                                        <div className="px-4 py-2 border-bottom">
                                            <p className="mb-0 fw-bold">{currentUser?.first_name} {currentUser?.last_name}</p>
                                            <small className="text-muted">{currentUser?.email}</small>
                                        </div>
                                        <Link to="/dashboard" className="dropdown-item py-2 px-4 d-flex align-items-center" onClick={() => setIsDropdownOpen(false)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-speedometer2 me-2" viewBox="0 0 16 16">
                                                <path d="M8 4a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4zM3.732 5.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707zM2 10a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 10zm9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5zm.754-4.246a.389.389 0 0 0-.527-.02L7.547 9.31a.91.91 0 1 0 1.302 1.258l3.434-4.297a.389.389 0 0 0-.029-.518z" />
                                                <path fill-rule="evenodd" d="M0 10a8 8 0 1 1 15.547 2.661c-.442 1.253-1.845 1.602-2.932 1.25C11.309 13.488 9.475 13 8 13c-1.474 0-3.31.488-4.615.911-1.087.352-2.49.003-2.932-1.25A7.988 7.988 0 0 1 0 10zm8-7a7 7 0 0 0-6.603 9.329c.203.575.923.876 1.68.63C4.397 12.533 6.358 12 8 12s3.604.532 4.923.96c.757.245 1.477-.056 1.68-.631A7 7 0 0 0 8 3z" />
                                            </svg>
                                            Tableau de bord
                                        </Link>
                                        <div className="dropdown-divider"></div>
                                        <button
                                            className="dropdown-item py-2 px-4 d-flex align-items-center text-danger"
                                            onClick={handleLogout}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right me-2" viewBox="0 0 16 16">
                                                <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z" />
                                                <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" />
                                            </svg>
                                            Déconnexion
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Utilisateur non connecté - Boutons Login/Register
                            <>
                                <Link className="btn btn-outline-primary rounded-pill px-4" to="/login">
                                    Login
                                </Link>
                                <Link className="btn btn-primary rounded-pill px-4 d-none d-lg-block" to="/register">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

