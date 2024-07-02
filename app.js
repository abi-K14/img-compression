const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Set up Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files from the public directory
app.use(express.static('public'));

// Handle image upload and compression
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const inputPath = req.file.path;
    const outputPath = path.join('compressed', `${req.file.filename}.jpg`);

    // Use Sharp to compress the image
    sharp(inputPath)
        .resize(800) // Resize image to 800px width, adjust as needed
        .jpeg({ quality: 70 }) // Compress to 70% quality
        .toFile(outputPath, (err, info) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error compressing image');
            }

            // Send the compressed image back to the user
            res.download(outputPath, 'compressed-image.jpg', (err) => {
                if (err) {
                    console.error(err);
                }

                // Delete the original and compressed files after sending the response
                fs.unlink(inputPath, (unlinkErr) => {
                    if (unlinkErr) console.error(unlinkErr);
                });
                fs.unlink(outputPath, (unlinkErr) => {
                    if (unlinkErr) console.error(unlinkErr);
                });
            });
        });
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
