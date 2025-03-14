import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3003;        


app.use(cors());
app.use(bodyParser.json());


let users = [];
let accounts = [];
let sessions = [];


function generateOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
}



app.post('/users', (req, res) => {
    const { username, password } = req.body;
    const newUser = { id: users.length + 1, username, password };
    users.push(newUser);

    
    const newAccount = { id: accounts.length + 1, userId: newUser.id, amount: 0 };
    accounts.push(newAccount);

    res.status(201).json({ message: "Användare skapad" });
});


app.post('/sessions', (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        const otp = generateOTP();
        sessions.push({ userId: user.id, token: otp });
        res.status(200).json({ otp });
    } else {
        console.error('Login failed: Invalid username or password');
        res.status(401).json({ message: 'Fel användarnamn eller lösenord' });
    }
});


app.post('/me/accounts', (req, res) => {
    const { token } = req.body;
    console.log('Fetch balance attempt with token:', token);
    const session = sessions.find(s => s.token === token);

    if (session) {
        const account = accounts.find(a => a.userId === session.userId);
        res.status(200).json({ saldo: account.amount });
    } else {
        console.error('Invalid OTP');
        res.status(401).json({ message: 'Ogiltigt OTP' });
    }
});


app.post('/me/accounts/transactions', (req, res) => {
    const { token, amount } = req.body;
    console.log('Deposit attempt with token:', token, 'and amount:', amount);
    const session = sessions.find(s => s.token === token);

    if (session) {
        const account = accounts.find(a => a.userId === session.userId);
        account.amount += amount;
        res.status(200).json({ saldo: account.amount });
    } else {
        console.error('Invalid OTP');
        res.status(401).json({ message: 'Ogiltigt OTP' });
    }
});


app.listen(port, () => {
    console.log(`Bankens backend körs på http://localhost:${port}`);
});