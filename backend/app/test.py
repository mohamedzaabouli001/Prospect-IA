import time
import random
import json
from urllib.parse import urlparse
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager

def setup_driver(headless=False):
    """Configure et initialise le driver Selenium"""
    options = Options()
    
    if headless:
        options.add_argument("--headless")
    
    # Options pour réduire la détection du scraping
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    
    # Ajouter un user-agent réaliste
    user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
    options.add_argument(f"--user-agent={user_agent}")
    
    # Exclure l'utilisation de l'automatisation si possible
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    
    # Initialiser le driver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    # Modifier le navigator.webdriver pour éviter la détection
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    return driver

def accept_cookies(driver):
    """Accepte les cookies s'il y a une popup"""
    try:
        # Attendre que le bouton d'acceptation apparaisse
        accept_button = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Accept') or contains(., 'Accepter') or contains(., 'J'accepte')]"))
        )
        accept_button.click()
        
        # Pause pour permettre la fermeture de la popup
        time.sleep(1)
        print("Cookies acceptés")
    except:
        # Ignorer si pas de popup ou erreur
        print("Pas de popup de cookies ou déjà accepté")
        pass

def search_google_maps(driver, query):
    """Effectue une recherche sur Google Maps"""
    print(f"Recherche Google Maps pour: {query}")
    
    try:
        # Naviguer vers Google Maps
        driver.get("https://www.google.com/maps")
        
        # Accepter les cookies (si nécessaire)
        accept_cookies(driver)
        
        # Attendre que la barre de recherche soit chargée
        search_box = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "searchboxinput"))
        )
        
        # Entrer la requête de recherche
        search_box.clear()
        search_box.send_keys(query)
        search_box.send_keys(Keys.ENTER)
        
        # Attendre que les résultats se chargent
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".section-result-content"))
        )
        
        print("Recherche terminée, résultats chargés")
        
        # Faire défiler pour charger plus de résultats
        scroll_for_more_results(driver)
        
        # Extraire les résultats
        results = extract_results(driver)
        
        return results
    
    except Exception as e:
        print(f"Erreur lors de la recherche: {str(e)}")
        return []

def scroll_for_more_results(driver, max_scrolls=5):
    """Défile dans la liste des résultats pour en charger davantage"""
    try:
        print("Défilement pour charger plus de résultats...")
        
        # Trouver le conteneur de résultats
        results_container = driver.find_element(By.CSS_SELECTOR, ".section-layout.section-scrollbox")
        
        # Défilement progressif
        for i in range(max_scrolls):
            print(f"Défilement {i+1}/{max_scrolls}")
            driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", results_container)
            time.sleep(random.uniform(1.5, 2.5))  # Pause aléatoire
    except Exception as e:
        print(f"Erreur lors du défilement: {str(e)}")

def extract_results(driver):
    """Extrait les informations des résultats affichés"""
    results = []
    
    try:
        # Récupérer les éléments de résultat
        result_elements = driver.find_elements(By.CSS_SELECTOR, ".section-result")
        print(f"Nombre de résultats trouvés: {len(result_elements)}")
        
        for i, element in enumerate(result_elements[:5]):  # Limiter à 5 pour le test
            try:
                print(f"Extraction du résultat {i+1}...")
                
                # Cliquer sur le résultat pour charger la page détaillée
                element.click()
                
                # Attendre que la page détaillée se charge
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".section-hero-header-title"))
                )
                
                # Extraire les détails de l'entreprise
                details = extract_business_details(driver)
                results.append(details)
                
                # Revenir aux résultats de recherche
                driver.execute_script("window.history.go(-1)")
                
                # Attendre que la liste des résultats se recharge
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".section-result"))
                )
                
                # Pause pour éviter d'être détecté comme un bot
                time.sleep(random.uniform(1.5, 3.0))
                
            except Exception as e:
                print(f"Erreur lors de l'extraction du résultat {i+1}: {str(e)}")
                # Essayer de revenir à la liste de résultats si on est bloqué dans une page de détail
                try:
                    driver.execute_script("window.history.go(-1)")
                    time.sleep(2)
                except:
                    pass
    
    except Exception as e:
        print(f"Erreur lors de l'extraction des résultats: {str(e)}")
    
    return results

def extract_business_details(driver):
    """Extrait les détails d'une entreprise depuis sa page détaillée"""
    details = {}
    
    try:
        # Extraire le nom
        try:
            name_element = driver.find_element(By.CSS_SELECTOR, ".section-hero-header-title-title")
            details["name"] = name_element.text
            print(f"Nom: {details['name']}")
        except:
            details["name"] = ""
            print("Nom non trouvé")
        
        # Extraire l'adresse
        try:
            address_element = driver.find_element(By.CSS_SELECTOR, "button[data-item-id='address']")
            details["address"] = address_element.text
            print(f"Adresse: {details['address']}")
        except:
            details["address"] = ""
            print("Adresse non trouvée")
        
        # Extraire le numéro de téléphone
        try:
            phone_element = driver.find_element(By.CSS_SELECTOR, "button[data-item-id='phone:tel']")
            details["phone"] = phone_element.text
            print(f"Téléphone: {details['phone']}")
        except:
            details["phone"] = ""
            print("Téléphone non trouvé")
        
        # Extraire le site web
        try:
            website_element = driver.find_element(By.CSS_SELECTOR, "a[data-item-id='authority']")
            details["website"] = website_element.get_attribute("href")
            print(f"Site web: {details['website']}")
        except:
            details["website"] = ""
            print("Site web non trouvé")
        
        # Extraire le type d'entreprise
        try:
            category_element = driver.find_element(By.CSS_SELECTOR, "button[jsaction='pane.rating.category']")
            details["business_type"] = category_element.text
            print(f"Type d'entreprise: {details['business_type']}")
        except:
            details["business_type"] = ""
            print("Type d'entreprise non trouvé")
        
        # Extraire la note
        try:
            rating_element = driver.find_element(By.CSS_SELECTOR, ".section-star-display")
            details["rating"] = float(rating_element.text.replace(',', '.'))
            print(f"Note: {details['rating']}")
        except:
            details["rating"] = 0.0
            print("Note non trouvée")
        
        # Extraire le nombre d'avis
        try:
            reviews_element = driver.find_element(By.CSS_SELECTOR, ".section-rating-term > span:nth-child(1)")
            reviews_text = reviews_element.text.replace('.', '').replace(',', '')
            details["reviews_count"] = int(''.join(filter(str.isdigit, reviews_text)))
            print(f"Nombre d'avis: {details['reviews_count']}")
        except:
            details["reviews_count"] = 0
            print("Nombre d'avis non trouvé")
        
        # Obtenir l'URL Google Maps
        details["maps_url"] = driver.current_url
        print(f"URL Google Maps: {details['maps_url']}")
        
        # Générer un email basique si un site web est disponible
        details["email"] = ""
        if details["website"]:
            try:
                # Extraire le domaine de l'URL
                parsed_url = urlparse(details["website"])
                domain = parsed_url.netloc
                
                # Nettoyer le domaine (enlever www. si présent)
                if domain.startswith("www."):
                    domain = domain[4:]
                
                # Générer un email générique pour l'entreprise
                details["email"] = f"contact@{domain}"
                print(f"Email généré: {details['email']}")
            except:
                print("Impossible de générer un email")
    
    except Exception as e:
        print(f"Erreur lors de l'extraction des détails: {str(e)}")
    
    return details

def save_results_to_file(results, filename="google_maps_results.json"):
    """Sauvegarde les résultats dans un fichier JSON"""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"Résultats sauvegardés dans {filename}")
    except Exception as e:
        print(f"Erreur lors de la sauvegarde des résultats: {str(e)}")

def main():
    query = input("Entrez votre requête de recherche Google Maps: ")
    headless = input("Mode headless (invisibil) ? (o/n): ").lower() == 'o'
    
    driver = setup_driver(headless=headless)
    
    try:
        results = search_google_maps(driver, query)
        print(f"\nRésultats trouvés: {len(results)}")
        
        # Sauvegarder les résultats
        save_results_to_file(results)
        
        # Afficher un résumé
        for i, result in enumerate(results):
            print(f"\nRésultat {i+1}:")
            print(f"Nom: {result.get('name', 'N/A')}")
            print(f"Adresse: {result.get('address', 'N/A')}")
            print(f"Téléphone: {result.get('phone', 'N/A')}")
            print(f"Site web: {result.get('website', 'N/A')}")
            print(f"Email (généré): {result.get('email', 'N/A')}")
            print(f"Type: {result.get('business_type', 'N/A')}")
            print(f"Note: {result.get('rating', 'N/A')}")
    
    finally:
        # Fermer le navigateur
        driver.quit()
        print("\nNavigateur fermé")

if __name__ == "__main__":
    main()