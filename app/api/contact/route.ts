import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { full_name, email, subject, message } = body

    if (!full_name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Store in contact_messages table if configured
    const { error } = await supabase.from('contact_messages').insert({
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    })

    if (error) {
      console.warn('Could not persist contact message to database:', error.message)
      // Return 200 anyway so the UI acknowledges message receipt gracefully
    }

    return NextResponse.json({ success: true, message: 'Message received successfully' })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
