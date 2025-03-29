import { NextResponse } from "next/server";
import clientPromise from "@/lib/db"; 
import validator from "validator";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const client = await clientPromise; // This resolves to a connected MongoClient
    const db = client.db(); // Call .db() on the resolved client

    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (err) {
      console.error("JSON Parse Error:", err);
      return NextResponse.json(
        { error: "Invalid JSON format", details: err.message },
        { status: 400 }
      );
    }

    const { email, password, name, confirmPassword } = requestBody || {};

    // Validation
    if (!email || !password || !name || !confirmPassword) {
      return NextResponse.json(
        {
          error: "All fields are required",
          missingFields: {
            email: !email,
            password: !password,
            name: !name,
            confirmPassword: !confirmPassword,
          },
        },
        { status: 400 }
      );
    }

    if (!validator.isEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (!/(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}/.test(password)) {
      return NextResponse.json(
        {
          error: "Password too weak",
          details: "Must include uppercase, number, special character, and be at least 8 characters",
        },
        { status: 400 }
      );
    }

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.collection("users").insertOne({
      email,
      name,
      password: hashedPassword,
      emailVerified: null, // For NextAuth compatibility
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Sign-up successful",
        user: {
          id: newUser.insertedId.toString(),
          email,
          name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Sign-up error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}