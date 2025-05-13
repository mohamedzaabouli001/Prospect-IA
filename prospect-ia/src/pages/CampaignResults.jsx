import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Container, Row, Col, Table, Spinner, Alert, ProgressBar, Badge, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

// Enregistrer les composants Chart.js nécessaires
Chart.register(...registerables);

// Configuration de l'URL de base de l'API
const API_URL = 'http://127.0.0.1:8000';

const CampaignResults = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // États
    const [campaign, setCampaign] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('week'); // 'day', 'week', 'month', 'all'

    // Effet pour récupérer les données de la campagne et ses résultats
    useEffect(() => {
        const fetchCampaignData = async () => {
            try {
                // Vérification de l'authentification
                if (!isAuthenticated()) {
                    setError("Vous devez être connecté pour voir les résultats de la campagne");
                    navigate('/login', { state: { returnUrl: `/dashboard/campagnes/results/${id}` } });
                    return;
                }

                // Récupération du token
                const token = localStorage.getItem('token');
                if (!token) {
                    setError("Session expirée. Veuillez vous reconnecter.");
                    navigate('/login', { state: { returnUrl: `/dashboard/campagnes/results/${id}` } });
                    return;
                }

                // Configuration de l'en-tête avec le token JWT
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                };

                // Requête pour obtenir les détails de la campagne
                const campaignResponse = await axios.get(`${API_URL}/campaigns/${id}`, config);
                setCampaign(campaignResponse.data);

                // Requête pour obtenir les résultats de la campagne
                // Note: Vous devrez implémenter cet endpoint dans votre API
                const resultsResponse = await axios.get(`${API_URL}/campaigns/${id}/results`, config);
                setResults(resultsResponse.data);

            } catch (err) {
                console.error("Erreur lors de la récupération des données:", err);

                if (err.response) {
                    const status = err.response.status;

                    if (status === 404) {
                        setError("Campagne ou résultats non trouvés");
                    } else if (status === 401) {
                        setError("Votre session a expiré. Veuillez vous reconnecter.");
                        setTimeout(() => navigate('/login', { state: { returnUrl: `/dashboard/campagnes/results/${id}` } }), 2000);
                    } else {
                        setError(`Erreur ${status}: ${err.response.data.detail || 'Une erreur est survenue'}`);
                    }
                } else if (err.request) {
                    setError("Impossible de contacter le serveur. Veuillez vérifier votre connexion internet.");
                } else {
                    setError(err.message || "Une erreur inattendue s'est produite");
                }

                // Données de test en cas d'erreur (à retirer en production)
                setResults(generateMockResults());
            } finally {
                setLoading(false);
            }
        };

        fetchCampaignData();
    }, [id, isAuthenticated, navigate]);

    // Changer la plage de dates pour les graphiques
    const handleDateRangeChange = (range) => {
        setDateRange(range);
    };

    // Fonction pour générer des données de test (à supprimer en production)
    const generateMockResults = () => {
        const today = new Date();
        const dates = [];
        const messagesData = [];
        const responsesData = [];
        const conversionData = [];

        // Générer des données pour les 30 derniers jours
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            dates.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));

            // Générer des valeurs aléatoires pour les métriques
            const messages = Math.floor(Math.random() * 30) + 10;
            messagesData.push(messages);

            const responses = Math.floor(Math.random() * messages * 0.6);
            responsesData.push(responses);

            const conversions = Math.floor(Math.random() * responses * 0.4);
            conversionData.push(conversions);
        }

        return {
            summary: {
                totalMessages: messagesData.reduce((a, b) => a + b, 0),
                totalResponses: responsesData.reduce((a, b) => a + b, 0),
                totalConversions: conversionData.reduce((a, b) => a + b, 0),
                responseRate: (responsesData.reduce((a, b) => a + b, 0) / messagesData.reduce((a, b) => a + b, 0) * 100).toFixed(2),
                conversionRate: (conversionData.reduce((a, b) => a + b, 0) / responsesData.reduce((a, b) => a + b, 0) * 100).toFixed(2),
            },
            charts: {
                dates,
                messagesData,
                responsesData,
                conversionData
            },
            prospects: [
                { id: 1, name: "Jean Dupont", position: "Directeur Marketing", company: "Acme Inc.", status: "converted", revenue: 5000, date: "12/05/2025" },
                { id: 2, name: "Marie Martin", position: "VP Ventes", company: "Tech Solutions", status: "responded", revenue: 0, date: "10/05/2025" },
                { id: 3, name: "Pierre Leroy", position: "CEO", company: "Startup SAS", status: "responded", revenue: 0, date: "09/05/2025" },
                { id: 4, name: "Sophie Bernard", position: "Directrice RH", company: "Groupe ABC", status: "converted", revenue: 3500, date: "07/05/2025" },
                { id: 5, name: "Lucas Petit", position: "CTO", company: "Digital Factory", status: "sent", revenue: 0, date: "05/05/2025" },
            ]
        };
    };

    // Filtrer les données en fonction de la plage de dates
    const getFilteredData = () => {
        if (!results) return null;

        const { dates, messagesData, responsesData, conversionData } = results.charts;

        let filteredDates = [];
        let filteredMessages = [];
        let filteredResponses = [];
        let filteredConversions = [];

        switch (dateRange) {
            case 'day':
                // Dernier jour
                filteredDates = dates.slice(-1);
                filteredMessages = messagesData.slice(-1);
                filteredResponses = responsesData.slice(-1);
                filteredConversions = conversionData.slice(-1);
                break;
            case 'week':
                // Dernière semaine
                filteredDates = dates.slice(-7);
                filteredMessages = messagesData.slice(-7);
                filteredResponses = responsesData.slice(-7);
                filteredConversions = conversionData.slice(-7);
                break;
            case 'month':
                // Dernier mois
                filteredDates = dates.slice(-30);
                filteredMessages = messagesData.slice(-30);
                filteredResponses = responsesData.slice(-30);
                filteredConversions = conversionData.slice(-30);
                break;
            default:
                // Toutes les données
                filteredDates = dates;
                filteredMessages = messagesData;
                filteredResponses = responsesData;
                filteredConversions = conversionData;
        }

        return {
            dates: filteredDates,
            messagesData: filteredMessages,
            responsesData: filteredResponses,
            conversionData: filteredConversions
        };
    };

    // Obtenir la classe de badge pour le statut
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'sent': return 'secondary';
            case 'responded': return 'info';
            case 'converted': return 'success';
            case 'bounced': return 'danger';
            default: return 'light';
        }
    };

    // Formater le statut pour l'affichage
    const formatStatus = (status) => {
        switch (status) {
            case 'sent': return 'Envoyé';
            case 'responded': return 'A répondu';
            case 'converted': return 'Converti';
            case 'bounced': return 'Rejeté';
            default: return status;
        }
    };

    // Données pour le graphique de messages et réponses
    const getMessagesChart = () => {
        const filteredData = getFilteredData();
        if (!filteredData) return null;

        return {
            labels: filteredData.dates,
            datasets: [
                {
                    label: 'Messages envoyés',
                    data: filteredData.messagesData,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Réponses reçues',
                    data: filteredData.responsesData,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                }
            ]
        };
    };

    // Données pour le graphique de conversions
    const getConversionsChart = () => {
        const filteredData = getFilteredData();
        if (!filteredData) return null;

        return {
            labels: filteredData.dates,
            datasets: [
                {
                    label: 'Conversions',
                    data: filteredData.conversionData,
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1,
                }
            ]
        };
    };

    // Données pour le graphique de taux de réponse
    const getResponseRateChart = () => {
        const filteredData = getFilteredData();
        if (!filteredData) return null;

        // Calculer le taux de réponse quotidien
        const responseRates = filteredData.messagesData.map((messages, index) => {
            return messages > 0 ? (filteredData.responsesData[index] / messages * 100) : 0;
        });

        return {
            labels: filteredData.dates,
            datasets: [
                {
                    label: 'Taux de réponse (%)',
                    data: responseRates,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1,
                }
            ]
        };
    };

    // Données pour le graphique circulaire de répartition
    const getStatusPieChart = () => {
        if (!results) return null;

        // Calculer le nombre de prospects par statut
        const statusCounts = {
            sent: 0,
            responded: 0,
            converted: 0,
            bounced: 0
        };

        results.prospects.forEach(prospect => {
            if (statusCounts[prospect.status] !== undefined) {
                statusCounts[prospect.status]++;
            }
        });

        return {
            labels: ['Envoyés', 'Réponses', 'Convertis', 'Rejetés'],
            datasets: [
                {
                    data: [
                        statusCounts.sent,
                        statusCounts.responded,
                        statusCounts.converted,
                        statusCounts.bounced
                    ],
                    backgroundColor: [
                        'rgba(108, 117, 125, 0.6)',
                        'rgba(23, 162, 184, 0.6)',
                        'rgba(40, 167, 69, 0.6)',
                        'rgba(220, 53, 69, 0.6)'
                    ],
                    borderColor: [
                        'rgba(108, 117, 125, 1)',
                        'rgba(23, 162, 184, 1)',
                        'rgba(40, 167, 69, 1)',
                        'rgba(220, 53, 69, 1)'
                    ],
                    borderWidth: 1,
                }
            ]
        };
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement des résultats de la campagne...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (!campaign || !results) {
        return (
            <Container className="py-5">
                <Alert variant="warning">Aucune donnée disponible pour cette campagne.</Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <h2 className="mb-0">Résultats de la campagne</h2>
                    <p className="text-muted">{campaign.campaign_name}</p>
                </Col>
                <Col xs="auto">
                    <div className="btn-group" role="group">
                        <button
                            className={`btn ${dateRange === 'day' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleDateRangeChange('day')}
                        >
                            Jour
                        </button>
                        <button
                            className={`btn ${dateRange === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleDateRangeChange('week')}
                        >
                            Semaine
                        </button>
                        <button
                            className={`btn ${dateRange === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleDateRangeChange('month')}
                        >
                            Mois
                        </button>
                        <button
                            className={`btn ${dateRange === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleDateRangeChange('all')}
                        >
                            Tout
                        </button>
                    </div>
                </Col>
            </Row>

            {/* Cartes de métriques */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-2">Messages envoyés</h6>
                            <h3 className="fw-bold">{results.summary.totalMessages}</h3>
                            <ProgressBar now={100} variant="primary" className="mt-2" />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-2">Réponses reçues</h6>
                            <h3 className="fw-bold">{results.summary.totalResponses}</h3>
                            <ProgressBar
                                now={results.summary.responseRate}
                                variant="info"
                                className="mt-2"
                                label={`${results.summary.responseRate}%`}
                            />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-2">Conversions</h6>
                            <h3 className="fw-bold">{results.summary.totalConversions}</h3>
                            <ProgressBar
                                now={results.summary.conversionRate}
                                variant="success"
                                className="mt-2"
                                label={`${results.summary.conversionRate}%`}
                            />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-2">CA généré</h6>
                            <h3 className="fw-bold">
                                {results.prospects
                                    .filter(p => p.status === 'converted')
                                    .reduce((sum, p) => sum + p.revenue, 0)
                                    .toLocaleString('fr-FR')} €
                            </h3>
                            <div className="text-success mt-2">
                                <i className="bi bi-graph-up"></i> ROI positif
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Graphiques */}
            <Row className="mb-4">
                <Col md={8}>
                    <Card className="h-100 shadow-sm">
                        <Card.Header>Activité de la campagne</Card.Header>
                        <Card.Body>
                            <Tabs defaultActiveKey="messages" className="mb-3">
                                <Tab eventKey="messages" title="Messages et réponses">
                                    {getMessagesChart() && (
                                        <Line
                                            data={getMessagesChart()}
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: {
                                                        position: 'top',
                                                    },
                                                    title: {
                                                        display: false
                                                    }
                                                }
                                            }}
                                        />
                                    )}
                                </Tab>
                                <Tab eventKey="conversions" title="Conversions">
                                    {getConversionsChart() && (
                                        <Bar
                                            data={getConversionsChart()}
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: {
                                                        position: 'top',
                                                    },
                                                    title: {
                                                        display: false
                                                    }
                                                }
                                            }}
                                        />
                                    )}
                                </Tab>
                                <Tab eventKey="rate" title="Taux de réponse">
                                    {getResponseRateChart() && (
                                        <Line
                                            data={getResponseRateChart()}
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: {
                                                        position: 'top',
                                                    },
                                                    title: {
                                                        display: false
                                                    }
                                                }
                                            }}
                                        />
                                    )}
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="h-100 shadow-sm">
                        <Card.Header>Répartition des prospects</Card.Header>
                        <Card.Body className="d-flex justify-content-center align-items-center">
                            {getStatusPieChart() && (
                                <div style={{ maxHeight: '300px' }}>
                                    <Pie
                                        data={getStatusPieChart()}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                },
                                                title: {
                                                    display: false
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Liste des prospects */}
            <Card className="shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Prospects contactés</h5>
                    <div className="d-flex align-items-center">
                        <input
                            type="search"
                            className="form-control form-control-sm me-2"
                            placeholder="Rechercher..."
                            style={{ width: '200px' }}
                        />
                        <button className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-download"></i> Exporter
                        </button>
                    </div>
                </Card.Header>
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nom</th>
                                <th>Poste</th>
                                <th>Entreprise</th>
                                <th>Statut</th>
                                <th>CA généré</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.prospects.map((prospect) => (
                                <tr key={prospect.id}>
                                    <td>{prospect.id}</td>
                                    <td>{prospect.name}</td>
                                    <td>{prospect.position}</td>
                                    <td>{prospect.company}</td>
                                    <td>
                                        <Badge bg={getStatusBadgeClass(prospect.status)}>
                                            {formatStatus(prospect.status)}
                                        </Badge>
                                    </td>
                                    <td>
                                        {prospect.revenue > 0 ? `${prospect.revenue.toLocaleString('fr-FR')} €` : '-'}
                                    </td>
                                    <td>{prospect.date}</td>
                                    <td>
                                        <div className="btn-group btn-group-sm">
                                            <button className="btn btn-outline-secondary" title="Voir les détails">
                                                <i className="bi bi-eye"></i>
                                            </button>
                                            <button className="btn btn-outline-primary" title="Envoyer un message">
                                                <i className="bi bi-envelope"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
                <Card.Footer className="text-muted">
                    Affichage de {results.prospects.length} prospects sur {results.prospects.length}
                </Card.Footer>
            </Card>
        </Container>
    );
};

export default CampaignResults;