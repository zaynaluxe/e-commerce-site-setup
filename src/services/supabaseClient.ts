import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://hrwhodygibbbvostfvny.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyd2hvZHlnaWJiYnZvc3Rmdm55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODkyNjIsImV4cCI6MjA4ODY2NTI2Mn0.efVJSEf-bdNlbag-QGwzgj9u2ZC7tLIhLqmpk1vIteQ"

export const supabase = createClient(supabaseUrl, supabaseKey)