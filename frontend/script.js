// frontend/script.js

document.getElementById('sellThroughForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const material = document.getElementById('material').value;
    const product = document.getElementById('product').value;
    const color = document.getElementById('color').value;
    const mrp = document.getElementById('mrp').value;

    const response = await fetch('/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ material, product, color, mrp })
    });

    const data = await response.json();
    document.getElementById('result').innerHTML = `Sell Through: ${data.sellThrough}`;
});
