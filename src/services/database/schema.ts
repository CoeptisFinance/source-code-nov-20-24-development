// Authenticator schema
interface Authenticator {
  id: string;
  userId: string;
  credentialID: string;          // Base64URL encoded
  credentialPublicKey: string;   // Base64URL encoded
  counter: number;
  transports?: AuthenticatorTransport[];
  createdAt: Date;
  lastUsed: Date;
}

// User authentication data
interface UserAuth {
  id: string;
  phoneNumber: string;
  authenticators: string[];      // References to authenticator IDs
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
} 