// db/HANA.js

import hanaClient from '@sap/hana-client';
import dotenv from 'dotenv';
dotenv.config();

const connParams = {
  serverNode: process.env.HANA_SERVER_NODE,
  uid: process.env.HANA_USER,
  pwd: process.env.HANA_PASSWORD,
};

const conn = hanaClient.createConnection();

const connectToHana = () => {
  return new Promise((resolve, reject) => {
    conn.connect(connParams, (err) => {
      if (err) return reject(err);
      console.log("✅ Connected to SAP HANA");

      const schema = process.env.HANA_SCHEMA;

      conn.exec(`SET SCHEMA ${schema}`, (err) => {
        if (err) return reject("❌ Error setting schema: " + err);
        console.log(`🔁 Schema set to ${schema}`);
        resolve(conn);
      });
    });
  });
};

export { conn, connectToHana };
