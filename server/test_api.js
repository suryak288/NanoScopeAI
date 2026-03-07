const fs = require('fs');
const path = require('path');

async function testApi() {
    console.log('Testing APIs...');

    try {
        // 1. Get health
        const health = await fetch('http://localhost:3001/api/health').then(r => r.json());
        console.log('Health:', health);

        // 2. Upload dummy file
        const formData = new FormData();
        const blob = new Blob(['dummy content'], { type: 'text/plain' });
        formData.append('file', blob, 'test.txt');

        console.log('Testing upload...');
        const uploadRes = await fetch('http://localhost:3001/api/upload', {
            method: 'POST',
            body: formData
        }).then(r => r.json());
        console.log('Upload Route:', uploadRes);

        // 3. Analyze dummy file
        console.log('Testing analyze...');
        const formDataAnalyze = new FormData();
        const blobAnalyze = new Blob(['dummy content for analysis'], { type: 'image/png' });
        formDataAnalyze.append('file', blobAnalyze, 'test_image.png');

        const analyzeRes = await fetch('http://localhost:3001/api/analyze', {
            method: 'POST',
            body: formDataAnalyze
        }).then(r => r.json());
        console.log('Analyze Route:', analyzeRes);

        // 4. Get specific analysis
        const newId = analyzeRes.data.id;
        console.log(`Testing get specific analysis for ${newId}...`);
        const singleAnalysisRes = await fetch(`http://localhost:3001/api/analysis/${newId}`).then(r => r.json());
        console.log('Single Analysis:', singleAnalysisRes.success);

        // 5. Get all analyses
        console.log('Testing get all analyses...');
        const allAnalysesRes = await fetch('http://localhost:3001/api/analyses').then(r => r.json());
        console.log(`Total Analyses: ${allAnalysesRes.data.length}`);

    } catch (err) {
        console.error('Error during testing:', err);
    }
}

testApi();
