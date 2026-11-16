import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { createClient } from '@/utils/supabase/server'

export const maxDuration = 45

const CAMPUS_BUILDINGS = [
  'Main Academic Building',
  'Science & Research Complex',
  'Engineering Hall',
  'University Central Library',
  'Student Center & Union',
  'Campus Sports & Recreation Complex',
  'Dining Hall & Cafeteria',
  'Administration & Admissions Block',
  'North Residence Hall',
  'South Residence Hall',
  'Lecture Hall Complex',
  'Advanced Computing Laboratory',
]

const CATEGORIES = [
  'IT & Wi-Fi',
  'Electrical',
  'Plumbing',
  'Lab Equipment',
  'Furniture',
]

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Retrieve user profile if logged in
    let profile: { full_name: string; role: string; email: string } | null = null
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, role, email')
        .eq('id', user.id)
        .single()
      profile = data
    }

    const apiKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GEMINI_API_KEY

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            'Gemini API key is not configured. Please set GOOGLE_GENERATIVE_AI_API_KEY in .env.local and Vercel.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const systemPrompt = `
You are CampusFix AI, the intelligent, warm, and highly capable virtual campus assistant for CampusFix — Smart Campus Issue & Maintenance Portal.
You speak like a knowledgeable, supportive university facility coordinator who is empathetic, professional, clear, and proactive.

Current User Status:
${
  user && profile
    ? `- Logged in as: ${profile.full_name} (${profile.role}, ${profile.email})`
    : '- Visitor (Not logged in)'
}

Campus Facility Context:
- Authorized Buildings: ${CAMPUS_BUILDINGS.join(', ')}
- Maintenance Categories: ${CATEGORIES.join(', ')}
- Urgency Levels: Low, Medium, High, Critical
- Maintenance Teams:
  * IT & Network Support (Wi-Fi, routers, workstations)
  * Electrical Maintenance (lighting, circuit breakers, backup generators)
  * Plumbing & Water Services (pipes, restrooms, water supply)
  * Laboratory Technical Support (fume hoods, instruments)
  * Carpentry & Furniture Repairs (desks, doors, whiteboards)

Your Capabilities:
1. Answer questions about campus facilities, hours, maintenance procedures, and CampusFix features.
2. If a user describes a maintenance issue or asks you to report one (e.g. "My lab AC is leaking" or "Report broken chair in ENG 101"):
   - Extract the parameters:
     * title: short, clear summary (under 60 chars)
     * description: comprehensive description of the problem
     * category: must match one of ('IT & Wi-Fi', 'Electrical', 'Plumbing', 'Lab Equipment', 'Furniture')
     * building: must match one of the authorized campus buildings
     * room_location: specific room or area
     * urgency: one of ('Low', 'Medium', 'High', 'Critical')
   - If details like room number or building are missing, politely ask the user for them first.
   - When you have the details, summarize them for the user and generate a structured issue report block in this EXACT format:
\`\`\`campusfix-report
{
  "title": "Title here",
  "description": "Full description here",
  "category": "Plumbing",
  "building": "Science & Research Complex",
  "room_location": "Lab 204",
  "urgency": "High"
}
\`\`\`
   - Explain that they can review the details and click the "Submit Report" button right inside the chat card to instantly submit it to campus maintenance.

Guidelines:
- Keep responses concise, organized, and friendly.
- Use markdown formatting with bullet points when explaining steps.
- For emergency or critical hazards (sparks, major leaks, smoke), urge the user to call Campus Emergency Services (Ext 911 / 555-0199) immediately.
`

    const formattedMessages = messages.map((m: any) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content as string,
    }))

    const result = streamText({
      model: google('gemini-3-flash-preview'),
      messages: formattedMessages,
      system: systemPrompt,
    })

    return result.toTextStreamResponse()
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
