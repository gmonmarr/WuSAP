import os
import json
import datetime
import sys
import joblib
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from typing import Dict
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from hdbcli import dbapi

from hdbcli import dbapi

def load_env() -> Dict[str, str]:
    """Load environment variables for SAP HANA DB connection."""
    load_dotenv()
    server_node = os.getenv("HANA_SERVER_NODE", "localhost:30015")
    host, port = server_node.split(":")
    return {
        'host': host,
        'port': int(port),
        'user': os.getenv("HANA_USER", "SYSTEM"),
        'password': os.getenv("HANA_PASSWORD", ""),
        'schema': os.getenv("HANA_SCHEMA", "")
    }

def get_connection(db_config: Dict[str, str]):
    """Establish connection to SAP HANA database."""
    try:
        return dbapi.connect(
            address=db_config['host'],
            port=db_config['port'],
            user=db_config['user'],
            password=db_config['password']
        )
    except dbapi.Error as err:
        print(f"Connection Error: {err}", file=sys.stderr)
        exit(1)


def get_sales_data(conn, schema: str) -> pd.DataFrame:
    schema = schema.upper()  
    query = f"""
        SELECT
            SI."SALEITEMID",
            I."PRODUCTID",
            P."NAME" AS PRODUCTNAME,
            E."STOREID",
            TO_DATE(S."SALEDATE") AS SALEDAY,
            SUM(SI."QUANTITY") AS QUANTITY_SOLD
        FROM "{schema}"."SALEITEMS" SI
        JOIN "{schema}"."SALE" S ON SI."SALEID" = S."SALEID"
        JOIN "{schema}"."EMPLOYEES" E ON S."EMPLOYEEID" = E."EMPLOYEEID"
        JOIN "{schema}"."INVENTORY" I ON SI."INVENTORYID" = I."INVENTORYID"
        JOIN "{schema}"."PRODUCTS" P ON I."PRODUCTID" = P."PRODUCTID"
        GROUP BY SI."SALEITEMID", I."PRODUCTID", P."NAME", E."STOREID", TO_DATE(S."SALEDATE")
        ORDER BY SALEDAY
    """
    return pd.read_sql(query, conn)




def get_inventory(conn) -> pd.DataFrame:
    return pd.read_sql("SELECT PRODUCTID, STOREID, QUANTITY FROM WUSAP.INVENTORY", conn)


def preprocess_sales_data(df: pd.DataFrame) -> pd.DataFrame:
    df['SALEDAY'] = pd.to_datetime(df['SALEDAY'])
    df['day_of_week'] = df['SALEDAY'].dt.dayofweek
    df['day'] = df['SALEDAY'].dt.day
    df['month'] = df['SALEDAY'].dt.month
    df['year'] = df['SALEDAY'].dt.year
    df['weekofyear'] = df['SALEDAY'].dt.isocalendar().week
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
    return df



def train_model(df: pd.DataFrame) -> LinearRegression:
    X = df[['PRODUCTID', 'STOREID', 'day_of_week', 'day', 'month', 'year', 'weekofyear', 'is_weekend']]
    y = np.log1p(df['QUANTITY_SOLD']) 
    
    # Revisa si hay NaNs
    print("Datos faltantes en X:", X.isnull().sum(), file=sys.stderr)
    
    # Opciones para manejar NaNs:
    # 1. Quitar filas con NaNs
    X = X.dropna()
    y = y.loc[X.index]

    # o 2. Imputar (rellenar) los NaNs con alguna estrategia (media, mediana, 0, etc)
    # Por ejemplo:
    # X = X.fillna(0)

    X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)

    model = LinearRegression()
    model.fit(X_train, y_train)

    y_pred_log = model.predict(X_test)
    y_test_orig = np.expm1(y_test)
    y_pred_orig = np.expm1(y_pred_log)

    print("=== Model Accuracy ===", file=sys.stderr)
    print(f"MAE: {mean_absolute_error(y_test_orig, y_pred_orig):.2f}", file=sys.stderr)
    print(f"R² Score: {r2_score(y_test_orig, y_pred_orig):.2f}", file=sys.stderr)

    return model


def predict_next_7_days(model, df):
    today = datetime.date.today()
    future_data = []

    product_ids = df['PRODUCTID'].dropna().unique()
    store_ids = df['STOREID'].dropna().unique()

    for i in range(1, 8):
        day = today + datetime.timedelta(days=i)
        for product_id in product_ids:
            for store_id in store_ids:
                future_data.append({
                    'PRODUCTID': int(product_id),
                    'STOREID': int(store_id),
                    'day_of_week': day.weekday(),
                    'day': day.day,
                    'month': day.month,
                    'year': day.year,
                    'weekofyear': day.isocalendar()[1],
                    'is_weekend': int(day.weekday() in [5, 6])
                })

    future_df = pd.DataFrame(future_data)

    # Check for NaNs
    if future_df.isna().any().any():
        print("Warning: NaNs found in future_df before prediction", file=sys.stderr)
        print(future_df.isna().sum(), file=sys.stderr)
        future_df = future_df.fillna(0)  # o decide qué hacer

    # Convert types
    cols = ['PRODUCTID', 'STOREID', 'day_of_week', 'day', 'month', 'year', 'weekofyear', 'is_weekend']
    future_df[cols] = future_df[cols].astype(int)

    future_df['predicted_quantity'] = np.expm1(model.predict(future_df)).round(2)
    return future_df



def get_product_names(conn) -> pd.DataFrame:
    return pd.read_sql("SELECT PRODUCTID, name AS PRODUCTNAME FROM WUSAP.Products", conn)


def get_store_names(conn) -> pd.DataFrame:
    return pd.read_sql("SELECT STOREID, name AS storeName FROM WUSAP.Locations", conn)


def generate_alerts(
    future_df: pd.DataFrame,
    inv_df: pd.DataFrame,
    products_df: pd.DataFrame,
    stores_df: pd.DataFrame,
    low_threshold: int = 0,
    med_threshold: int = 5,
    high_threshold: int = 10
) -> pd.DataFrame:

    alert_df = future_df.groupby(['PRODUCTID', 'STOREID'])['predicted_quantity'].sum().reset_index()
    alert_df = alert_df.merge(inv_df, on=['PRODUCTID', 'STOREID'], how='left').fillna({'QUANTITY': 0})
    alert_df['diff'] = alert_df['predicted_quantity'] - alert_df['QUANTITY']

    def priority(diff):
        if diff > high_threshold:
            return 'Alta'
        elif diff > med_threshold:
            return 'Media'
        elif diff > low_threshold:
            return 'Baja'
        else:
            return 'Default'

    alert_df['priority'] = alert_df['diff'].apply(priority)
    
    alerts = alert_df[alert_df['priority'] != 'Default']

    alerts = alerts.merge(products_df, on='PRODUCTID', how='left')
    alerts = alerts.merge(stores_df, on='STOREID', how='left')
    return alerts[['PRODUCTID', 'PRODUCTNAME', 'STOREID', 'STORENAME', 'predicted_quantity', 'QUANTITY', 'diff', 'priority']]


def main():
    db_config = load_env()
    conn = get_connection(db_config)

    try:
        sales_df = preprocess_sales_data(get_sales_data(conn, db_config['schema']))
        inv_df = get_inventory(conn)
        products_df = get_product_names(conn)
        stores_df = get_store_names(conn)

        if os.path.exists('sales_predictor.joblib'):
            model = joblib.load('sales_predictor.joblib')
            print("Loaded existing model.",  file=sys.stderr)
        else:
            model = train_model(sales_df)
            joblib.dump(model, 'sales_predictor.joblib')
            print("Trained and saved new model.",  file=sys.stderr)

        future_df = predict_next_7_days(model, sales_df)

        alerts_df = generate_alerts(future_df, inv_df, products_df, stores_df)

        output = {
            "success": True,
            "alerts": alerts_df.to_dict(orient='records')
        }
        print(json.dumps(output, indent=2, default=str))

    except Exception as e:
        error_output = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(error_output))
        sys.exit(1)

    finally:
        conn.close()

if __name__ == "__main__":
    main()