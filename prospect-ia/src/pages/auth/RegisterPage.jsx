// import { useState } from 'react';
// // Remarque: Assurez-vous d'avoir installé Bootstrap et importé les CSS dans votre fichier principal
// // npm install bootstrap
// // Dans votre index.js ou App.js: import 'bootstrap/dist/css/bootstrap.min.css';

// function RegisterPage() {
//     const [formData, setFormData] = useState({
//         firstName: '',
//         lastName: '',
//         email: '',
//         password: '',
//         confirmPassword: ''
//     });

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prevState => ({
//             ...prevState,
//             [name]: value
//         }));
//     };

//     const handleSubmit = (e) => {
//         if (e) e.preventDefault();
//         console.log('Form submitted:', formData);
//         // Ici vous ajouteriez la logique pour envoyer les données au serveur
//     };

//     return (
//         <div className="container py-5">
//             <div className="row justify-content-center">
//                 <div className="col-md-8 col-lg-6">
//                     <div className="card shadow-lg border-0">
//                         <div className="card-body p-5">
//                             <div className="text-center mb-4">
//                                 <h2 className="fw-bold">Créer un compte</h2>
//                                 <p className="text-muted">Rejoignez-nous et commencez votre expérience</p>
//                             </div>

//                             <div className="mb-4 row">
//                                 <div className="col-md-6 mb-3 mb-md-0">
//                                     <label htmlFor="firstName" className="form-label">Prénom</label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         id="firstName"
//                                         name="firstName"
//                                         value={formData.firstName}
//                                         onChange={handleChange}
//                                         required
//                                     />
//                                 </div>
//                                 <div className="col-md-6">
//                                     <label htmlFor="lastName" className="form-label">Nom</label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         id="lastName"
//                                         name="lastName"
//                                         value={formData.lastName}
//                                         onChange={handleChange}
//                                         required
//                                     />
//                                 </div>
//                             </div>

//                             <div className="mb-3">
//                                 <label htmlFor="email" className="form-label">Adresse e-mail</label>
//                                 <input
//                                     type="email"
//                                     className="form-control"
//                                     id="email"
//                                     name="email"
//                                     value={formData.email}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </div>

//                             <div className="mb-3">
//                                 <label htmlFor="password" className="form-label">Mot de passe</label>
//                                 <input
//                                     type="password"
//                                     className="form-control"
//                                     id="password"
//                                     name="password"
//                                     value={formData.password}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </div>

//                             <div className="mb-4">
//                                 <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
//                                 <input
//                                     type="password"
//                                     className="form-control"
//                                     id="confirmPassword"
//                                     name="confirmPassword"
//                                     value={formData.confirmPassword}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </div>

//                             <div className="mb-4 form-check">
//                                 <input type="checkbox" className="form-check-input" id="terms" />
//                                 <label className="form-check-label" htmlFor="terms">
//                                     J'accepte les <a href="#" className="text-decoration-none">conditions d'utilisation</a> et la <a href="#" className="text-decoration-none">politique de confidentialité</a>
//                                 </label>
//                             </div>

//                             <button
//                                 type="button"
//                                 className="btn btn-primary w-100 py-2"
//                                 onClick={handleSubmit}
//                             >
//                                 S'inscrire
//                             </button>

//                             <div className="text-center mt-4">
//                                 <p className="mb-0">
//                                     Déjà membre? <a href="#" className="text-decoration-none">Se connecter</a>
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default RegisterPage;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Vérifier si les mots de passe correspondent
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            setLoading(false);
            return;
        }

        try {
            // Préparation des données pour l'API
            const userData = {
                email: formData.email,
                password: formData.password,
                confirm_password: formData.confirmPassword,
                first_name: formData.firstName,
                last_name: formData.lastName
            };

            // Appel à l'API pour l'inscription
            const response = await fetch('http://localhost:8000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Erreur lors de l\'inscription');
            }

            // Si l'inscription réussit, rediriger vers la page de connexion
            navigate('/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-lg border-0">
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold">Créer un compte</h2>
                                <p className="text-muted">Rejoignez-nous et commencez votre expérience</p>
                            </div>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4 row">
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <label htmlFor="firstName" className="form-label">Prénom</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="lastName" className="form-label">Nom</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

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

                                <div className="mb-4">
                                    <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-4 form-check">
                                    <input type="checkbox" className="form-check-input" id="terms" required />
                                    <label className="form-check-label" htmlFor="terms">
                                        J'accepte les <a href="#" className="text-decoration-none">conditions d'utilisation</a> et la <a href="#" className="text-decoration-none">politique de confidentialité</a>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 py-2"
                                    disabled={loading}
                                >
                                    {loading ? 'Inscription...' : 'S\'inscrire'}
                                </button>
                            </form>

                            <div className="text-center mt-4">
                                <p className="mb-0">
                                    Déjà membre? <a href="/login" className="text-decoration-none">Se connecter</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;