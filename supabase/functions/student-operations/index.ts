import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // إنشاء Supabase client مع service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { operation, data } = await req.json()

    switch (operation) {
      case "create_or_get_student": {
        const { nickname } = data
        if (!nickname || nickname.trim().length === 0) {
          throw new Error("Nickname is required")
        }

        const { data: student, error } = await supabaseAdmin.rpc(
          "create_or_get_student",
          { p_nickname: nickname.trim() }
        )

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: student[0] }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        )
      }

      case "enroll_student": {
        const { student_id, class_code } = data
        if (!student_id || !class_code) {
          throw new Error("Student ID and class code are required")
        }

        const { data: enrollment, error } = await supabaseAdmin.rpc(
          "enroll_student_in_class",
          {
            p_student_id: student_id,
            p_class_code: class_code.toUpperCase(),
          }
        )

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: enrollment[0] }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        )
      }

      case "create_attempt": {
        const {
          student_id,
          class_code,
          score,
          total,
          answers,
          time_spent = 0,
        } = data

        if (
          !student_id ||
          !class_code ||
          score === undefined ||
          total === undefined
        ) {
          throw new Error(
            "Student ID, class code, score, and total are required"
          )
        }

        const { data: attempt, error } = await supabaseAdmin.rpc(
          "create_training_attempt",
          {
            p_student_id: student_id,
            p_class_code: class_code.toUpperCase(),
            p_score: score,
            p_total: total,
            p_answers: answers || null,
            p_time_spent: time_spent,
          }
        )

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: attempt[0] }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        )
      }

      case "get_attempts": {
        const { student_id, class_code } = data
        if (!student_id || !class_code) {
          throw new Error("Student ID and class code are required")
        }

        const { data: attempts, error } = await supabaseAdmin.rpc(
          "get_student_attempts",
          {
            p_student_id: student_id,
            p_class_code: class_code.toUpperCase(),
          }
        )

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: attempts }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        )
      }

      case "validate_class_code": {
        const { class_code } = data
        if (!class_code) {
          throw new Error("Class code is required")
        }

        const { data: validation, error } = await supabaseAdmin.rpc(
          "validate_class_code",
          { p_class_code: class_code.toUpperCase() }
        )

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: validation[0] }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        )
      }

      default:
        throw new Error(`Unknown operation: ${operation}`)
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    )
  }
})
