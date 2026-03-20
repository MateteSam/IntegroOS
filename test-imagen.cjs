
const https = require('https');

const key = 'AIzaSyAd1uhO5mvgV9dW6iqkEboPTUGo7L9JmZA';
// Trying Imagen 4.0 Fast
const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${key}`;

const data = JSON.stringify({
    instances: [
        { prompt: "A futuristic golden hexagon logo, cinematic lighting, 8k resolution, obsidian background" }
    ],
    parameters: {
        sampleCount: 1,
        aspectRatio: "1:1"
    }
});

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Testing Imagen 4.0 Fast...');

const req = https.request(url, options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        try {
            const response = JSON.parse(body);
            if (response.predictions && response.predictions[0] && response.predictions[0].bytesBase64Encoded) {
                console.log("SUCCESS: Image generated (Base64 length: " + response.predictions[0].bytesBase64Encoded.length + ")");
            } else {
                console.log("FAILURE: No image data. Body:", body.substring(0, 500));
            }
        } catch (e) {
            console.log("Error parsing response:", body);
        }
    });
});

req.on('error', (e) => {
    console.error('Error:', e);
});

req.write(data);
req.end();
