// src/pages/HomePage.jsx
import { Link } from 'react-router-dom';

function HomePage() {
    return (
        <div className="container">
            <div className="row min-vh-100 align-items-center py-5">
                <div className="col-lg-6">
                    <h1 className="display-4 fw-bold mb-4">Bienvenue sur notre plateforme</h1>
                    <p className="lead text-muted mb-4">
                        Une solution simple et efficace pour gérer vos informations en toute sécurité.
                        Accédez à votre espace personnel en quelques clics.
                    </p>
                    <div className="d-flex gap-3">
                        <Link to="/register" className="btn btn-primary btn-lg rounded-pill px-4">
                            Créer un compte
                        </Link>
                        <Link to="/login" className="btn btn-outline-primary btn-lg rounded-pill px-4">
                            Se connecter
                        </Link>
                    </div>
                </div>
                <div className="col-lg-6 d-flex justify-content-center mt-5 mt-lg-0">
                    <div className="position-relative">
                        <div className="bg-primary opacity-10 rounded-circle"
                            style={{ width: '450px', height: '450px', position: 'absolute', top: '-20px', left: '-20px' }}></div>
                        <div className="bg-light shadow-lg rounded-4 p-4" style={{ width: '400px', zIndex: '1', position: 'relative' }}>
                            <div className="text-center p-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-layers text-primary mb-3" viewBox="0 0 16 16">
                                    <path d="M8.235 1.559a.5.5 0 0 0-.47 0l-7.5 4a.5.5 0 0 0 0 .882L3.188 8 .765 9.559a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882L12.813 8l2.922-1.559a.5.5 0 0 0 0-.882l-7.5-4zm3.515 7.008L14.438 10 8 13.433 1.562 10 4.25 8.567l3.515 1.874a.5.5 0 0 0 .47 0l3.515-1.874zM8 9.433 1.562 6 8 2.567 14.438 6 8 9.433z" />
                                </svg>
                                <h3 className="h4 mb-3">Fonctionnalités principales</h3>
                                <ul className="list-unstyled text-start">
                                    <li className="d-flex align-items-center mb-3">
                                        <span className="bg-success bg-opacity-10 text-success p-2 rounded me-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16">
                                                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                            </svg>
                                        </span>
                                        Authentification sécurisée
                                    </li>
                                    <li className="d-flex align-items-center mb-3">
                                        <span className="bg-success bg-opacity-10 text-success p-2 rounded me-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16">
                                                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                            </svg>
                                        </span>
                                        Gestion de profil utilisateur
                                    </li>
                                    <li className="d-flex align-items-center mb-3">
                                        <span className="bg-success bg-opacity-10 text-success p-2 rounded me-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16">
                                                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                            </svg>
                                        </span>
                                        Interface moderne et responsive
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;