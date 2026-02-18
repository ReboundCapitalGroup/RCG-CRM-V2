import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fzievaswtkuguwyscngt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6aWV2YXN3dGt1Z3V3eXNjbmd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNTQxODIsImV4cCI6MjA4NjkzMDE4Mn0.34H67Nn_m0SfqPmpXGauoWvU_rz-x_Ch2K2YcX-Qg00'

export const supabase = createClient(supabaseUrl, supabaseKey)
