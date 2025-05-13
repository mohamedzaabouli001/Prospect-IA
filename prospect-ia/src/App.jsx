// import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
// import { AuthProvider } from './contexts/AuthContext';
// import PrivateRoute from './components/PrivateRoute';
// import RegisterPage from './pages/auth/RegisterPage';
// import LoginPage from './pages/auth/LoginPage';
// import DashboardPage from './pages/DashboardPage';
// import HomePage from './pages/HomePage'; // Assurez-vous de créer ce fichier
// import Navbar from "./components/Navbar";

// function App() {
//   // Utiliser useLocation pour déterminer la route actuelle
//   const location = useLocation();

//   // Liste des routes où la navbar ne doit pas être affichée
//   const hideNavbarRoutes = ['/login', '/register', '/dashboard', '/dashboard/campagnes', '/dashboard/profile', '/dashboard/campagnes/view/:id'];

//   // Vérifier si la route actuelle est dans la liste des routes sans navbar
//   const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

//   return (
//     <AuthProvider>
//       {/* Afficher la navbar conditionnellement */}
//       {shouldShowNavbar && <Navbar />}

//       <Routes>
//         {/* Routes publiques */}
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/register" element={<RegisterPage />} />

//         {/* Page d'accueil */}
//         <Route path="/home" element={<HomePage />} />
//         <Route path="/" element={<Navigate to="/home" />} />

//         {/* Routes publiques supplémentaires */}
//         <Route path="/features" element={<div className="container mt-5"><h1>Features Page</h1></div>} />
//         <Route path="/pricing" element={<div className="container mt-5"><h1>Pricing Page</h1></div>} />
//         <Route path="/about" element={<div className="container mt-5"><h1>About Page</h1></div>} />

//         {/* Routes protégées */}
//         <Route
//           path="/dashboard/*"
//           element={
//             <PrivateRoute>
//               <DashboardPage />
//             </PrivateRoute>
//           }
//         />

//         {/* Route par défaut */}
//         <Route path="*" element={<Navigate to="/home" />} />
//       </Routes>
//     </AuthProvider>
//   );
// }

// export default App;


import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RegisterPage from './pages/auth/RegisterPage';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import Navbar from "./components/Navbar";

function App() {
  // Utiliser useLocation pour déterminer la route actuelle
  const location = useLocation();

  // Liste des routes où la navbar ne doit pas être affichée
  const hideNavbarRoutes = [
    '/login',
    '/register',
    '/dashboard'
  ];

  // Vérifier si la route actuelle est dans la liste des routes sans navbar
  // ou si elle commence par /dashboard/ (pour inclure toutes les routes du dashboard)
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname) &&
    !location.pathname.startsWith('/dashboard/');

  return (
    <AuthProvider>
      {/* Afficher la navbar conditionnellement */}
      {shouldShowNavbar && <Navbar />}

      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Page d'accueil */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/" element={<Navigate to="/home" />} />

        {/* Routes publiques supplémentaires */}
        <Route path="/features" element={<div className="container mt-5"><h1>Features Page</h1></div>} />
        <Route path="/pricing" element={<div className="container mt-5"><h1>Pricing Page</h1></div>} />
        <Route path="/about" element={<div className="container mt-5"><h1>About Page</h1></div>} />

        {/* Routes protégées */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        {/* Route par défaut */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
