const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/convert', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const id = crypto.randomUUID();
  const inputPath = path.join(__dirname, `${id}.xlsx`);
  const outputPath = path.join(__dirname, `${id}.pdf`);

  try {
    // 1. Save uploaded file to disk
    await fs.writeFile(inputPath, req.file.buffer);

    // 2. Call our Python script to run LibreOffice & calculate formulas
    console.log(`Converting ${id}...`);
    await execPromise(`python3 convert.py "${inputPath}" "${outputPath}"`);

    // 3. Read the generated PDF
    const pdfBuf = await fs.readFile(outputPath);

    // 4. Send back the PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Report.pdf"`,
    });
    res.send(pdfBuf);
  } catch (err) {
    console.error(`Error converting file:`, err);
    res.status(500).send('Error converting file.');
  } finally {
    // 5. Cleanup temp files
    try { await fs.unlink(inputPath); } catch (e) {}
    try { await fs.unlink(outputPath); } catch (e) {}
  }
});

app.get('/health', (req, res) => {
  res.send('Python UNO Conversion API is running.');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

