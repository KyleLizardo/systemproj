import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mxqzohhojkveomcyfxuv.supabase.co"; // Replace with your Supabase URL
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14cXpvaGhvamt2ZW9tY3lmeHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwMDM4MDMsImV4cCI6MjA0NDU3OTgwM30.hVZUxMf-LINa4lLEst63cHnW5yBBps78QAtI0kWm73k"; // Replace with your Supabase Key

export const supabase = createClient(supabaseUrl, supabaseKey);
