// supabase/functions/verify-otp/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

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
    const { phoneNumber, otp } = await req.json()

    if (!phoneNumber || !otp) {
      return new Response(
        JSON.stringify({ error: 'Phone number and OTP required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get verification record
    const { data: verification, error: fetchError } = await supabaseClient
      .from('phone_verifications')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !verification) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if expired
    if (new Date(verification.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Code has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check attempts (max 3)
    if (verification.attempts >= 3) {
      return new Response(
        JSON.stringify({ error: 'Too many attempts. Request a new code.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify OTP
    if (verification.otp_code !== otp) {
      // Increment attempts
      await supabaseClient
        .from('phone_verifications')
        .update({ attempts: verification.attempts + 1 })
        .eq('id', verification.id)

      return new Response(
        JSON.stringify({ error: 'Invalid code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mark as verified
    await supabaseClient
      .from('phone_verifications')
      .update({ verified: true })
      .eq('id', verification.id)

    // Check if user exists
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('phone', phoneNumber)
      .single()

    let userId: string
    let isNewUser = false

    if (profile) {
      // Existing user
      userId = profile.id
    } else {
      // Create new user
      isNewUser = true
      
      // Generate temp email and password
      const tempEmail = `${phoneNumber.replace(/\D/g, '')}@phone.emilyagros.app`
      const randomPassword = crypto.randomUUID() + crypto.randomUUID()

      const { data: authData, error: signUpError } = await supabaseClient.auth.admin.createUser({
        email: tempEmail,
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          phone: phoneNumber,
          auth_method: 'phone',
        },
      })

      if (signUpError) throw signUpError
      if (!authData.user) throw new Error('Failed to create user')

      userId = authData.user.id

      // Create profile
      await supabaseClient.from('profiles').insert({
        id: userId,
        phone: phoneNumber,
      })
    }

    // Generate session token
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      email: profile ? (await supabaseClient.auth.admin.getUserById(userId)).data.user?.email : `${phoneNumber.replace(/\D/g, '')}@phone.emilyagros.app`,
    })

    if (sessionError) throw sessionError

    return new Response(
      JSON.stringify({ 
        success: true,
        isNewUser,
        userId,
        // Return session data that client can use
        accessToken: sessionData.properties.action_link.split('token=')[1]?.split('&')[0],
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