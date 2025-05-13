// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // Assurez-vous d'avoir installé react-router-dom

// function LoginPage() {
//     const navigate = useNavigate();
//     const [formData, setFormData] = useState({
//         email: '',
//         password: '',
//         rememberMe: false
//     });
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData(prevState => ({
//             ...prevState,
//             [name]: type === 'checkbox' ? checked : value
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setLoading(true);

//         try {
//             // Préparation des données au format attendu par l'API FastAPI
//             const formUrlEncoded = new URLSearchParams();
//             formUrlEncoded.append('username', formData.email); // FastAPI OAuth2 utilise 'username' même pour les emails
//             formUrlEncoded.append('password', formData.password);

//             // Appel à l'API pour la connexion
//             const response = await fetch('http://localhost:8000/auth/login', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                 },
//                 body: formUrlEncoded.toString(),
//             });

//             const data = await response.json();

//             if (!response.ok) {
//                 throw new Error(data.detail || 'Erreur lors de la connexion');
//             }

//             // Enregistrer le token dans le stockage local ou sessionStorage
//             if (formData.rememberMe) {
//                 localStorage.setItem('token', data.access_token);
//             } else {
//                 sessionStorage.setItem('token', data.access_token);
//             }

//             // Rediriger vers le tableau de bord ou la page d'accueil
//             navigate('/dashboard');
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="container py-5">
//             <div className="row justify-content-center">
//                 <div className="col-md-6 col-lg-5">
//                     <div className="card shadow-lg border-0">
//                         <div className="card-body p-5">
//                             <div className="text-center mb-4">
//                                 <h2 className="fw-bold">Connexion</h2>
//                                 <p className="text-muted">Heureux de vous revoir !</p>
//                             </div>

//                             {error && (
//                                 <div className="alert alert-danger" role="alert">
//                                     {error}
//                                 </div>
//                             )}

//                             <form onSubmit={handleSubmit}>
//                                 <div className="mb-3">
//                                     <label htmlFor="email" className="form-label">Adresse e-mail</label>
//                                     <input
//                                         type="email"
//                                         className="form-control"
//                                         id="email"
//                                         name="email"
//                                         value={formData.email}
//                                         onChange={handleChange}
//                                         required
//                                     />
//                                 </div>

//                                 <div className="mb-3">
//                                     <label htmlFor="password" className="form-label">Mot de passe</label>
//                                     <input
//                                         type="password"
//                                         className="form-control"
//                                         id="password"
//                                         name="password"
//                                         value={formData.password}
//                                         onChange={handleChange}
//                                         required
//                                     />
//                                 </div>

//                                 <div className="d-flex justify-content-between align-items-center mb-4">
//                                     <div className="form-check">
//                                         <input
//                                             type="checkbox"
//                                             className="form-check-input"
//                                             id="rememberMe"
//                                             name="rememberMe"
//                                             checked={formData.rememberMe}
//                                             onChange={handleChange}
//                                         />
//                                         <label className="form-check-label" htmlFor="rememberMe">
//                                             Se souvenir de moi
//                                         </label>
//                                     </div>
//                                     <a href="#" className="text-decoration-none small">Mot de passe oublié ?</a>
//                                 </div>

//                                 <button
//                                     type="submit"
//                                     className="btn btn-primary w-100 py-2 mb-3"
//                                     disabled={loading}
//                                 >
//                                     {loading ? 'Connexion...' : 'Se connecter'}
//                                 </button>
//                             </form>

//                             <div className="text-center">
//                                 <p className="mb-0">
//                                     Pas encore de compte ? <a href="/register" className="text-decoration-none">S'inscrire</a>
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default LoginPage;
//********************************************************************************* */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Assurez-vous que le chemin est correct

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth(); // Utiliser le hook useAuth pour accéder à la fonction login
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Utiliser la fonction login du contexte d'authentification
            const result = await login(formData.email, formData.password, formData.rememberMe);

            if (result.success) {
                console.log('Connexion réussie, redirection vers le tableau de bord');
                // Redirection explicite vers le tableau de bord
                navigate('/dashboard');
            } else {
                setError(result.error || 'Erreur lors de la connexion');
            }
        } catch (err) {
            console.error('Erreur de connexion:', err);
            setError(err.message || 'Une erreur inattendue s\'est produite');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-lg border-0">
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold">Connexion</h2>
                                <p className="text-muted">Heureux de vous revoir !</p>
                            </div>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Adresse e-mail</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Mot de passe</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="rememberMe"
                                            name="rememberMe"
                                            checked={formData.rememberMe}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="rememberMe">
                                            Se souvenir de moi
                                        </label>
                                    </div>
                                    <a href="#" className="text-decoration-none small">Mot de passe oublié ?</a>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 py-2 mb-3"
                                    disabled={loading}
                                >
                                    {loading ? 'Connexion...' : 'Se connecter'}
                                </button>
                            </form>

                            <div className="text-center">
                                <p className="mb-0">
                                    Pas encore de compte ? <a href="/register" className="text-decoration-none">S'inscrire</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;