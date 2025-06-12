import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def login(driver, email, password):
    driver.get("http://localhost:5173/")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "email")))
    driver.find_element(By.NAME, "email").send_keys(email)
    driver.find_element(By.NAME, "password").send_keys(password)
    driver.find_element(By.TAG_NAME, "form").submit()
    WebDriverWait(driver, 10).until(EC.url_contains("/productos-sucursal"))
    assert "/productos-sucursal" in driver.current_url

def open_sidebar(driver):
    menu_btn = driver.find_element(By.CLASS_NAME, "menu-button")
    menu_btn.click()
    WebDriverWait(driver, 5).until(EC.visibility_of_element_located((By.CLASS_NAME, "sidebar")))

def click_menu_option(driver, label):
    open_sidebar(driver)
    menu_items = driver.find_elements(By.CSS_SELECTOR, ".nav-menu .nav-item span")
    print("Menu options found:", [item.text.strip() for item in menu_items])  # Debug print
    for item in menu_items:
        if item.text.strip() == label:
            item.click()
            return
    raise Exception(f"Menu option '{label}' not found")

@pytest.fixture(scope="function")
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1920,1080")
    driver = webdriver.Chrome(options=options)
    driver.maximize_window()
    yield driver
    driver.quit()

def test_warehouse_manager_gestion_productos(driver):
    login(driver, "warehouse_manager@wusap.com", "WUSAP123")
    click_menu_option(driver, "Gestión de Productos")
    WebDriverWait(driver, 5).until(EC.url_contains("/productos"))
    assert "/productos" in driver.current_url

def test_warehouse_manager_estadisticas_inventario(driver):
    login(driver, "warehouse_manager@wusap.com", "WUSAP123")
    click_menu_option(driver, "Estadísticas Inventario")
    WebDriverWait(driver, 5).until(EC.url_contains("/inventario"))
    assert "/inventario" in driver.current_url

def test_warehouse_manager_inventario(driver):
    login(driver, "warehouse_manager@wusap.com", "WUSAP123")
    click_menu_option(driver, "Inventario")
    WebDriverWait(driver, 5).until(EC.url_contains("/productos-sucursal"))
    assert "/productos-sucursal" in driver.current_url

def test_warehouse_manager_solicitudes(driver):
    login(driver, "warehouse_manager@wusap.com", "WUSAP123")
    click_menu_option(driver, "Solicitudes")
    WebDriverWait(driver, 5).until(EC.url_contains("/solicitudes"))
    assert "/solicitudes" in driver.current_url

def test_warehouse_manager_ordenes_produccion(driver):
    login(driver, "warehouse_manager@wusap.com", "WUSAP123")
    click_menu_option(driver, "Órdenes de Producción")
    WebDriverWait(driver, 5).until(EC.url_contains("/orden-status"))
    assert "/orden-status" in driver.current_url

def test_warehouse_manager_catalogo_productos(driver):
    login(driver, "warehouse_manager@wusap.com", "WUSAP123")
    click_menu_option(driver, "Catálogo de Productos")
    WebDriverWait(driver, 5).until(EC.url_contains("/catalogo-productos"))
    assert "/catalogo-productos" in driver.current_url
