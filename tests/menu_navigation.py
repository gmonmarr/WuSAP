import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Helper: login as a user with the given credentials
def login(driver, email, password):
    driver.get("http://localhost:5173/inicio-sesion")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "email")))
    driver.find_element(By.NAME, "email").send_keys(email)
    driver.find_element(By.NAME, "password").send_keys(password)
    driver.find_element(By.TAG_NAME, "form").submit()
    # Wait for login to complete (navbar appears)
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "navbar")))

# Helper: open sidebar menu
def open_sidebar(driver):
    menu_btn = driver.find_element(By.CLASS_NAME, "menu-button")
    menu_btn.click()
    WebDriverWait(driver, 5).until(EC.visibility_of_element_located((By.CLASS_NAME, "sidebar")))

# Helper: click menu item by label
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
    options.add_argument("--headless=new")  # Use "--headless" if "--headless=new" fails
    options.add_argument("--window-size=1920,1080")
    driver = webdriver.Chrome(options=options)
    driver.maximize_window()
    yield driver
    driver.quit()

'''
    show live automation:

    driver = webdriver.Chrome()
    driver.maximize_window()
    yield driver
    driver.quit()
'''

def test_owner_tablero(driver):
    login(driver, "admin@wusap.com", "WUSAP123")  # Replace with real owner credentials
    click_menu_option(driver, "Owner:Tablero")
    WebDriverWait(driver, 5).until(EC.url_contains("/tablero")) 
    assert "/tablero" in driver.current_url

def test_manager_hacer_pedido(driver):
    login(driver, "admin@wusap.com", "WUSAP123")  # Replace with real manager credentials
    click_menu_option(driver, "Manager: Hacer Pedido")
    WebDriverWait(driver, 5).until(EC.url_contains("/hacer-pedido"))
    assert "/hacer-pedido" in driver.current_url

def test_warehouse_manager_gestion_productos(driver):
    login(driver, "admin@wusap.com", "WUSAP123")  # Replace with real warehouse manager credentials
    click_menu_option(driver, "Warehouse Manager: Gestion de Productos")
    WebDriverWait(driver, 5).until(EC.url_contains("/productos"))
    assert "/productos" in driver.current_url

def test_warehouse_manager_solicitar_material(driver):
    login(driver, "admin@wusap.com", "WUSAP123")
    click_menu_option(driver, "Warehouse Manager: Solicitar Material")
    WebDriverWait(driver, 5).until(EC.url_contains("/solicitar-material"))
    assert "/solicitar-material" in driver.current_url

def test_owner_manager_warehouse_estadisticas_inventario(driver):
    login(driver, "admin@wusap.com", "WUSAP123")
    click_menu_option(driver, "Owner/Manager/Warehouse Manager: Estadisticas Inventario")
    WebDriverWait(driver, 5).until(EC.url_contains("/inventario"))
    assert "/inventario" in driver.current_url

def test_owner_manager_warehouse_inventario(driver):
    login(driver, "admin@wusap.com", "WUSAP123")
    click_menu_option(driver, "Owner/Manager/Warehouse Manager: Inventario")
    WebDriverWait(driver, 5).until(EC.url_contains("/productos-sucursal"))
    assert "/productos-sucursal" in driver.current_url

def test_manager_warehouse_solicitudes(driver):
    login(driver, "admin@wusap.com", "WUSAP123")
    click_menu_option(driver, "Manager/Warehouse Manager: Solicitudes")
    WebDriverWait(driver, 5).until(EC.url_contains("/solicitudes"))
    assert "/solicitudes" in driver.current_url

def test_owner_manager_warehouse_ordenes_produccion(driver):
    login(driver, "admin@wusap.com", "WUSAP123")
    click_menu_option(driver, "Owner/Manager/Warehouse Manager: Ordenes de Producción")
    WebDriverWait(driver, 5).until(EC.url_contains("/orden-status"))
    assert "/orden-status" in driver.current_url

def test_admin_gestionar_usuarios(driver):
    login(driver, "admin@wusap.com", "WUSAP123")
    click_menu_option(driver, "Admin: Gestionar usuarios")
    WebDriverWait(driver, 5).until(EC.url_contains("/lista-usuarios"))
    assert "/lista-usuarios" in driver.current_url

def test_admin_admin_view(driver):
    login(driver, "admin@wusap.com", "WUSAP123")
    click_menu_option(driver, "Admin: Admin View")
    WebDriverWait(driver, 5).until(EC.url_contains("/admin"))
    assert "/admin" in driver.current_url

def test_admin_ubicaciones(driver):
    login(driver, "admin@wusap.com", "WUSAP123")
    click_menu_option(driver, "Admin:Ubicaciones")
    WebDriverWait(driver, 5).until(EC.url_contains("/admin/locations"))
    assert "/admin/locations" in driver.current_url

# Note: Replace login credentials with real test users for each role.
# Optionally, add more robust assertions for each page (e.g., check for unique elements).
