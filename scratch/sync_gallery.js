import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://njpufcpzpcjgfsllaedo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcHVmY3B6cGNqZ2ZzbGxhZWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNjU5MTgsImV4cCI6MjEwNTk0MTkxOH0.dzGN0MmyLxvUHAKkPl2m1lmhh9DX8v81qcFkxdtPEVY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function sync() {
  const jsonPath = path.resolve('src/data/galleryData.json');
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const items = JSON.parse(raw);

  console.log(`Loaded ${items.length} items from galleryData.json`);
  console.log('Pushing to Supabase app_settings table with key "gallery_items"...');

  const { data, error } = await supabase
    .from('app_settings')
    .upsert({
      key: 'gallery_items',
      value: items,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Failed to sync gallery items to Supabase:', error);
  } else {
    console.log('Successfully synced gallery items to Supabase!');
  }
}

sync();
