import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET)

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  let evt: WebhookEvent

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', {
      status: 400,
    })
  }

  const supabase = await createClient()

  // Do something with payload
  // For this guide, log payload to console
  const { id } = evt.data
  const eventType = evt.type

  // Insert user into Supabase when user is created
  if (eventType === 'user.created') {
    const { error } = await supabase.from('users').insert({
      id: id,
      username: evt.data.username ?? evt.data.first_name,
      email: evt.data.email_addresses[0].email_address,
    })

    if (error) {
      console.error('Error: Could not insert user:', error)
      return new Response('Error: Could not insert user', {
        status: 500,
      })
    }
  }

  return new Response('Webhook received', { status: 200 })
}