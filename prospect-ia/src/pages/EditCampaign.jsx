import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col, ProgressBar, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Configuration de l'URL de base de l'API
const API_URL = 'http://127.0.0.1:8000';

const EditCampaign = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // États pour gérer les différentes étapes et champs du formulaire
    const [step, setStep] = useState(1);
    const [campaignType, setCampaignType] = useState('');
    const [productType, setProductType] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({});
    const [originalData, setOriginalData] = useState({}); // Pour comparer les changements

    // Effet pour récupérer les données de la campagne
    useEffect(() => {
        const fetchCampaignData = async () => {
            try {
                // Vérification de l'authentification
                if (!isAuthenticated()) {
                    setError("Vous devez être connecté pour modifier une campagne");
                    navigate('/login', { state: { returnUrl: `/dashboard/campagnes/edit/${id}` } });
                    return;
                }

                // Récupération du token
                const token = localStorage.getItem('token');
                if (!token) {
                    setError("Session expirée. Veuillez vous reconnecter.");
                    navigate('/login', { state: { returnUrl: `/dashboard/campagnes/edit/${id}` } });
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

                // Mise à jour des données du formulaire
                setFormData(response.data);
                setOriginalData(response.data);

                // Mise à jour des états dérivés
                if (response.data.offer_type) {
                    setProductType(response.data.offer_type);
                }

            } catch (err) {
                console.error("Erreur lors de la récupération des données de la campagne:", err);

                if (err.response) {
                    const status = err.response.status;

                    if (status === 404) {
                        setError("Campagne non trouvée");
                    } else if (status === 401) {
                        setError("Votre session a expiré. Veuillez vous reconnecter.");
                        setTimeout(() => navigate('/login', { state: { returnUrl: `/dashboard/campagnes/edit/${id}` } }), 2000);
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

    // Fonction pour mettre à jour les données du formulaire
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            // Gestion des cases à cocher multiples
            if (Array.isArray(formData[name])) {
                const updatedArray = [...formData[name]];
                if (checked) {
                    if (!updatedArray.includes(value)) {
                        updatedArray.push(value);
                    }
                } else {
                    const index = updatedArray.indexOf(value);
                    if (index > -1) {
                        updatedArray.splice(index, 1);
                    }
                }
                setFormData({ ...formData, [name]: updatedArray });
            } else {
                // Pour les cases à cocher simples (true/false)
                setFormData({ ...formData, [name]: checked });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Fonction pour gérer les sélections multiples
    const handleMultiSelect = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    // Navigation entre les étapes
    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    // Calcul de la progression
    const progress = ((step - 1) / 5) * 100;

    // Fonction de soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            // Vérification de l'authentification
            if (!isAuthenticated()) {
                setError("Vous devez être connecté pour modifier une campagne");
                navigate('/login', { state: { returnUrl: `/dashboard/campagnes/edit/${id}` } });
                return;
            }

            // Récupération du token
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Session expirée. Veuillez vous reconnecter.");
                navigate('/login', { state: { returnUrl: `/dashboard/campagnes/edit/${id}` } });
                return;
            }

            // Configuration de l'en-tête avec le token JWT
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            // Formatage des données pour l'API
            const campaignData = {
                ...formData,
                // S'assurer que les champs text-based array sont correctement formatés
                target_job: typeof formData.target_job === 'string'
                    ? formData.target_job
                    : formData.target_job.join(', '),

                // Formater les champs pour correspondre au schéma backend
                target_industry: Array.isArray(formData.target_industry)
                    ? formData.target_industry
                    : [formData.target_industry],

                scraping_sources: Array.isArray(formData.scraping_sources)
                    ? formData.scraping_sources
                    : [formData.scraping_sources],

                contact_methods: Array.isArray(formData.contact_methods)
                    ? formData.contact_methods
                    : [formData.contact_methods],
            };

            // Envoi des données à l'API
            const response = await axios.put(`${API_URL}/campaigns/${id}`, campaignData, config);

            // Afficher un message de succès
            setSuccess("Campagne mise à jour avec succès!");

            // Mise à jour des données originales
            setOriginalData(response.data);

            // Redirection après un court délai
            setTimeout(() => {
                navigate('/dashboard/campagnes');
            }, 2000);

        } catch (error) {
            console.error('Erreur lors de la mise à jour de la campagne:', error);

            // Gestion des différents types d'erreurs
            if (error.response) {
                const status = error.response.status;

                switch (status) {
                    case 401:
                        setError("Votre session a expiré. Veuillez vous reconnecter.");
                        setTimeout(() => navigate('/login', { state: { returnUrl: `/dashboard/campagnes/edit/${id}` } }), 2000);
                        break;
                    case 403:
                        setError("Vous n'avez pas les droits nécessaires pour modifier cette campagne.");
                        break;
                    case 400:
                        setError(`Erreur de validation: ${error.response.data.detail || 'Veuillez vérifier les données saisies'}`);
                        break;
                    default:
                        setError(`Erreur ${status}: ${error.response.data.detail || 'Une erreur est survenue'}`);
                }
            } else if (error.request) {
                setError("Impossible de contacter le serveur. Veuillez vérifier votre connexion internet.");
            } else {
                setError(error.message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Vérifier s'il y a des modifications
    const hasChanges = () => {
        // Vérification simplifiée, ne gère pas les comparaisons complexes
        return JSON.stringify(formData) !== JSON.stringify(originalData);
    };

    // Fonction pour annuler les modifications
    const handleCancel = () => {
        if (hasChanges()) {
            if (window.confirm("Voulez-vous vraiment annuler vos modifications?")) {
                navigate('/dashboard/campagnes');
            }
        } else {
            navigate('/dashboard/campagnes');
        }
    };

    // Rendu des différentes étapes du formulaire
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Card className="mb-4">
                        <Card.Header as="h5">Étape 1: Informations de base</Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Nom de la campagne *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="campaign_name"
                                    value={formData.campaign_name || ''}
                                    onChange={handleChange}
                                    placeholder="Ex: Prospection clients SaaS - Mai 2025"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Objectif principal de la campagne *</Form.Label>
                                <Form.Select
                                    name="campaign_objective"
                                    value={formData.campaign_objective || ''}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Sélectionnez un objectif</option>
                                    <option value="lead_generation">Génération de leads</option>
                                    <option value="sales">Ventes directes</option>
                                    <option value="meeting">Prise de rendez-vous</option>
                                    <option value="event">Invitation à un événement</option>
                                    <option value="awareness">Notoriété de marque</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Type d'entreprise *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="business_type"
                                    value={formData.business_type || ''}
                                    onChange={handleChange}
                                    placeholder="Ex: Agence marketing, Cabinet de conseil, E-commerce..."
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Secteurs d'activité cibles *</Form.Label>
                                <Form.Select
                                    multiple
                                    name="target_industry"
                                    value={formData.target_industry || []}
                                    onChange={(e) => handleMultiSelect('target_industry', [...e.target.selectedOptions].map(o => o.value))}
                                    required
                                >
                                    <option value="tech">Technologie</option>
                                    <option value="finance">Finance</option>
                                    <option value="healthcare">Santé</option>
                                    <option value="education">Éducation</option>
                                    <option value="retail">Commerce de détail</option>
                                    <option value="manufacturing">Industrie</option>
                                    <option value="realestate">Immobilier</option>
                                    <option value="hospitality">Hôtellerie</option>
                                    <option value="consulting">Conseil</option>
                                    <option value="other">Autre</option>
                                </Form.Select>
                                <Form.Text className="text-muted">
                                    Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs options
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Taille des entreprises cibles</Form.Label>
                                <div>
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        name="target_company_size"
                                        value="1-10"
                                        label="1-10 employés"
                                        onChange={handleChange}
                                        checked={formData.target_company_size?.includes('1-10')}
                                    />
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        name="target_company_size"
                                        value="11-50"
                                        label="11-50 employés"
                                        onChange={handleChange}
                                        checked={formData.target_company_size?.includes('11-50')}
                                    />
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        name="target_company_size"
                                        value="51-200"
                                        label="51-200 employés"
                                        onChange={handleChange}
                                        checked={formData.target_company_size?.includes('51-200')}
                                    />
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        name="target_company_size"
                                        value="201-500"
                                        label="201-500 employés"
                                        onChange={handleChange}
                                        checked={formData.target_company_size?.includes('201-500')}
                                    />
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        name="target_company_size"
                                        value="501-1000"
                                        label="501-1000 employés"
                                        onChange={handleChange}
                                        checked={formData.target_company_size?.includes('501-1000')}
                                    />
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        name="target_company_size"
                                        value="1000+"
                                        label="1000+ employés"
                                        onChange={handleChange}
                                        checked={formData.target_company_size?.includes('1000+')}
                                    />
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Zones géographiques cibles *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="target_geography"
                                    value={formData.target_geography || ''}
                                    onChange={handleChange}
                                    placeholder="Ex: France, Belgique, Suisse, Paris, Lyon..."
                                    required
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>
                );

            case 2:
                return (
                    <Card className="mb-4">
                        <Card.Header as="h5">Étape 2: Informations sur votre offre</Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Type d'offre *</Form.Label>
                                <Form.Select
                                    name="offer_type"
                                    value={formData.offer_type || ''}
                                    onChange={(e) => {
                                        handleChange(e);
                                        setProductType(e.target.value);
                                    }}
                                    required
                                >
                                    <option value="">Sélectionnez le type d'offre</option>
                                    <option value="digital_product">Produit digital (SaaS, App, Formation...)</option>
                                    <option value="physical_product">Produit physique</option>
                                    <option value="service">Service</option>
                                </Form.Select>
                            </Form.Group>

                            {productType === 'digital_product' && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Catégorie de produit digital</Form.Label>
                                    <Form.Select
                                        name="product_category"
                                        value={formData.product_category || ''}
                                        onChange={handleChange}
                                    >
                                        <option value="">Sélectionnez une catégorie</option>
                                        <option value="saas">Logiciel SaaS</option>
                                        <option value="mobile_app">Application mobile</option>
                                        <option value="web_app">Application web</option>
                                        <option value="elearning">Formation en ligne</option>
                                        <option value="digital_content">Contenu digital (ebook, template...)</option>
                                        <option value="other">Autre</option>
                                    </Form.Select>
                                </Form.Group>
                            )}

                            {productType === 'physical_product' && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Catégorie de produit physique</Form.Label>
                                    <Form.Select
                                        name="product_category"
                                        value={formData.product_category || ''}
                                        onChange={handleChange}
                                    >
                                        <option value="">Sélectionnez une catégorie</option>
                                        <option value="electronics">Électronique</option>
                                        <option value="furniture">Mobilier</option>
                                        <option value="clothing">Vêtements</option>
                                        <option value="food">Alimentation</option>
                                        <option value="beauty">Beauté et bien-être</option>
                                        <option value="office">Fournitures de bureau</option>
                                        <option value="industrial">Équipement industriel</option>
                                        <option value="other">Autre</option>
                                    </Form.Select>
                                </Form.Group>
                            )}

                            {productType === 'service' && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Type de service</Form.Label>
                                    <Form.Select
                                        name="product_category"
                                        value={formData.product_category || ''}
                                        onChange={handleChange}
                                    >
                                        <option value="">Sélectionnez un type de service</option>
                                        <option value="consulting">Conseil</option>
                                        <option value="coaching">Coaching</option>
                                        <option value="agency">Agence</option>
                                        <option value="maintenance">Maintenance et support</option>
                                        <option value="training">Formation</option>
                                        <option value="financial">Services financiers</option>
                                        <option value="legal">Services juridiques</option>
                                        <option value="other">Autre</option>
                                    </Form.Select>
                                </Form.Group>
                            )}

                            <Form.Group className="mb-3">
                                <Form.Label>Nom du produit/service *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="product_name"
                                    value={formData.product_name || ''}
                                    onChange={handleChange}
                                    placeholder="Ex: ProspectAI, ConsultingPro..."
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Description concise *</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="product_description"
                                    value={formData.product_description || ''}
                                    onChange={handleChange}
                                    placeholder="Décrivez brièvement votre produit/service (150 caractères max)"
                                    maxLength={150}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Principaux bénéfices pour vos clients *</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="product_benefits"
                                    value={formData.product_benefits || ''}
                                    onChange={handleChange}
                                    placeholder="Ex: Gain de temps, Réduction des coûts, Augmentation des ventes..."
                                    required
                                />
                                <Form.Text className="text-muted">
                                    Listez les 3-5 principaux bénéfices, séparés par des virgules
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Proposition de valeur unique (USP) *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="product_usp"
                                    value={formData.product_usp || ''}
                                    onChange={handleChange}
                                    placeholder="Ce qui vous différencie de la concurrence"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Gamme de prix</Form.Label>
                                <Form.Select
                                    name="product_pricing"
                                    value={formData.product_pricing || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">Sélectionnez une gamme de prix</option>
                                    <option value="free">Gratuit / Freemium</option>
                                    <option value="low">Entrée de gamme (&lt; 100€/mois)</option>
                                    <option value="medium">Milieu de gamme (100€-500€/mois)</option>
                                    <option value="high">Haut de gamme (500€-2000€/mois)</option>
                                    <option value="enterprise">Enterprise (&gt; 2000€/mois)</option>
                                    <option value="quote">Sur devis uniquement</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>URL du produit/service</Form.Label>
                                <Form.Control
                                    type="url"
                                    name="product_url"
                                    value={formData.product_url || ''}
                                    onChange={handleChange}
                                    placeholder="https://www.votreproduit.com"
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>
                );
            case 3:
                return (
                    <Card className="mb-4">
                        <Card.Header as="h5">Étape 3: Cible et persona</Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Postes/fonctions cibles *</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="target_job"
                                    value={formData.target_job || ''}
                                    onChange={handleChange}
                                    placeholder="Ex: Directeur Marketing, Responsable RH, CEO..."
                                    required
                                />
                                <Form.Text className="text-muted">
                                    Listez les postes séparés par des virgules
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Niveau hiérarchique</Form.Label>
                                <div>
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        name="target_seniority"
                                        value="C-level"
                                        label="C-level (CEO, CFO, CTO...)"
                                        onChange={handleChange}
                                        checked={formData.target_seniority?.includes('C-level')}
                                    />
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        name="target_seniority"
                                        value="VP"
                                        label="VP"
                                        onChange={handleChange}
                                        checked={formData.target_seniority?.includes('VP')}
                                    />
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        name="target_seniority"
                                        value="Director"
                                        label="Directeur"
                                        onChange={handleChange}
                                        checked={formData.target_seniority?.includes('Director')}
                                    />
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        name="target_seniority"
                                        value="Manager"
                                        label="Manager"
                                        onChange={handleChange}
                                        checked={formData.target_seniority?.includes('Manager')}
                                    />
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        name="target_seniority"
                                        value="Individual"
                                        label="Individuel"
                                        onChange={handleChange}
                                        checked={formData.target_seniority?.includes('Individual')}
                                    />
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Départements/Services cibles</Form.Label>
                                <div>
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        name="target_department"
                                        value="Executive"
                                        label="Direction générale"
                                        onChange={handleChange}
                                        checked={formData.target_department?.includes('Executive')}
                                    />
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        name="target_department"
                                        value="Marketing"
                                        label="Marketing"
                                        onChange={handleChange}
                                        checked={formData.target_department?.includes('Marketing')}
                                    />
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        name="target_department"
                                        value="Sales"
                                        label="Ventes"
                                        onChange={handleChange}
                                        checked={formData.target_department?.includes('Sales')}
                                    />
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        name="target_department"
                                        value="IT"
                                        label="IT"
                                        onChange={handleChange}
                                        checked={formData.target_department?.includes('IT')}
                                    />
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        name="target_department"
                                        value="HR"
                                        label="RH"
                                        onChange={handleChange}
                                        checked={formData.target_department?.includes('HR')}
                                    />
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        name="target_department"
                                        value="Finance"
                                        label="Finance"
                                        onChange={handleChange}
                                        checked={formData.target_department?.includes('Finance')}
                                    />
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        name="target_department"
                                        value="Operations"
                                        label="Opérations"
                                        onChange={handleChange}
                                        checked={formData.target_department?.includes('Operations')}
                                    />
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        name="target_department"
                                        value="Legal"
                                        label="Juridique"
                                        onChange={handleChange}
                                        checked={formData.target_department?.includes('Legal')}
                                    />
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Points de douleur de votre persona *</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="persona_pain_points"
                                    value={formData.persona_pain_points || ''}
                                    onChange={handleChange}
                                    placeholder="Quels problèmes votre produit/service résout-il pour cette personne ?"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Motivations et objectifs professionnels</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="persona_motivations"
                                    value={formData.persona_motivations || ''}
                                    onChange={handleChange}
                                    placeholder="Qu'est-ce qui motive cette personne dans son rôle professionnel ?"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Objections potentielles</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="persona_objections"
                                    value={formData.persona_objections || ''}
                                    onChange={handleChange}
                                    placeholder="Quelles objections cette personne pourrait-elle avoir face à votre offre ?"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Décisionnaire ou influenceur ?</Form.Label>
                                <Form.Select
                                    name="decision_maker"
                                    value={formData.decision_maker || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">Sélectionnez</option>
                                    <option value="decision_maker">Décisionnaire final</option>
                                    <option value="influencer">Influenceur</option>
                                    <option value="both">Les deux</option>
                                </Form.Select>
                            </Form.Group>
                        </Card.Body>
                    </Card>
                );

            case 4:
                return (
                    <Card className="mb-4">
                        <Card.Header as="h5">Étape 4: Sources et canaux</Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Sources pour le scraping *</Form.Label>
                                <div>
                                    <Form.Check
                                        type="checkbox"
                                        name="scraping_sources"
                                        value="linkedin"
                                        label="LinkedIn"
                                        onChange={handleChange}
                                        checked={formData.scraping_sources?.includes('linkedin')}
                                    />
                                    <Form.Check
                                        type="checkbox"
                                        name="scraping_sources"
                                        value="google_maps"
                                        label="Google Maps"
                                        onChange={handleChange}
                                        checked={formData.scraping_sources?.includes('google_maps')}
                                    />
                                    <Form.Check
                                        type="checkbox"
                                        name="scraping_sources"
                                        value="company_websites"
                                        label="Sites web d'entreprises"
                                        onChange={handleChange}
                                        checked={formData.scraping_sources?.includes('company_websites')}
                                    />
                                    <Form.Check
                                        type="checkbox"
                                        name="scraping_sources"
                                        value="job_boards"
                                        label="Sites d'emploi"
                                        onChange={handleChange}
                                        checked={formData.scraping_sources?.includes('job_boards')}
                                    />
                                    <Form.Check
                                        type="checkbox"
                                        name="scraping_sources"
                                        value="directories"
                                        label="Annuaires professionnels"
                                        onChange={handleChange}
                                        checked={formData.scraping_sources?.includes('directories')}
                                    />
                                </div>
                            </Form.Group>

                            {formData.scraping_sources?.includes('linkedin') && (
                                <Form.Group className="mb-3">
                                    <Form.Label>URL de recherche LinkedIn (optionnel)</Form.Label>
                                    <Form.Control
                                        type="url"
                                        name="linkedin_url"
                                        value={formData.linkedin_url || ''}
                                        onChange={handleChange}
                                        placeholder="URL d'une recherche LinkedIn que vous avez déjà configurée"
                                    />
                                    <Form.Text className="text-muted">
                                        Si vous avez déjà créé une recherche LinkedIn avec des filtres précis
                                    </Form.Text>
                                </Form.Group>
                            )}

                            {formData.scraping_sources?.includes('google_maps') && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Termes de recherche Google Maps (optionnel)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="google_maps_location"
                                        value={formData.google_maps_location || ''}
                                        onChange={handleChange}
                                        placeholder="Ex: Restaurants italiens Paris, Agences marketing Lyon..."
                                    />
                                </Form.Group>
                            )}

                            <Form.Group className="mb-3">
                                <Form.Label>Canaux de contact préférés *</Form.Label>
                                <div>
                                    <Form.Check
                                        type="checkbox"
                                        name="contact_methods"
                                        value="email"
                                        label="Email"
                                        onChange={handleChange}
                                        checked={formData.contact_methods?.includes('email')}
                                    />
                                    <Form.Check
                                        type="checkbox"
                                        name="contact_methods"
                                        value="linkedin_message"
                                        label="Message LinkedIn"
                                        onChange={handleChange}
                                        checked={formData.contact_methods?.includes('linkedin_message')}
                                    />
                                    <Form.Check
                                        type="checkbox"
                                        name="contact_methods"
                                        value="linkedin_connection"
                                        label="Demande de connexion LinkedIn avec note"
                                        onChange={handleChange}
                                        checked={formData.contact_methods?.includes('linkedin_connection')}
                                    />
                                    <Form.Check
                                        type="checkbox"
                                        name="contact_methods"
                                        value="twitter_dm"
                                        label="Twitter DM"
                                        onChange={handleChange}
                                        checked={formData.contact_methods?.includes('twitter_dm')}
                                    />
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>URL source additionnelle (optionnel)</Form.Label>
                                <Form.Control
                                    type="url"
                                    name="other_source_url"
                                    value={formData.other_source_url || ''}
                                    onChange={handleChange}
                                    placeholder="URL d'une autre source de prospects (annuaire, site web...)"
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>
                );

            case 5:
                return (
                    <Card className="mb-4">
                        <Card.Header as="h5">Étape 5: Personnalisation du message</Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Style de message préféré *</Form.Label>
                                <Form.Select
                                    name="message_style"
                                    value={formData.message_style || ''}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Sélectionnez un style</option>
                                    <option value="direct">Direct et concis</option>
                                    <option value="storytelling">Narratif (storytelling)</option>
                                    <option value="question">Basé sur des questions</option>
                                    <option value="educational">Éducatif (partage d'insights)</option>
                                    <option value="personal">Personnel et conversationnel</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Ton du message *</Form.Label>
                                <Form.Select
                                    name="message_tone"
                                    value={formData.message_tone || ''}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Sélectionnez un ton</option>
                                    <option value="professional">Professionnel et formel</option>
                                    <option value="friendly">Amical et décontracté</option>
                                    <option value="enthusiastic">Enthousiaste et énergique</option>
                                    <option value="authoritative">Expert et affirmatif</option>
                                    <option value="empathetic">Empathique et compréhensif</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Call-to-Action principal *</Form.Label>
                                <Form.Select
                                    name="call_to_action"
                                    value={formData.call_to_action || ''}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Sélectionnez un CTA</option>
                                    <option value="meeting">Proposer un rendez-vous</option>
                                    <option value="demo">Demander une démo</option>
                                    <option value="trial">Essai gratuit</option>
                                    <option value="download">Téléchargement (contenu gratuit)</option>
                                    <option value="question">Poser une question ouverte</option>
                                    <option value="event">Invitation à un événement</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Présentation de votre entreprise (optionnel)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="company_background"
                                    value={formData.company_background || ''}
                                    onChange={handleChange}
                                    placeholder="Une brève présentation de votre entreprise pour contextualiser votre message"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Témoignages clients ou réussites (optionnel)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="success_stories"
                                    value={formData.success_stories || ''}
                                    onChange={handleChange}
                                    placeholder="Ex: Un client a augmenté ses ventes de 30% en 3 mois grâce à notre solution"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Preuves sociales (optionnel)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="social_proof"
                                    value={formData.social_proof || ''}
                                    onChange={handleChange}
                                    placeholder="Ex: +500 clients, 4.8/5 sur Google, Prix de l'innovation 2024..."
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Facteur d'urgence (optionnel)</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="urgency_factor"
                                    value={formData.urgency_factor || ''}
                                    onChange={handleChange}
                                    placeholder="Ex: Offre limitée, Promotion jusqu'au 15 juin..."
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>
                );

            case 6:
                return (
                    <Card className="mb-4">
                        <Card.Header as="h5">Étape 6: Paramètres de la campagne</Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Date de début *</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="start_date"
                                            value={formData.start_date ? formData.start_date.split('T')[0] : ''}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Date de fin (optionnel)</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="end_date"
                                            value={formData.end_date ? formData.end_date.split('T')[0] : ''}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Limite quotidienne de messages *</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="daily_limit"
                                    value={formData.daily_limit || 0}
                                    onChange={handleChange}
                                    min="1"
                                    max="100"
                                    placeholder="Ex: 25 messages par jour"
                                    required
                                />
                                <Form.Text className="text-muted">
                                    Recommandé: entre 10 et 30 messages par jour pour éviter les restrictions des plateformes
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Check
                                    type="switch"
                                    id="follow_up_sequence"
                                    label="Activer les messages de relance automatiques"
                                    name="follow_up_sequence"
                                    checked={formData.follow_up_sequence || false}
                                    onChange={(e) => setFormData({ ...formData, follow_up_sequence: e.target.checked })}
                                />
                            </Form.Group>

                            {formData.follow_up_sequence && (
                                <>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Délai entre les relances (jours) *</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="follow_up_delay"
                                                    value={formData.follow_up_delay || 0}
                                                    onChange={handleChange}
                                                    min="1"
                                                    max="14"
                                                    required={formData.follow_up_sequence}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Nombre de relances *</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="follow_up_number"
                                                    value={formData.follow_up_number || 0}
                                                    onChange={handleChange}
                                                    min="1"
                                                    max="5"
                                                    required={formData.follow_up_sequence}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </>
                            )}

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    id="test_mode"
                                    label="Mode test (envoyer les 5 premiers messages et attendre validation)"
                                    name="test_mode"
                                    checked={formData.test_mode || false}
                                    onChange={(e) => setFormData({ ...formData, test_mode: e.target.checked })}
                                />
                            </Form.Group>

                            <Alert variant="info">
                                <Alert.Heading>Résumé de la campagne</Alert.Heading>
                                <p>
                                    Campagne "{formData.campaign_name}"
                                    ciblant les {formData.target_job} dans {Array.isArray(formData.target_industry) ? formData.target_industry.join(', ') : formData.target_industry}.
                                </p>
                                <hr />
                                <p className="mb-0">
                                    La campagne débutera le {formData.start_date ? new Date(formData.start_date).toLocaleDateString('fr-FR') : 'non défini'}
                                    avec une limite de {formData.daily_limit} messages par jour.
                                    {formData.follow_up_sequence ?
                                        ` ${formData.follow_up_number} relances automatiques seront envoyées tous les ${formData.follow_up_delay} jours.` :
                                        ' Aucune relance automatique ne sera envoyée.'}
                                </p>
                            </Alert>

                            <div className="border-top pt-3 mt-3">
                                <h6>Options avancées</h6>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Priorité de campagne</Form.Label>
                                            <Form.Select
                                                name="campaign_priority"
                                                value={formData.campaign_priority || "normal"}
                                                onChange={handleChange}
                                            >
                                                <option value="low">Faible</option>
                                                <option value="normal">Normale</option>
                                                <option value="high">Élevée</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Notifications</Form.Label>
                                            <Form.Select
                                                name="notification_settings"
                                                value={formData.notification_settings || "daily"}
                                                onChange={handleChange}
                                            >
                                                <option value="none">Aucune</option>
                                                <option value="daily">Quotidiennes</option>
                                                <option value="weekly">Hebdomadaires</option>
                                                <option value="important">Uniquement les événements importants</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        id="auto_adjust"
                                        label="Ajustement automatique des performances (recommandé)"
                                        name="auto_adjust"
                                        checked={formData.auto_adjust || false}
                                        onChange={(e) => setFormData({ ...formData, auto_adjust: e.target.checked })}
                                    />
                                    <Form.Text className="text-muted">
                                        L'IA optimisera automatiquement votre message en fonction des taux de réponse
                                    </Form.Text>
                                </Form.Group>
                            </div>
                        </Card.Body>
                    </Card>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement des données de la campagne...</p>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Modifier la campagne</h2>
                <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/dashboard/campagnes')}
                >
                    <i className="bi bi-arrow-left me-2"></i>
                    Retour à la liste
                </Button>
            </div>

            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            {success && (
                <Alert variant="success" className="mb-4">
                    {success}
                </Alert>
            )}

            <ProgressBar now={progress} className="mb-4" variant="primary" label={`Étape ${step}/6`} />

            <Form onSubmit={handleSubmit}>
                {renderStep()}

                <div className="d-flex justify-content-between mt-4">
                    {step > 1 && (
                        <Button
                            variant="outline-primary"
                            onClick={prevStep}
                            disabled={submitting}
                        >
                            Précédent
                        </Button>
                    )}
                    {step < 6 ? (
                        <Button
                            variant="primary"
                            onClick={nextStep}
                            className={step === 1 ? 'ms-auto' : ''}
                            disabled={submitting}
                        >
                            Suivant
                        </Button>
                    ) : (
                        <div>
                            <Button
                                variant="outline-secondary"
                                type="button"
                                onClick={handleCancel}
                                disabled={submitting}
                                className="me-2"
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="success"
                                type="submit"
                                disabled={submitting || !hasChanges()}
                            >
                                {submitting ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        Enregistrement...
                                    </>
                                ) : (
                                    'Enregistrer les modifications'
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </Form>
        </Container>
    );
};

export default EditCampaign;