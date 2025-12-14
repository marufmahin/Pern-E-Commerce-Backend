import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const payload = {
    id: '123',
    firstName: 'Maruf',
    lastName: 'Hossen',
    email: 'maruf@gmail.com',
}

const secretKey = crypto.randomBytes(32).toString('hex');

console.log('secret:', secretKey);

const token = jwt.sign(payload, secretKey, { expiresIn: '1h'});

jwt.verify(token, secretKey, (err, decoded) => {
    if(err){
        console.log(err);
    }
    else{
        console.log(decoded);
    }
});

console.log(token);