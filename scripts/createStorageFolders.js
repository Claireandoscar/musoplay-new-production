import { createClient } from '@supabase/supabase-js';

// Configure Supabase client
const supabaseUrl = 'https://ptolmaghwdptakcbyumt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0b2xtYWdod2RwdGFrY2J5dW10Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk2NTA1MCwiZXhwIjoyMDUwNTQxMDUwfQ.lCHG4PiUNNZ-8lHlnXHSRX-rRZWubLqZ7n4NnocxgJ8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to get month name
function getMonthName(date) {
  const monthNames = [
    'january', 'february', 'march', 'april', 
    'may', 'june', 'july', 'august',
    'september', 'october', 'november', 'december'
  ];
  return monthNames[date.getMonth()];
}

// Function to create difficulty.json content
function createDifficultyJson(date, difficulty) {
  return JSON.stringify({
    difficulty: difficulty,
    weekday: date.toLocaleDateString('en-US', { weekday: 'long' })
  }, null, 2);
}

// Function to upload difficulty.json
async function uploadDifficultyJson(folderPath, date, difficulty) {
  const difficultyJson = createDifficultyJson(date, difficulty);
  const filePath = `${folderPath}/difficulty.json`;
  
  try {
    const { data, error } = await supabase.storage
      .from('musoplay_melodies')
      .upload(filePath, difficultyJson, {
        contentType: 'application/json',
        upsert: true
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Failed to upload difficulty.json to ${folderPath}:`, error);
    return false;
  }
}

// Function to process both main and warm-up folders
async function processFolders(startDate, endDate) {
  const results = {
    main: { success: [], failed: [], total: 0 },
    warmup: { success: [], failed: [], total: 0 }
  };

  try {
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const isSunday = currentDate.getDay() === 0;
      const monthName = getMonthName(currentDate);
      
      // Process main game folder
      const mainDifficulty = isSunday ? 'difficult' : 'medium';
      const mainFolderPath = `${year}/${monthName}/${year}_${month}_${day}_${mainDifficulty}`;
      
      results.main.total++;
      console.log(`\nProcessing main game folder for ${currentDate.toDateString()} (${mainDifficulty})`);
      
      const mainSuccess = await uploadDifficultyJson(mainFolderPath, currentDate, mainDifficulty);
      if (mainSuccess) {
        results.main.success.push({
          date: currentDate.toDateString(),
          path: mainFolderPath,
          difficulty: mainDifficulty
        });
        console.log(`✓ Successfully created difficulty.json in ${mainFolderPath}`);
      } else {
        results.main.failed.push({
          date: currentDate.toDateString(),
          path: mainFolderPath,
          difficulty: mainDifficulty
        });
        console.log(`✗ Failed to create difficulty.json in ${mainFolderPath}`);
      }

      // Process warm-up folder
      const warmupFolderPath = `${year}/${monthName}/warmup_easy_${year}_${month}_${day}`;
      
      results.warmup.total++;
      console.log(`Processing warm-up folder for ${currentDate.toDateString()}`);
      
      const warmupSuccess = await uploadDifficultyJson(warmupFolderPath, currentDate, 'easy');
      if (warmupSuccess) {
        results.warmup.success.push({
          date: currentDate.toDateString(),
          path: warmupFolderPath,
          difficulty: 'easy'
        });
        console.log(`✓ Successfully created difficulty.json in ${warmupFolderPath}`);
      } else {
        results.warmup.failed.push({
          date: currentDate.toDateString(),
          path: warmupFolderPath,
          difficulty: 'easy'
        });
        console.log(`✗ Failed to create difficulty.json in ${warmupFolderPath}`);
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } catch (error) {
    console.error('Error processing folders:', error);
  }

  return results;
}

// Main execution
async function main() {
  const startDate = new Date(2025, 1, 1);  // February 1, 2025
  const endDate = new Date(2025, 4, 31);   // May 31, 2025
  
  console.log('\n=== Creating difficulty.json files for Both Games ===');
  console.log(`From: ${startDate.toDateString()}`);
  console.log(`To: ${endDate.toDateString()}\n`);

  try {
    const results = await processFolders(startDate, endDate);
    
    console.log('\n=== Main Game Results ===');
    console.log(`Total folders processed: ${results.main.total}`);
    console.log(`Successfully created: ${results.main.success.length}`);
    console.log(`Failed: ${results.main.failed.length}`);
    
    console.log('\n=== Warm-up Game Results ===');
    console.log(`Total folders processed: ${results.warmup.total}`);
    console.log(`Successfully created: ${results.warmup.success.length}`);
    console.log(`Failed: ${results.warmup.failed.length}`);
    
    if (results.main.failed.length > 0 || results.warmup.failed.length > 0) {
      console.log('\nFailed folders:');
      [...results.main.failed, ...results.warmup.failed].forEach(item => 
        console.log(`- ${item.date}: ${item.path} (${item.difficulty})`)
      );
    }
  } catch (error) {
    console.error('Script execution failed:', error);
  }
}

main();