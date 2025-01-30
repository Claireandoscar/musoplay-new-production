import { createClient } from '@supabase/supabase-js';

// Configure Supabase client
const supabaseUrl = 'https://ptolmaghwdptakcbyumt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0b2xtYWdod2RwdGFrY2J5dW10Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk2NTA1MCwiZXhwIjoyMDUwNTQxMDUwfQ.lCHG4PiUNNZ-8lHlnXHSRX-rRZWubLqZ7n4NnocxgJ8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to get date from folder name
function getDateFromFolderName(folderName) {
  const match = folderName.match(/warmup_easy_(\d{4})_(\d{2})_(\d{2})/);
  if (match) {
    const [_, year, month, day] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  return null;
}

// Function to check if a date is a Sunday
function isSunday(date) {
  return date.getDay() === 0;
}

// Function to get all warm-up folders in a month
async function getWarmupFolders(year, month) {
  const monthNames = [
    'january', 'february', 'march', 'april', 
    'may', 'june', 'july', 'august',
    'september', 'october', 'november', 'december'
  ];
  
  const monthName = monthNames[month];
  const path = `${year}/${monthName}`;
  
  try {
    const { data, error } = await supabase.storage
      .from('musoplay_melodies')
      .list(path);
      
    if (error) throw error;
    
    return data
      .filter(item => item.name.startsWith('warmup_easy_'))
      .map(item => ({
        path: `${path}/${item.name}`,
        date: getDateFromFolderName(item.name)
      }))
      .filter(item => item.date !== null);
  } catch (error) {
    console.error(`Error listing ${path}:`, error);
    return [];
  }
}

// Function to delete a folder and its contents
async function deleteFolder(folderPath) {
  try {
    const { error } = await supabase.storage
      .from('musoplay_melodies')
      .remove([`${folderPath}/difficulty.json`]);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error deleting ${folderPath}:`, error);
    return false;
  }
}

// Main execution
async function main() {
  console.log('\n=== Cleaning up non-Sunday warm-up folders ===\n');
  
  const months = [1, 2, 3, 4]; // February through May
  const year = 2025;
  
  for (const month of months) {
    const folders = await getWarmupFolders(year, month);
    
    // Filter non-Sunday folders
    const nonSundayFolders = folders.filter(folder => !isSunday(folder.date));
    
    if (nonSundayFolders.length > 0) {
      console.log(`\nProcessing ${nonSundayFolders.length} non-Sunday folders in ${month}/2025:`);
      
      for (const folder of nonSundayFolders) {
        const date = folder.date.toDateString();
        console.log(`Removing ${folder.path} (${date})`);
        
        const success = await deleteFolder(folder.path);
        if (success) {
          console.log(`✓ Successfully removed ${folder.path}`);
        } else {
          console.log(`✗ Failed to remove ${folder.path}`);
        }
      }
    }
  }
  
  console.log('\n=== Cleanup Complete ===');
}

main();