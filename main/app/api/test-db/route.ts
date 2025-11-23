import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  console.log("🔥 Testing MongoDB connection...");
  
  try {
    // Try to connect to the database
    await prisma.$connect();
    console.log("✅ Successfully connected to MongoDB");
    
    // Try to count existing profiles
    const profileCount = await prisma.profile.count();
    console.log(`📊 Found ${profileCount} existing profiles`);
    
    // Get all profiles (for debugging)
    const allProfiles = await prisma.profile.findMany();
    console.log("👥 All profiles:", JSON.stringify(allProfiles, null, 2));
    
    return NextResponse.json({ 
      success: true,
      message: 'MongoDB connection successful',
      profileCount,
      profiles: allProfiles
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    return NextResponse.json(
      { 
        error: 'MongoDB connection failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}