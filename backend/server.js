const express = require('express');
const bodyParser = require('body-parser');
const xlsx = require('node-xlsx').default;
const path = require('path');

const app = express();
const port = 3000;

// Load the Excel data
const excelData = xlsx.parse(path.join(__dirname, 'data.xlsx'))[0].data;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Endpoint to send Excel data to frontend
app.get('/excel-data', (req, res) => {
    res.json(excelData);
});

// Handle form submission
app.post('/predict', (req, res) => {
    const { material, product, color, mrp } = req.body;
    let parsedMRP = parseFloat(mrp);

    // Ensure the user input MRP is within the range [99, 999]
    if (parsedMRP < 99) {
        parsedMRP = 99;
    } else if (parsedMRP > 999) {
        parsedMRP = 999;
    }

    // Filter Excel data for exact matches
    const matchingRows = excelData.filter(row =>
        row[0] === material && 
        row[1] === product && 
        row[2] === color && 
        Math.abs(parseFloat(row[3]) - parsedMRP) < 0.01 // Compare rounded MRP values
    );

    let sellThrough;

    if (matchingRows.length > 0) {
        // Calculate average sell-through
        const totalSellThrough = matchingRows.reduce((acc, row) => acc + parseFloat(row[4]), 0);
        const averageSellThrough = totalSellThrough / matchingRows.length;

        // Calculate adjustment factor based on MRP distance
        const mrpDiff = Math.abs(matchingRows[0][3] - parsedMRP);
        const mrpFactor = 1 - (mrpDiff / 900); // Adjust the factor as needed for the MRP range [99, 999]

        // Adjust sell-through based on adjustment factor
        const adjustedSellThrough = averageSellThrough * mrpFactor;

        // Ensure the sell-through is within the range [10, 100]
        if (adjustedSellThrough < 10) {
            sellThrough = 10;
        } else if (adjustedSellThrough > 100) {
            sellThrough = 100;
        } else {
            sellThrough = Math.round(adjustedSellThrough);
        }
    } else {
        // If no exact match, return a default value
        sellThrough = 50; // You can adjust this value based on your preference
    }

    res.json({ sellThrough: sellThrough });
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
