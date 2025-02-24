import jwt from 'jsonwebtoken';

// Generate a JWT
function generateToken(payload: any, secret?: string | null, options?: any): string {
    return jwt.sign(payload, secret, options);
}

// Verify a JWT
function verifyToken(token: string, secret?: any): any {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        throw new Error('Invalid token');
    }
}

// Decode a JWT
function decodeToken(token: string): any {
    return jwt.decode(token);
}

export { generateToken, verifyToken, decodeToken };