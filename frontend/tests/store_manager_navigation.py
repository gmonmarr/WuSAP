import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def login(driver, email, password):
    driver.get("https://wusap-frontend.cfapps.us10-001.hana.ondemand.com/")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "email")))
    driver.find_element(By.NAME, "email").send_keys(email)
    driver.find_element(By.NAME, "password").send_keys(password)
    driver.find_element(By.TAG_NAME, "form").submit()
    # Wait for tablero redirect
    WebDriverWait(driver, 10).until(EC.url_contains("/tablero"))
    assert "/tablero" in driver.current_url

def open_sidebar(driver):
    menu_btn = driver.find_element(By.CLASS_NAME, "menu-button")
    menu_btn.click()
    WebDriverWait(driver, 5).until(EC.visibility_of_element_located((By.CLASS_NAME, "sidebar")))

def click_menu_option(driver, label):
    open_sidebar(driver)
    menu_items = driver.find_elements(By.CSS_SELECTOR, ".nav-menu .nav-item span")
    for item in menu_items:
        if item.text.strip() == label:
            item.click()
            return
    raise Exception(f"Menu option '{label}' not found")

@pytest.fixture(scope="module")
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1920,1080")
    driver = webdriver.Chrome(options=options)
    driver.maximize_window()
    yield driver
    driver.quit()

def test_store_manager_initial_redirect(driver):
    login(driver, "store_manager@wusap.com", "WUSAP123")
    assert "/tablero" in driver.current_url

def test_store_manager_tablero(driver):
    login(driver, "store_manager@wusap.com", "WUSAP123")
    click_menu_option(driver, "Tablero")
    WebDriverWait(driver, 5).until(EC.url_contains("/tablero"))
    assert "/tablero" in driver.current_url

def test_store_manager_hacer_pedido(driver):
    login(driver, "store_manager@wusap.com", "WUSAP123")
    click_menu_option(driver, "Hacer Pedido")
    WebDriverWait(driver, 5).until(EC.url_contains("/hacer-pedido"))
    assert "/hacer-pedido" in driver.current_url

def test_store_manager_registrar_ventas(driver):
    login(driver, "store_manager@wusap.com", "WUSAP123")
    click_menu_option(driver, "Registrar Ventas")
    WebDriverWait(driver, 5).until(EC.url_contains("/registrar-ventas"))
    assert "/registrar-ventas" in driver.current_url

def test_store_manager_historial_ventas(driver):
    login(driver, "store_manager@wusap.com", "WUSAP123")
    click_menu_option(driver, "Historial de Ventas")
    WebDriverWait(driver, 5).until(EC.url_contains("/historial-ventas"))
    assert "/historial-ventas" in driver.current_url

def test_store_manager_estadisticas_inventario(driver):
    login(driver, "store_manager@wusap.com", "WUSAP123")
    click_menu_option(driver, "Estadísticas Inventario")
    WebDriverWait(driver, 5).until(EC.url_contains("/inventario"))
    assert "/inventario" in driver.current_url

def test_store_manager_inventario(driver):
    login(driver, "store_manager@wusap.com", "WUSAP123")
    click_menu_option(driver, "Inventario")
    WebDriverWait(driver, 5).until(EC.url_contains("/productos-sucursal"))
    assert "/productos-sucursal" in driver.current_url

def test_store_manager_solicitudes(driver):
    login(driver, "store_manager@wusap.com", "WUSAP123")
    click_menu_option(driver, "Solicitudes")
    WebDriverWait(driver, 5).until(EC.url_contains("/solicitudes"))
    assert "/solicitudes" in driver.current_url

def test_store_manager_ordenes_produccion(driver):
    login(driver, "store_manager@wusap.com", "WUSAP123")
    click_menu_option(driver, "Órdenes de Producción")
    WebDriverWait(driver, 5).until(EC.url_contains("/orden-status"))
    assert "/orden-status" in driver.current_url

def test_store_manager_alertas(driver):
    login(driver, "store_manager@wusap.com", "WUSAP123")
    click_menu_option(driver, "Alertas")
    WebDriverWait(driver, 5).until(EC.url_contains("/alertas"))
    assert "/alertas" in driver.current_url
