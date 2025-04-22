// db/HANA.js

import hana from '@sap/hana-client';
import dotenv from 'dotenv';
import { createPool } from 'generic-pool';

dotenv.config();

const connParams = {
  serverNode: process.env.HANA_SERVER_NODE,
  uid: process.env.HANA_USER,
  pwd: process.env.HANA_PASSWORD,
};

const factory = {
  create: () =>
    new Promise((resolve, reject) => {
      const conn = hana.createConnection();
      conn.connect(connParams, (err) => {
        if (err) return reject(err);

        conn.exec(`SET SCHEMA ${process.env.HANA_SCHEMA}`, (err) => {
          if (err) return reject("❌ Error setting schema: " + err);
          resolve(conn);
        });
      });
    }),

  destroy: (conn) =>
    new Promise((resolve) => {
      conn.disconnect();
      resolve();
    }),
};

const pool = createPool(factory, {
  max: 10, // Max concurrent DB connections
  min: 2,
  idleTimeoutMillis: 30000,
});

export default pool;