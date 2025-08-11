import * as forge from 'node-forge';
import * as fs from 'fs';
import * as path from 'path';

async function generateSelfSignedCertificateAndKey(
    outputDir: string = './secrets',
    keyFileName: string = 'server.key',
    certFileName: string = 'server.cert',
    days: number = 365,
    commonName: string = 'localhost',
    organization: string = 'My Test Org',
    country: string = 'US',
    state: string = 'New York',
    locality: string = 'New York',
) {
    console.log('Generating keys and certificates...');
    // Generate an RSA key pair
    const keys = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 }); // 2048-bit key is standard
    const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
    const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);

    // Create a new X.509 certificate
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey; // Link the public key to the certificate

    // Set serial number (must be unique for each certificate issued by a CA)
    // For self-signed, it just needs to be a unique identifier.
    cert.serialNumber = '01' + Math.floor(Math.random() * 100000000000).toString(); // Example: random serial
    // Set validity period
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setDate(cert.validity.notBefore.getDate() + days);

    // Set certificate subject (who the certificate belongs to)
    const subjectAttrs = [
        { name: 'commonName', value: commonName },
        { name: 'organizationName', value: organization },
        { name: 'countryName', value: country },
        { name: 'stateOrProvinceName', value: state },
        { name: 'localityName', value: locality }
    ];
    cert.setSubject(subjectAttrs);
    // For a self-signed certificate, the issuer is the same as the subject
    cert.setIssuer(subjectAttrs);

    // Add extensions (important for certificate usage)
    cert.setExtensions([
        // Basic Constraints: Mark this as NOT a CA certificate, as it's for a server
        {
            name: 'basicConstraints',
            cA: false // 'true' if it's a CA certificate, 'false' for end-entity (server/client)
        },
        // Key Usage: Define what the key can be used for
        {
            name: 'keyUsage',
            digitalSignature: true,
            keyEncipherment: true // For TLS key exchange
            // dataEncipherment: true // Can also be included
        },
        // Extended Key Usage: Define specific purposes for the certificate
        {
            name: 'extKeyUsage',
            serverAuth: true // For server authentication (e.g., HTTPS)
            // clientAuth: true // For client authentication
        },
        // Subject Alternative Names (SANs): Crucial for modern browsers,
        // as they prefer SANs over Common Name for host matching.
        // Add your server's domain names or IP addresses here.
        {
            name: 'subjectAltName',
            altNames: [
                { type: 2, value: commonName }, // DNS name type (e.g., 'localhost', 'my-domain.com')
                { type: 7, ip: '127.0.0.1' } // IP Address type
                // { type: 7, ip: '::1' } // IPv6 loopback
            ]
        }
    ]);

    // Self-sign the certificate using the generated private key
    cert.sign(keys.privateKey, forge.md.sha256.create()); // Use SHA-256 for signing hash

    // Ensure the output directory exists
    const fullOutputDir = path.resolve(outputDir);
    if (!fs.existsSync(fullOutputDir)) {
        fs.mkdirSync(fullOutputDir, { recursive: true });
    }

    // Define full paths for the files
    const keyPath = path.join(fullOutputDir, keyFileName);
    const certPath = path.join(fullOutputDir, certFileName);

    // Write the private key to a file
    fs.writeFileSync(keyPath, privateKeyPem, 'utf8');

    // Write the certificate to a file
    fs.writeFileSync(certPath, forge.pki.certificateToPem(cert), 'utf8');
}

export async function generateSecrets() {
    await generateSelfSignedCertificateAndKey('secrets', 'server.key', 'server.cert', 365, 'localhost', 'RBAU', 'AU', 'Victoria', 'Clayton')
    await generateSelfSignedCertificateAndKey('secrets', 'auth.key', 'auth.cert', 365, 'localhost', 'RBAU', 'AU', 'Victoria', 'Clayton')
}