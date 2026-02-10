const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(express.json());

const CHITKARA_EMAIL = "gautam1203.be23@chitkarauniversity.edu.in";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getFibonacci = (n) => {
    let series = [0, 1];
    for (let i = 2; i < n; i++) series.push(series[i - 1] + series[i - 2]);
    return series.slice(0, n);
};

const isPrime = (num) => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) if (num % i === 0) return false;
    return true;
};

const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
const findHCF = (arr) => arr.reduce((acc, val) => gcd(acc, val));
const findLCM = (arr) => arr.reduce((acc, val) => (acc * val) / gcd(acc, val));

app.get('/health', (req, res) => {
    res.status(200).json({
        is_success: true,
        official_email: CHITKARA_EMAIL
    });
});

app.post('/bfhl', async (req, res) => {
    try {
        const body = req.body;
        const keys = Object.keys(body);

        if (keys.length !== 1) {
            return res.status(400).json({ is_success: false });
        }

        const key = keys[0];
        const input = body[key];
        let result;

        switch (key) {
            case 'fibonacci':
                if (typeof input !== 'number') throw new Error();
                result = getFibonacci(input);
                break;

            case 'prime':
                if (!Array.isArray(input)) throw new Error();
                result = input.filter(num => isPrime(num));
                break;

            case 'lcm':
                if (!Array.isArray(input)) throw new Error();
                result = findLCM(input);
                break;

            case 'hcf':
                if (!Array.isArray(input)) throw new Error();
                result = findHCF(input);
                break;

            case 'AI':
                if (typeof input !== 'string') throw new Error();
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `${input} (Respond in exactly one word)`;
                const aiRes = await model.generateContent(prompt);
                result = aiRes.response.text().trim().split(/\s+/)[0].replace(/[^\w]/g, '');
                break;

            default:
                return res.status(400).json({ is_success: false });
        }

        res.status(200).json({
            is_success: true,
            official_email: CHITKARA_EMAIL,
            data: result
        });

    } catch (error) {
        res.status(400).json({ is_success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);