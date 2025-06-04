import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Same hashing function as authConfig
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const API_URL = (() => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const isDocker = process.env.DOCKER_ENVIRONMENT === 'true';
  
  if (isDocker) {
    return baseUrl.replace('localhost', 'core-server');
  }
  
  return baseUrl.replace('localhost', '127.0.0.1');
})();

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Hash password using same method as signup/login
    const hashedPassword = await hashPassword(password);

    // Call backend with hashed password
    const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
      token,
      password: hashedPassword
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Reset password API error:', error);
    
    if (error.response) {
      return NextResponse.json(
        error.response.data,
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { error: 'An error occurred while resetting password' },
      { status: 500 }
    );
  }
}
