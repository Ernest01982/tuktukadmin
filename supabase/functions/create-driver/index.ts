import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CreateDriverRequest {
  email: string
  password: string
  full_name: string
  phone: string
  make: string
  model: string
  year: string
  color: string
  plate: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Parse request body
    const body: CreateDriverRequest = await req.json()
    const { email, password, full_name, phone, make, model, year, color, plate } = body

    // Validate required fields
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) {
      throw new Error(`Failed to create user: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('Failed to create user: No user returned')
    }

    // 2. Update profile to driver role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        role: 'driver',
        full_name: full_name || null,
        phone: phone || null,
        email: email
      })
      .eq('id', authData.user.id)

    if (profileError) {
      throw new Error(`Failed to update profile: ${profileError.message}`)
    }

    // 3. Create vehicle record if vehicle info provided
    if (make || model || year || color || plate) {
      const { error: vehicleError } = await supabaseAdmin
        .from('vehicles')
        .insert({
          driver_id: authData.user.id,
          make: make || null,
          model: model || null,
          year: year ? parseInt(year) : null,
          color: color || null,
          plate: plate || null
        })

      if (vehicleError) {
        throw new Error(`Failed to create vehicle: ${vehicleError.message}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: authData.user.id,
        message: 'Driver created successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error creating driver:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})