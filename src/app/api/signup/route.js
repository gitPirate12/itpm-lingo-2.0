// app/api/signup/route.js
import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/app/models/User"
import validator from "validator"

export async function POST(request) {
  try {
    await connectDB()
    const { email, password, name, confirmPassword } = await request.json()

    // Validation
    if (!validator.isEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      )
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    const newUser = await User.create({
      email,
      name,
      password
    })

    return NextResponse.json(
      { 
        message: "Sign-up successful",
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          name: newUser.name
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Sign-up error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}