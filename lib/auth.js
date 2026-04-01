import { SignJWT, jwtVerify } from "jose";
import { connectToDatabase } from "./db";
import User from "../models/User";

const JWT_SECRET = new TextEncoder().encode("SUPER_SECRET_HUMANITIES_KEY_THAT_IS_LONG_ENOUGH");

export async function authenticate(username, password) {
  await connectToDatabase();
  const user = await User.findOne({ username, password });
  return user ? { username: user.username } : null;
}

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}
