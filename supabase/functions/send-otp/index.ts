// supabase/functions/send-otp/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const TERMII_API_KEY = Deno.env.get('TERMII_API_KEY')!
const TERMII_SENDER_ID = 'N-Alert'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phoneNumber } = await req.json()

    if (!phoneNumber || !phoneNumber.startsWith('+234')) {
      return new Response(
        JSON.stringify({ error: 'Invalid Nigerian phone number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP (expires in 5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    const { error: dbError } = await supabaseClient
      .from('phone_verifications')
      .upsert({
        phone_number: phoneNumber,
        otp_code: otp,
        expires_at: expiresAt,
        verified: false,
        attempts: 0,
      })

    if (dbError) {
      console.error('Database error:', JSON.stringify(dbError))
      throw new Error(`Failed to store OTP: ${dbError.message}`)
    }

    // Send SMS via Termii
    const termiiResponse = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phoneNumber,
        from: TERMII_SENDER_ID,
        sms: `Your EmilyAgros verification code is: ${otp}. Valid for 5 minutes.`,
        type: 'plain',
        channel: 'dnd',
        api_key: TERMII_API_KEY,
      }),
    })

    const termiiData = await termiiResponse.json()

    if (!termiiResponse.ok) {
      console.error('Termii error:', termiiData)
      throw new Error(termiiData.message || 'Failed to send SMS')
    }

    console.log('OTP sent successfully to', phoneNumber)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent successfully',
        messageId: termiiData.message_id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error:', errorMessage)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})