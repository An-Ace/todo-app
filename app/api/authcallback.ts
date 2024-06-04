import { NextRequest, NextResponse } from 'next/server';
import { WebhookEvent } from "@clerk/nextjs/server"
import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { headers } from 'next/headers'
import { Webhook } from 'svix'

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || ``

async function validateRequest(request: Request) {
  const payloadString = await request.text()
  const headerPayload = headers()

  const svixHeaders = {
    'svix-id': headerPayload.get('svix-id')!,
    'svix-timestamp': headerPayload.get('svix-timestamp')!,
    'svix-signature': headerPayload.get('svix-signature')!,
  }
  const wh = new Webhook(webhookSecret)
  return wh.verify(payloadString, svixHeaders) as WebhookEvent
}

export async function POST(request: NextRequest) {
  const payload = await validateRequest(request)
  console.log(payload)
  if (payload.type === 'user.created') {
    const user = payload.data;

    // Simpan data pengguna ke database
    await db.insert(users).values({
      name: `${user.first_name} ${user.last_name}`,
      user_id: user.id,
      email: user.email_addresses[0].email_address,
    }).execute();

    return NextResponse.json({ message: 'Received' });
  } else {
    return NextResponse.json({ message: 'Unhandled event type' }, { status: 400 });
  }
}