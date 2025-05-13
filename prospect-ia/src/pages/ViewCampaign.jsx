import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Container, Row, Col, Button, Badge, Spinner, Alert, Table, Tab, Tabs } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Configuration de l'URL de base de l'API
const API_URL = 'http://127.0.0.1:8000';

const ViewCampaign = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // États
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Effet pour récupérer les données de la campagne
    useEffect(() => {
        const fetchCampaignData = async () => {
            try {
                // Vérification de l'authentification
                if (!isAuthenticated()) {
                    setError("Vous devez être connecté pour voir une campagne");
                    navigate('/login', { state: { returnUrl: `/dashboard/campagnes/view/${id}` } });
                    return;
                }

                // Récupération du token
                const token = localStorage.getItem('token');
                if (!token) {
                    setError("Session expirée. Veuillez vous reconnecter.");
                    navigate('/login', { state: { returnUrl: `/dashboard/campagnes/view/${id}` } });
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
                const response = await axios.get(`${API_URL}/campaigns/${id}`, config);
                setCampaign(response.data);

            } catch (err) {
                console.error("Erreur lors de la récupération des données de la campagne:", err);

                if (err.response) {
                    const status = err.response.status;

                    if (status === 404) {
                        setError("Campagne non trouvée");
                    } else if (status === 401) {
                        setError("Votre session a expiré. Veuillez vous reconnecter.");
                        setTimeout(() => navigate('/login', { state: { returnUrl: `/dashboard/campagnes/view/${id}` } }), 2000);
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

        fetchCampaignData();
    }, [id, isAuthenticated, navigate]);

    // Obtenir la classe appropriée pour le statut de la campagne
    const getCampaignStatusClass = (campaign) => {
        if (!campaign) return 'secondary';

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
        if (!campaign) return 'Inconnu';

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

    // Formater les tableaux pour l'affichage
    const formatArrayField = (array, dictionary = {}) => {
        if (!array || !Array.isArray(array) || array.length === 0) return 'Non spécifié';

        return array.map(item => dictionary[item] || item).join(', ');
    };

    // Dictionary pour les industries
    const industryDictionary = {
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

    // Dictionary pour les départements
    const departmentDictionary = {
        'Executive': 'Direction générale',
        'Marketing': 'Marketing',
        'Sales': 'Ventes',
        'IT': 'IT',
        'HR': 'RH',
        'Finance': 'Finance',
        'Operations': 'Opérations',
        'Legal': 'Juridique'
    };

    // Dictionary pour les messages styles
    const messageStyleDictionary = {
        'direct': 'Direct et concis',
        'storytelling': 'Narratif (storytelling)',
        'question': 'Basé sur des questions',
        'educational': 'Éducatif (partage d\'insights)',
        'personal': 'Personnel et conversationnel'
    };

    // Dictionary pour les tons de message
    const messageToneDictionary = {
        'professional': 'Professionnel et formel',
        'friendly': 'Amical et décontracté',
        'enthusiastic': 'Enthousiaste et énergique',
        'authoritative': 'Expert et affirmatif',
        'empathetic': 'Empathique et compréhensif'
    };

    // Dictionary pour les CTAs
    const ctaDictionary = {
        'meeting': 'Proposer un rendez-vous',
        'demo': 'Demander une démo',
        'trial': 'Essai gratuit',
        'download': 'Téléchargement (contenu gratuit)',
        'question': 'Poser une question ouverte',
        'event': 'Invitation à un événement'
    };

    // Dictionary pour les types d'offre
    const offerTypeDictionary = {
        'digital_product': 'Produit digital',
        'physical_product': 'Produit physique',
        'service': 'Service'
    };

    // Dictionary pour les sources de scraping
    const scrapingSourcesDictionary = {
        'linkedin': 'LinkedIn',
        'google_maps': 'Google Maps',
        'company_websites': 'Sites web d\'entreprises',
        'job_boards': 'Sites d\'emploi',
        'directories': 'Annuaires professionnels'
    };

    // Dictionary pour les méthodes de contact
    const contactMethodsDictionary = {
        'email': 'Email',
        'linkedin_message': 'Message LinkedIn',
        'linkedin_connection': 'Demande de connexion LinkedIn',
        'twitter_dm': 'Twitter DM'
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement des données de la campagne...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
                <div className="text-center mt-4">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/dashboard/campagnes')}
                    >
                        Retour à la liste des campagnes
                    </Button>
                </div>
            </Container>
        );
    }

    if (!campaign) {
        return (
            <Container className="py-5 text-center">
                <Alert variant="warning">Aucune donnée trouvée pour cette campagne.</Alert>
                <div className="mt-4">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/dashboard/campagnes')}
                    >
                        Retour à la liste des campagnes
                    </Button>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Détails de la campagne</h2>
                <div>
                    <Button
                        variant="outline-secondary"
                        onClick={() => navigate('/dashboard/campagnes')}
                        className="me-2"
                    >
                        <i className="bi bi-arrow-left me-1"></i>
                        Retour
                    </Button>
                    <Link
                        to={`/dashboard/campagnes/edit/${id}`}
                        className="btn btn-primary"
                    >
                        <i className="bi bi-pencil me-1"></i>
                        Modifier
                    </Link>
                </div>
            </div>

            {/* Header Card */}
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Row>
                        <Col md={8}>
                            <h3 className="mb-2">{campaign.campaign_name}</h3>
                            <p className="text-muted mb-2">
                                <i className="bi bi-bullseye me-2"></i>
                                {formatObjective(campaign.campaign_objective)}
                            </p>
                            <div className="d-flex align-items-center mt-3">
                                <Badge
                                    bg={getCampaignStatusClass(campaign)}
                                    className="me-3 py-2 px-3"
                                >
                                    {getCampaignStatusLabel(campaign)}
                                </Badge>
                                <span className="text-muted">
                                    <i className="bi bi-calendar3 me-1"></i>
                                    {campaign.start_date
                                        ? `Du ${new Date(campaign.start_date).toLocaleDateString('fr-FR')}`
                                        : 'Date de début non définie'}
                                    {campaign.end_date
                                        ? ` au ${new Date(campaign.end_date).toLocaleDateString('fr-FR')}`
                                        : ''}
                                </span>
                            </div>
                        </Col>
                        <Col md={4} className="text-md-end">
                            <div className="mt-3 mt-md-0">
                                <p className="mb-1">
                                    <span className="fw-bold me-2">Limite quotidienne:</span>
                                    {campaign.daily_limit} messages/jour
                                </p>
                                <p className="mb-1">
                                    <span className="fw-bold me-2">Relances:</span>
                                    {campaign.follow_up_sequence
                                        ? `${campaign.follow_up_number} (tous les ${campaign.follow_up_delay} jours)`
                                        : 'Désactivées'}
                                </p>
                                <p className="mb-0">
                                    <span className="fw-bold me-2">Mode test:</span>
                                    {campaign.test_mode ? 'Activé' : 'Désactivé'}
                                </p>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Tabs pour les détails */}
            <Tabs defaultActiveKey="target" className="mb-4">
                <Tab eventKey="target" title="Cible">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <h5 className="border-bottom pb-2 mb-3">Entreprises cibles</h5>
                                    <Table borderless size="sm">
                                        <tbody>
                                            <tr>
                                                <td className="fw-bold" width="40%">Type d'entreprise:</td>
                                                <td>{campaign.business_type || 'Non spécifié'}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Secteurs d'activité:</td>
                                                <td>{formatArrayField(campaign.target_industry, industryDictionary)}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Taille d'entreprise:</td>
                                                <td>{formatArrayField(campaign.target_company_size)}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Zones géographiques:</td>
                                                <td>{campaign.target_geography || 'Non spécifié'}</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </Col>
                                <Col md={6}>
                                    <h5 className="border-bottom pb-2 mb-3">Persona</h5>
                                    <Table borderless size="sm">
                                        <tbody>
                                            <tr>
                                                <td className="fw-bold" width="40%">Postes ciblés:</td>
                                                <td>{campaign.target_job || 'Non spécifié'}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Niveau hiérarchique:</td>
                                                <td>{formatArrayField(campaign.target_seniority)}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Départements:</td>
                                                <td>{formatArrayField(campaign.target_department, departmentDictionary)}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Rôle décisionnel:</td>
                                                <td>
                                                    {campaign.decision_maker === 'decision_maker' ? 'Décisionnaire final' :
                                                        campaign.decision_maker === 'influencer' ? 'Influenceur' :
                                                            campaign.decision_maker === 'both' ? 'Décisionnaire et influenceur' :
                                                                'Non spécifié'}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>

                            <Row className="mt-4">
                                <Col md={12}>
                                    <h5 className="border-bottom pb-2 mb-3">Éléments de personnalisation</h5>
                                    <Table borderless>
                                        <tbody>
                                            <tr>
                                                <td className="fw-bold" width="20%">Points de douleur:</td>
                                                <td>{campaign.persona_pain_points || 'Non spécifié'}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Motivations:</td>
                                                <td>{campaign.persona_motivations || 'Non spécifié'}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Objections potentielles:</td>
                                                <td>{campaign.persona_objections || 'Non spécifié'}</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="offer" title="Offre">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h5 className="border-bottom pb-2 mb-3">Informations sur l'offre</h5>
                            <Row>
                                <Col md={6}>
                                    <Table borderless size="sm">
                                        <tbody>
                                            <tr>
                                                <td className="fw-bold" width="40%">Type d'offre:</td>
                                                <td>{offerTypeDictionary[campaign.offer_type] || campaign.offer_type || 'Non spécifié'}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Catégorie:</td>
                                                <td>{campaign.product_category || 'Non spécifié'}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Nom du produit/service:</td>
                                                <td>{campaign.product_name || 'Non spécifié'}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Gamme de prix:</td>
                                                <td>
                                                    {campaign.product_pricing === 'free' ? 'Gratuit / Freemium' :
                                                        campaign.product_pricing === 'low' ? 'Entrée de gamme (< 100€/mois)' :
                                                            campaign.product_pricing === 'medium' ? 'Milieu de gamme (100€-500€/mois)' :
                                                                campaign.product_pricing === 'high' ? 'Haut de gamme (500€-2000€/mois)' :
                                                                    campaign.product_pricing === 'enterprise' ? 'Enterprise (> 2000€/mois)' :
                                                                        campaign.product_pricing === 'quote' ? 'Sur devis uniquement' :
                                                                            'Non spécifié'}
                                                </td>
                                            </tr>
                                            {campaign.product_url && (
                                                <tr>
                                                    <td className="fw-bold">URL:</td>
                                                    <td>
                                                        <a href={campaign.product_url} target="_blank" rel="noopener noreferrer">
                                                            {campaign.product_url}
                                                        </a>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </Col>
                                <Col md={6}>
                                    <Table borderless size="sm">
                                        <tbody>
                                            <tr>
                                                <td className="fw-bold" width="40%">Description:</td>
                                                <td>{campaign.product_description || 'Non spécifié'}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Bénéfices:</td>
                                                <td>{campaign.product_benefits || 'Non spécifié'}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Proposition unique (USP):</td>
                                                <td>{campaign.product_usp || 'Non spécifié'}</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="message" title="Message">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h5 className="border-bottom pb-2 mb-3">Paramètres du message</h5>
                            <Row>
                                <Col md={6}>
                                    <Table borderless size="sm">
                                        <tbody>
                                            <tr>
                                                <td className="fw-bold" width="40%">Style de message:</td>
                                                <td>{messageStyleDictionary[campaign.message_style] || campaign.message_style || 'Non spécifié'}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Ton du message:</td>
                                                <td>{messageToneDictionary[campaign.message_tone] || campaign.message_tone || 'Non spécifié'}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Call-to-Action:</td>
                                                <td>{ctaDictionary[campaign.call_to_action] || campaign.call_to_action || 'Non spécifié'}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Facteur d'urgence:</td>
                                                <td>{campaign.urgency_factor || 'Non spécifié'}</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </Col>
                                <Col md={6}>
                                    <Table borderless size="sm">
                                        <tbody>
                                            <tr>
                                                <td className="fw-bold" width="40%">Preuves sociales:</td>
                                                <td>{campaign.social_proof || 'Non spécifié'}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Témoignages clients:</td>
                                                <td>{campaign.success_stories || 'Non spécifié'}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Présentation entreprise:</td>
                                                <td>{campaign.company_background || 'Non spécifié'}</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="sources" title="Sources">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h5 className="border-bottom pb-2 mb-3">Sources et canaux</h5>
                            <Row>
                                <Col md={6}>
                                    <h6>Sources pour le scraping</h6>
                                    <div className="mb-4">
                                        {campaign.scraping_sources && campaign.scraping_sources.length > 0 ? (
                                            campaign.scraping_sources.map((source, index) => (
                                                <Badge
                                                    key={index}
                                                    bg="light"
                                                    text="dark"
                                                    className="me-2 mb-2 py-2 px-3"
                                                >
                                                    {scrapingSourcesDictionary[source] || source}
                                                </Badge>
                                            ))
                                        ) : (
                                            <p className="text-muted">Aucune source spécifiée</p>
                                        )}
                                    </div>

                                    {campaign.linkedin_url && (
                                        <div className="mb-3">
                                            <p className="fw-bold mb-1">URL LinkedIn:</p>
                                            <a href={campaign.linkedin_url} target="_blank" rel="noopener noreferrer">
                                                {campaign.linkedin_url}
                                            </a>
                                        </div>
                                    )}

                                    {campaign.google_maps_location && (
                                        <div className="mb-3">
                                            <p className="fw-bold mb-1">Recherche Google Maps:</p>
                                            <p>{campaign.google_maps_location}</p>
                                        </div>
                                    )}

                                    {campaign.other_source_url && (
                                        <div className="mb-3">
                                            <p className="fw-bold mb-1">Autre source:</p>
                                            <a href={campaign.other_source_url} target="_blank" rel="noopener noreferrer">
                                                {campaign.other_source_url}
                                            </a>
                                        </div>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <h6>Méthodes de contact</h6>
                                    <div>
                                        {campaign.contact_methods && campaign.contact_methods.length > 0 ? (
                                            campaign.contact_methods.map((method, index) => (
                                                <Badge
                                                    key={index}
                                                    bg="info"
                                                    className="me-2 mb-2 py-2 px-3"
                                                >
                                                    {contactMethodsDictionary[method] || method}
                                                </Badge>
                                            ))
                                        ) : (
                                            <p className="text-muted">Aucune méthode spécifiée</p>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="settings" title="Paramètres">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h5 className="border-bottom pb-2 mb-3">Paramètres de la campagne</h5>
                            <Row>
                                <Col md={6}>
                                    <h6>Configuration principale</h6>
                                    <Table borderless size="sm">
                                        <tbody>
                                            <tr>
                                                <td className="fw-bold" width="40%">Date de début:</td>
                                                <td>
                                                    {campaign.start_date
                                                        ? new Date(campaign.start_date).toLocaleDateString('fr-FR')
                                                        : 'Non définie'}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Date de fin:</td>
                                                <td>
                                                    {campaign.end_date
                                                        ? new Date(campaign.end_date).toLocaleDateString('fr-FR')
                                                        : 'Non définie'}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Limite quotidienne:</td>
                                                <td>{campaign.daily_limit} messages/jour</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Mode test:</td>
                                                <td>{campaign.test_mode ? 'Activé' : 'Désactivé'}</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </Col>
                                <Col md={6}>
                                    <h6>Configuration des relances</h6>
                                    <Table borderless size="sm">
                                        <tbody>
                                            <tr>
                                                <td className="fw-bold" width="40%">Relances automatiques:</td>
                                                <td>{campaign.follow_up_sequence ? 'Activées' : 'Désactivées'}</td>
                                            </tr>
                                            {campaign.follow_up_sequence && (
                                                <>
                                                    <tr>
                                                        <td className="fw-bold">Nombre de relances:</td>
                                                        <td>{campaign.follow_up_number}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="fw-bold">Délai entre relances:</td>
                                                        <td>{campaign.follow_up_delay} jours</td>
                                                    </tr>
                                                </>
                                            )}
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>

                            <div className="mt-4">
                                <h6>Options avancées</h6>
                                <Table borderless size="sm">
                                    <tbody>
                                        <tr>
                                            <td className="fw-bold" width="20%">Priorité de campagne:</td>
                                            <td>
                                                {campaign.campaign_priority === 'high' ? 'Élevée' :
                                                    campaign.campaign_priority === 'low' ? 'Faible' :
                                                        'Normale'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="fw-bold">Notifications:</td>
                                            <td>
                                                {campaign.notification_settings === 'none' ? 'Aucune' :
                                                    campaign.notification_settings === 'daily' ? 'Quotidiennes' :
                                                        campaign.notification_settings === 'weekly' ? 'Hebdomadaires' :
                                                            campaign.notification_settings === 'important' ? 'Uniquement les événements importants' :
                                                                'Non spécifié'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="fw-bold">Ajustement automatique:</td>
                                            <td>{campaign.auto_adjust ? 'Activé' : 'Désactivé'}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>

            <div className="d-flex justify-content-between mt-4">
                <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/dashboard/campagnes')}
                >
                    <i className="bi bi-arrow-left me-2"></i>
                    Retour à la liste
                </Button>
                <div>
                    <Link
                        to={`/dashboard/campagnes/edit/${id}`}
                        className="btn btn-primary me-2"
                    >
                        <i className="bi bi-pencil me-1"></i>
                        Modifier
                    </Link>
                    <Button
                        variant="success"
                        disabled={campaign.start_date && new Date(campaign.start_date) < new Date()}
                        title={campaign.start_date && new Date(campaign.start_date) < new Date() ? "La campagne a déjà démarré" : ""}
                    >
                        <i className="bi bi-play-fill me-1"></i>
                        {campaign.start_date && new Date(campaign.start_date) < new Date() ? "Campagne en cours" : "Lancer la campagne"}
                    </Button>
                </div>
            </div>
            <div>
                <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/dashboard/campagnes')}
                    className="me-2"
                >
                    <i className="bi bi-arrow-left me-1"></i>
                    Retour
                </Button>
                <Link
                    to={`/dashboard/campagnes/edit/${id}`}
                    className="btn btn-primary me-2"
                >
                    <i className="bi bi-pencil me-1"></i>
                    Modifier
                </Link>
                <Link
                    to={`/dashboard/campagnes/results/${id}`}
                    className="btn btn-info text-white"
                >
                    <i className="bi bi-graph-up me-1"></i>
                    Voir les résultats
                </Link>
            </div>
        </Container>
    );
};

export default ViewCampaign;