#!/usr/bin/env node
/**
 * Auto-register Codespaces backend URL to database.
 * Runs automatically via npm scripts - no manual steps needed.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tyxagltygwcvvkcucoeg.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5eGFnbHR5Z3djdnZrY3Vjb2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NTk3NDcsImV4cCI6MjA4MzEzNTc0N30.XDdmj2yabstWLZ6tilOe1QPNSJ3TSdDH2ZLVj33rud0';

function getCodespacesUrl() {
  const name = process.env.CODESPACE_NAME;
  const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
  if (name && domain) {
    return `https://${name}-8000.${domain}`;
  }
  return null;
}

async function registerBackend() {
  const url = process.argv[2] || getCodespacesUrl();
  
  if (!url) {
    console.log('⏭️  Not in Codespaces, skipping backend registration');
    return;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    const { error } = await supabase
      .from('backend_config')
      .upsert({ id: 'default', api_url: url }, { onConflict: 'id' });

    if (error) {
      console.error('❌ Failed to register backend:', error.message);
      return;
    }

    console.log(`✅ Backend registered: ${url}`);
    console.log('   Lovable preview will auto-discover this URL');
  } catch (err) {
    console.error('❌ Registration error:', err.message);
  }
}

await registerBackend();
