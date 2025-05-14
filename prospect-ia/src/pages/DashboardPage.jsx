// import SidebarMenu from '../components/SidebarMenu'
// import { Routes, Route } from 'react-router-dom'
// import TabeaudeBord from './TabeaudeBord'
// import Campagnes from './Campagnes'
// import AddCampagnesPage from './AddCampagnesPage'


// function DashboardPage() {
//     return (
//         <div className="row">
//             <div className="col-2">
//                 <SidebarMenu />
//             </div>
//             <div className="col-10">
//                 {/* <Routes>
//                     <Route path="/" element={<TabeaudeBord />} />
//                     <Route path="/campagnes" element={<Campagnes />} />
//                     <Route path="/campagnes/add" element={<AddCampagnesPage />} />
//                 </Routes> */}
//                 <Routes>
//                     <Route path="/" element={<TabeaudeBord />} />
//                     <Route path="/campagnes" element={<Campagnes />} />
//                     <Route path="/campagnes/add" element={<AddCampagnesPage />} />
//                     {/* <Route path="/campagnes/edit/:id" element={<EditCampaign />} /> */}
//                     {/* Ajoutez également une route pour voir les détails d'une campagne si nécessaire */}
//                     {/* <Route path="/campagnes/view/:id" element={<ViewCampaign />} /> */}
//                 </Routes>
//             </div>
//         </div>
//     )
// }

// export default DashboardPage;


// import SidebarMenu from '../components/SidebarMenu'
// import { Routes, Route } from 'react-router-dom'
// import TabeaudeBord from './TabeaudeBord'
// import Campagnes from './Campagnes'
// import AddCampagnesPage from './AddCampagnesPage'
// import EditCampaign from './EditCampaign'
// import ViewCampaign from './ViewCampaign'

// function DashboardPage() {
//     return (
//         <div className="row">
//             <div className="col-2">
//                 <SidebarMenu />
//             </div>
//             <div className="col-10">
//                 <Routes>
//                     <Route path="/" element={<TabeaudeBord />} />
//                     <Route path="/campagnes" element={<Campagnes />} />
//                     <Route path="/campagnes/add" element={<AddCampagnesPage />} />
//                     <Route path="/campagnes/edit/:id" element={<EditCampaign />} />
//                     <Route path="/campagnes/view/:id" element={<ViewCampaign />} />
//                 </Routes>
//             </div>
//         </div>
//     )
// }

// export default DashboardPage;


// *********************************************************


import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import SidebarMenu from '../components/SidebarMenu';
import TabeaudeBord from './TabeaudeBord';
import Campagnes from './campagnes';
import AddCampagnesPage from './AddCampagnesPage';
import EditCampaign from './EditCampaign';
import ViewCampaign from './ViewCampaign';
import { useAuth } from '../contexts/AuthContext';

function DashboardPage() {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    // Vérifier l'authentification au chargement
    useEffect(() => {
        if (!loading && !isAuthenticated()) {
            navigate('/login', { state: { returnUrl: '/dashboard' } });
        }
    }, [isAuthenticated, loading, navigate]);

    // Afficher un indicateur de chargement pendant la vérification de l'authentification
    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Chargement du tableau de bord...</p>
                </div>
            </Container>
        );
    }

    // Ne pas rendre le dashboard si non authentifié
    if (!isAuthenticated()) {
        return null;
    }

    return (
        <Container fluid className="p-0">
            <Row className="g-0">
                <Col md={2} className="sidebar-wrapper">
                    <SidebarMenu />
                </Col>
                <Col md={10} className="dashboard-content bg-light">
                    <div className="p-4">
                        <Routes>
                            <Route path="/" element={<TabeaudeBord />} />
                            <Route path="/campagnes" element={<Campagnes />} />
                            <Route path="/campagnes/add" element={<AddCampagnesPage />} />
                            <Route path="/campagnes/edit/:id" element={<EditCampaign />} />
                            <Route path="/campagnes/view/:id" element={<ViewCampaign />} />

                            {/* Route pour le profil utilisateur */}
                            <Route path="/profile" element={<div>Page de profil - À implémenter</div>} />
                            {/* Route pour l'aide */}
                            <Route path="/help" element={<div>Page d'aide - À implémenter</div>} />
                        </Routes>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default DashboardPage;


//<Routes>
// <Route path="/" element={<TabeaudeBord />} />
// <Route path="/campagnes" element={<Campagnes />} />
// <Route path="/campagnes/add" element={<AddCampagnesPage />} />
// <Route path="/campagnes/edit/:id" element={<EditCampaign />} />
// <Route path="/campagnes/view/:id" element={<ViewCampaign />} />
// {/* Route pour le profil utilisateur */}
// <Route path="/profile" element={<div>Page de profil - À implémenter</div>} />
// {/* Route pour l'aide */}
// <Route path="/help" element={<div>Page d'aide - À implémenter</div>} />
// </Routes>
