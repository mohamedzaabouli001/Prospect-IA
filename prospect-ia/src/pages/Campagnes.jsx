// import { Link } from 'react-router-dom';
// function Campagnes() {
//     return (
//         <>
//             <div className="container mt-4">
//                 <h1 className="text-3xl font-bold text-gray-800">Mes campagnes</h1>
//                 <div className="d-flex justify-content-end mb-3">
//                     <Link to="/dashboard/campagnes/add" type="button" className="btn btn-primary d-flex align-items-center gap-2">
//                         <i className="bi bi-plus-circle"></i>
//                         Ajouter une campagne
//                     </Link>
//                 </div>
//                 <div className="table-responsive">
//                     <table className="table table-striped">
//                         <thead>
//                             <tr>
//                                 <th>ID</th>
//                                 <th>Campagne Name</th>
//                                 <th>Nom</th>
//                                 <th>Âge</th>
//                                 <th>Ville</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             <tr >
//                                 <td>1</td>
//                                 <td>ddd</td>
//                                 <td>fff</td>
//                                 <td>20</td>
//                                 <td>555</td>
//                             </tr>
//                         </tbody>
//                     </table>
//                 </div>
//             </div >
//         </>

//     )

// }

// export default Campagnes;

// ****************************************************************

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Table, Badge, Spinner, Modal, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Configuration de l'URL de base de l'API
const API_URL = 'http://127.0.0.1:8000';

function Campagnes() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('campaign_name');
    const [sortDirection, setSortDirection] = useState('asc');

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Fonction pour récupérer les campagnes
    const fetchCampaigns = async () => {
        setLoading(true);
        setError(null);

        try {
            // Vérification de l'authentification
            if (!isAuthenticated()) {
                setError("Vous devez être connecté pour voir vos campagnes");
                navigate('/login', { state: { returnUrl: '/dashboard/campagnes' } });
                return;
            }

            // Récupération du token
            const token = localStorage.getItem('token');

            if (!token) {
                setError("Session expirée. Veuillez vous reconnecter.");
                navigate('/login', { state: { returnUrl: '/dashboard/campagnes' } });
                return;
            }

            // Configuration de l'en-tête avec le token JWT
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            // Requête au backend
            const response = await axios.get(`${API_URL}/campaigns/`, config);
            setCampaigns(response.data);
        } catch (err) {
            console.error("Erreur lors de la récupération des campagnes:", err);

            if (err.response) {
                // Gestion des erreurs HTTP
                const status = err.response.status;

                if (status === 401) {
                    setError("Votre session a expiré. Veuillez vous reconnecter.");
                    setTimeout(() => navigate('/login', { state: { returnUrl: '/dashboard/campagnes' } }), 2000);
                } else {
                    setError(`Erreur ${status}: ${err.response.data.detail || 'Une erreur est survenue'}`);
                }
            } else if (err.request) {
                setError("Impossible de contacter le serveur. Veuillez vérifier votre connexion internet.");
            } else {
                setError(err.message || "Une erreur inattendue s'est produite");
            }
        } finally {
            setLoading(false);
        }
    };

    // Charger les campagnes au montage du composant
    useEffect(() => {
        fetchCampaigns();
    }, []);

    // Afficher le modal de confirmation de suppression
    const confirmDelete = (campaign) => {
        setCampaignToDelete(campaign);
        setShowDeleteModal(true);
    };

    // Fermer le modal de confirmation
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setCampaignToDelete(null);
    };

    // Fonction pour supprimer une campagne
    const deleteCampaign = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            await axios.delete(`${API_URL}/campaigns/${campaignToDelete.id}`, config);

            // Mettre à jour la liste des campagnes
            setCampaigns(campaigns.filter(campaign => campaign.id !== campaignToDelete.id));

            // Fermer le modal
            closeDeleteModal();
        } catch (err) {
            console.error("Erreur lors de la suppression:", err);
            setError("Erreur lors de la suppression de la campagne");
        }
    };

    // Fonction pour trier les campagnes
    const handleSort = (field) => {
        if (sortField === field) {
            // Inverser la direction si on clique sur le même champ
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Nouveau champ de tri
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Obtenir l'icône de tri appropriée
    const getSortIcon = (field) => {
        if (sortField !== field) return '';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    // Filtrer et trier les campagnes
    const filteredAndSortedCampaigns = campaigns
        .filter(campaign =>
            campaign.campaign_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (campaign.campaign_objective && campaign.campaign_objective.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (campaign.target_industry && campaign.target_industry.some(industry =>
                industry.toLowerCase().includes(searchTerm.toLowerCase())
            ))
        )
        .sort((a, b) => {
            // Gestion des champs potentiellement null ou undefined
            const aValue = a[sortField] !== undefined && a[sortField] !== null ? a[sortField] : '';
            const bValue = b[sortField] !== undefined && b[sortField] !== null ? b[sortField] : '';

            // Gestion des tableaux (comme target_industry)
            const aCompare = Array.isArray(aValue) ? aValue.join(', ') : aValue;
            const bCompare = Array.isArray(bValue) ? bValue.join(', ') : bValue;

            // Trier selon la direction
            if (sortDirection === 'asc') {
                return aCompare.toString().localeCompare(bCompare.toString());
            } else {
                return bCompare.toString().localeCompare(aCompare.toString());
            }
        });

    // Obtenir la classe appropriée pour le statut de la campagne
    const getCampaignStatusClass = (campaign) => {
        // Vérifier si la campagne est active (date de début dans le passé et date de fin dans le futur ou non définie)
        const now = new Date();
        const startDate = campaign.start_date ? new Date(campaign.start_date) : null;
        const endDate = campaign.end_date ? new Date(campaign.end_date) : null;

        if (startDate && startDate > now) {
            return 'warning'; // Programmée
        } else if (endDate && endDate < now) {
            return 'secondary'; // Terminée
        } else if (startDate && (!endDate || endDate > now)) {
            return 'success'; // Active
        } else {
            return 'info'; // Par défaut
        }
    };

    // Obtenir le libellé du statut
    const getCampaignStatusLabel = (campaign) => {
        const now = new Date();
        const startDate = campaign.start_date ? new Date(campaign.start_date) : null;
        const endDate = campaign.end_date ? new Date(campaign.end_date) : null;

        if (startDate && startDate > now) {
            return 'Programmée';
        } else if (endDate && endDate < now) {
            return 'Terminée';
        } else if (startDate && (!endDate || endDate > now)) {
            return 'Active';
        } else {
            return 'Brouillon';
        }
    };

    // Formater l'objectif de la campagne pour l'affichage
    const formatObjective = (objective) => {
        if (!objective) return '';

        const objectives = {
            'lead_generation': 'Génération de leads',
            'sales': 'Ventes directes',
            'meeting': 'Prise de rendez-vous',
            'event': 'Invitation à un événement',
            'awareness': 'Notoriété de marque'
        };

        return objectives[objective] || objective;
    };

    // Formater les industries cibles pour l'affichage
    const formatIndustries = (industries) => {
        if (!industries || !Array.isArray(industries)) return '';

        const industryNames = {
            'tech': 'Technologie',
            'finance': 'Finance',
            'healthcare': 'Santé',
            'education': 'Éducation',
            'retail': 'Commerce de détail',
            'manufacturing': 'Industrie',
            'realestate': 'Immobilier',
            'hospitality': 'Hôtellerie',
            'consulting': 'Conseil',
            'other': 'Autre'
        };

        return industries.map(industry => industryNames[industry] || industry).join(', ');
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="text-primary mb-0">Mes campagnes</h1>
                <Link
                    to="/dashboard/campagnes/add"
                    className="btn btn-primary d-flex align-items-center gap-2"
                >
                    <i className="bi bi-plus-circle"></i>
                    Créer une campagne
                </Link>
            </div>

            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="input-group" style={{ maxWidth: '300px' }}>
                            <span className="input-group-text bg-light border-end-0">
                                <i className="bi bi-search"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0 bg-light"
                                placeholder="Rechercher une campagne..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => fetchCampaigns()}
                            >
                                <i className="bi bi-arrow-clockwise"></i> Actualiser
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Chargement des campagnes...</p>
                        </div>
                    ) : filteredAndSortedCampaigns.length === 0 ? (
                        <div className="text-center py-5 bg-light rounded">
                            <i className="bi bi-folder2-open text-muted" style={{ fontSize: '3rem' }}></i>
                            <h5 className="mt-3">Aucune campagne trouvée</h5>
                            <p className="text-muted">
                                {searchTerm
                                    ? "Aucune campagne ne correspond à votre recherche"
                                    : "Vous n'avez pas encore créé de campagne de prospection"}
                            </p>
                            <Link to="/dashboard/campagnes/add" className="btn btn-primary mt-2">
                                Créer votre première campagne
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th
                                            onClick={() => handleSort('campaign_name')}
                                            style={{ cursor: 'pointer' }}
                                            className="user-select-none"
                                        >
                                            Nom {getSortIcon('campaign_name')}
                                        </th>
                                        <th
                                            onClick={() => handleSort('campaign_objective')}
                                            style={{ cursor: 'pointer' }}
                                            className="user-select-none"
                                        >
                                            Objectif {getSortIcon('campaign_objective')}
                                        </th>
                                        <th
                                            onClick={() => handleSort('target_industry')}
                                            style={{ cursor: 'pointer' }}
                                            className="user-select-none"
                                        >
                                            Industries cibles {getSortIcon('target_industry')}
                                        </th>
                                        <th
                                            onClick={() => handleSort('start_date')}
                                            style={{ cursor: 'pointer' }}
                                            className="user-select-none"
                                        >
                                            Date de début {getSortIcon('start_date')}
                                        </th>
                                        <th className="text-center">Statut</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAndSortedCampaigns.map(campaign => (
                                        <tr key={campaign.id}>
                                            <td className="fw-medium">
                                                {campaign.campaign_name}
                                            </td>
                                            <td>{formatObjective(campaign.campaign_objective)}</td>
                                            <td>{formatIndustries(campaign.target_industry)}</td>
                                            <td>
                                                {campaign.start_date
                                                    ? new Date(campaign.start_date).toLocaleDateString('fr-FR')
                                                    : 'Non définie'}
                                            </td>
                                            <td className="text-center">
                                                <Badge
                                                    bg={getCampaignStatusClass(campaign)}
                                                    pill
                                                >
                                                    {getCampaignStatusLabel(campaign)}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Link
                                                        to={`/dashboard/campagnes/view/${campaign.id}`}
                                                        className="btn btn-sm btn-outline-primary"
                                                        title="Voir les détails"
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </Link>
                                                    <Link
                                                        to={`/dashboard/campagnes/edit/${campaign.id}`}
                                                        className="btn btn-sm btn-outline-secondary"
                                                        title="Modifier"
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </Link>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        title="Supprimer"
                                                        onClick={() => confirmDelete(campaign)}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de confirmation de suppression */}
            <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Confirmer la suppression
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {campaignToDelete && (
                        <p>
                            Êtes-vous sûr de vouloir supprimer la campagne
                            <strong> "{campaignToDelete.campaign_name}"</strong> ?
                            <br />
                            <span className="text-danger">Cette action est irréversible.</span>
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={closeDeleteModal}>
                        Annuler
                    </Button>
                    <Button variant="danger" onClick={deleteCampaign}>
                        Supprimer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Campagnes;
