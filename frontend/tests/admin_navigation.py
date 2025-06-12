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
    # Wait for admin panel redirect
    WebDriverWait(driver, 10).until(EC.url_contains("/admin"))
    assert "/admin" in driver.current_url

def open_sidebar(driver):
    menu_btn = driver.find_element(By.CLASS_NAME, "menu-button")
    menu_btn.click()
    WebDriverWait(driver, 5).until(EC.visibility_of_element_located((By.CLASS_NAME, "sidebar")))

def click_menu_option(driver, label):
    open_sidebar(driver)
    # Wait for menu items to be visible and populated
    WebDriverWait(driver, 5).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, ".nav-menu .nav-item"))
    )
    # Give a small delay for any dynamic content to load
    driver.implicitly_wait(1)
    
    menu_items = driver.find_elements(By.CSS_SELECTOR, ".nav-menu .nav-item")
    # Debug: Print all menu items and their HTML
    for item in menu_items:
        print(f"\nMenu item HTML: {item.get_attribute('outerHTML')}")
        print(f"Text content: {item.text}")
    
    # Try both direct text and nested span text
    for item in menu_items:
        item_text = item.text.strip()
        # Also try to find nested span if exists
        try:
            span = item.find_element(By.TAG_NAME, "span")
            span_text = span.text.strip()
        except:
            span_text = ""
        
        print(f"Item text: '{item_text}', Span text: '{span_text}'")
        
        if label in (item_text, span_text):
            item.click()
            return
            
    raise Exception(f"Menu option '{label}' not found. Please check the debug output above for available options.")

@pytest.fixture(scope="module")
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1920,1080")
    driver = webdriver.Chrome(options=options)
    driver.maximize_window()
    yield driver
    driver.quit()

def test_admin_initial_redirect(driver):
    login(driver, "admin@wusap.com", "WUSAP123")
    assert "/admin" in driver.current_url

def test_admin_gestionar_usuarios(driver):
    login(driver, "admin@wusap.com", "WUSAP123")
    click_menu_option(driver, "Gestionar Usuarios")
    WebDriverWait(driver, 5).until(EC.url_contains("/lista-usuarios"))
    assert "/lista-usuarios" in driver.current_url

def test_admin_panel(driver):
    login(driver, "admin@wusap.com", "WUSAP123")
    click_menu_option(driver, "Panel Admin")
    WebDriverWait(driver, 5).until(EC.url_contains("/admin"))
    assert "/admin" in driver.current_url

def test_admin_ubicaciones(driver):
    login(driver, "admin@wusap.com", "WUSAP123")
    click_menu_option(driver, "Ubicaciones")
    WebDriverWait(driver, 5).until(EC.url_contains("/admin/locations"))
    assert "/admin/locations" in driver.current_url
