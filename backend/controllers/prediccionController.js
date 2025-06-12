// controllers/prediccionController.js
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function runPythonScript(args = []) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', 'scripts', 'predicciones.py');

    const pyProcess = spawn('python3', [scriptPath, ...args]);

    let output = '';
    let errorOutput = '';

    pyProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pyProcess.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(`Python script exited with code ${code}: ${errorOutput}`));
      }
    });
  });
}

export async function controllerFunction(req, res) {
  try {
    const result = await runPythonScript();
    const parsedResult = JSON.parse(result);
    res.status(200).json(parsedResult); 
  } catch (err) {
    console.error("Error ejecutando script:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

