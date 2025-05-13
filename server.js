const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8001;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

// Create the server
const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);
    
    // Handle favicon requests
    if (req.url === '/favicon.ico') {
        res.statusCode = 204;
        res.end();
        return;
    }
    
    // Normalize the URL
    let filePath = req.url;
    if (filePath === '/') {
        filePath = '/index.html';
    }
    
    // Get the absolute file path
    const resolvedPath = path.join(__dirname, filePath);
    
    // Check if the file exists
    fs.access(resolvedPath, fs.constants.F_OK, (err) => {
        if (err) {
            res.statusCode = 404;
            res.end(`File Not Found: ${filePath}`);
            return;
        }
        
        // Get file extension and MIME type
        const extname = path.extname(resolvedPath);
        const contentType = mimeTypes[extname] || 'application/octet-stream';
        
        // Read and serve the file
        fs.readFile(resolvedPath, (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end(`Server Error: ${err.code}`);
                return;
            }
            
            // Set appropriate headers
            res.setHeader('Content-Type', contentType);
            
            // Add Cross-Origin headers for font files
            if (extname === '.ttf' || extname === '.otf' || extname === '.woff' || extname === '.woff2') {
                res.setHeader('Access-Control-Allow-Origin', '*');
            }
            
            // Send the file
            res.statusCode = 200;
            res.end(data);
        });
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});