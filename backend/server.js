const express = require('express');
const multer = require('multer');
const libre = require('libreoffice-convert');
const cors = require('cors');
const path = require('path');
libre.convertAsync = require('util').promisify(libre.convert);

const app = express();
const port = process.env.PORT || 3001;

// Allow requests from your frontend
app.use(cors());

// Configure multer for file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/convert', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const ext = '.pdf';
    // Convert Excel buffer to PDF using LibreOffice (lightweight mode)
    const pdfBuf = await libre.convertAsync(req.file.buffer, ext, undefined);
    
    // Send back the generated PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Report.pdf"`,
    });
    res.send(pdfBuf);
  } catch (err) {
    console.error(`Error converting file: ${err}`);
    res.status(500).send('Error converting file. Possible OOM issue.');
  }
});

app.get('/health', (req, res) => {
  res.send('LibreOffice Conversion API is running.');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

