import axios from "axios";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { AuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

// Handle API URL for server-side NextAuth calls
// In Docker: convert localhost to core-server for internal networking
// Locally: convert localhost to IPv4 127.0.0.1 to avoid IPv6 issues
const API_URL = (() => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  
  // Check if running in Docker using explicit environment flag
  const isDocker = process.env.DOCKER_ENVIRONMENT === 'true';

  if (isDocker) {
    const dockerUrl = baseUrl.replace('localhost', 'core-server');
    return dockerUrl;
  }
  
  // If running locally, replace localhost with IPv4
  const localUrl = baseUrl.replace('localhost', '127.0.0.1');
  return localUrl;
})();

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined in the environment.");
}

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
    updateAge: 5 * 60 // 5 minutes
  },
  useSecureCookies: false,
  providers: [
    // Sign-In Provider
    CredentialsProvider({
      id: "signin",
      name: "Provider for SignIn",
      credentials: {
        usernameOrEmail: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async credentials => {
        if (!credentials) {
          throw new Error("Credentials not provided.");
        }

        const { usernameOrEmail, password } = credentials;

        try {
          const response = await axios.post(`${API_URL}/api/auth/read-by-name-or-email`, {
            usernameOrEmail
          });

          if (response.status !== 200 || !response.data || response.data?.error) {
            throw new Error("No user found with this username or email.");
          }

          const user = response.data;

          const isValid = await verifyPassword(password, user.password);
          if (!isValid) {
            throw new Error("Invalid password.");
          }

          return { id: user.id, name: user.name };
        } catch (error) {
          const message = (error as Error).message || "Error during sign-in.";
          throw new Error(message);
        }
      }
    }),

    // Sign-Up Provider
    CredentialsProvider({
      id: "signup",
      name: "Provider for SignUp",
      credentials: {
        username: { label: "Username", type: "text" },
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async credentials => {
        if (!credentials) {
          throw new Error("Credentials not provided.");
        }

        const { username, email, password } = credentials;

        try {
          const fetchResponse = await axios.post(`${API_URL}/api/auth/read-by-name-or-by-email`, {
            username,
            email
          });

          if (fetchResponse.status === 200 && fetchResponse.data.exists) {
            throw new Error("Username or email already exists.");
          }

          // Send plain password to backend - let backend handle hashing
          const createResponse = await axios.post(`${API_URL}/api/auth/create`, {
            username,
            email,
            password: password  // Send plain password, not hashed
          });

          if (createResponse.status !== 201 || !createResponse.data) {
            throw new Error("Error creating user.");
          }

          const createdUser = createResponse.data;
          return { id: createdUser.id, name: createdUser.name };
        } catch (error) {
          const message = (error as Error).message || "Error during sign-up.";
          throw new Error(message);
        }
      }
    })
  ],

  jwt: {
    encode({ secret, token }) {
      if (!token) {
        throw new Error("No token to encode.");
      }
      return jwt.sign(token, secret);
    },
    decode({ secret, token }) {
      if (!token) {
        throw new Error("No token to decode.");
      }
      const decodedToken = jwt.verify(token, secret);
      return typeof decodedToken === "string" ? (JSON.parse(decodedToken) as JWT) : decodedToken;
    }
  },

  callbacks: {
    async session(params: { session: Session; token: JWT }) {
      if (params.session.user) {
        params.session.user.id = params.token.sub || "";
        params.session.user.name = params.token.name || "";
      }
      return params.session;
    }
  }
};
