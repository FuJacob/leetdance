import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  console.log("🔥 sync-user API called!");
  
  try {
    const body = await request.json();
    console.log("📥 Request body:", JSON.stringify(body, null, 2));
    
    const { user } = body;

    if (!user || !user.sub || !user.email) {
      console.error("❌ Invalid user data:", { user });
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    console.log("✅ Valid user data received:");
    console.log("- Auth0 ID:", user.sub);
    console.log("- Email:", user.email);
    console.log("- Name:", user.name);
    console.log("- Picture:", user.picture);

    console.log("🔍 Checking for existing profile...");
    // Check if user profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { auth0Id: user.sub }
    });

    console.log("📊 Existing profile found:", !!existingProfile);
    if (existingProfile) {
      console.log("📊 Existing profile data:", JSON.stringify(existingProfile, null, 2));
    }

    if (!existingProfile) {
      console.log("➕ Creating new user profile...");
      // Create new user profile in database
      const newProfile = await prisma.profile.create({
        data: {
          auth0Id: user.sub,
          email: user.email,
          name: user.name || user.email,
          picture: user.picture || null
        }
      });
      
      console.log("✅ New profile created:", JSON.stringify(newProfile, null, 2));
      return NextResponse.json({ 
        success: true, 
        action: 'created',
        profile: newProfile 
      });
    } else {
      console.log("🔄 Updating existing profile...");
      // Update existing profile with latest info
      const updatedProfile = await prisma.profile.update({
        where: { auth0Id: user.sub },
        data: {
          name: user.name || existingProfile.name,
          picture: user.picture || existingProfile.picture,
          updatedAt: new Date()
        }
      });
      
      console.log("✅ Profile updated:", JSON.stringify(updatedProfile, null, 2));
      return NextResponse.json({ 
        success: true, 
        action: 'updated',
        profile: updatedProfile 
      });
    }

  } catch (error) {
    console.error('❌ Error handling user sync:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to sync user profile', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}