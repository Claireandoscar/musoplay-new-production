import { supabase } from './supabase';

async function renameFolders() {
  try {
    // List all folders in the root
    const { data: yearFolders, error: yearError } = await supabase.storage
      .from('musoplay_melodies')
      .list();

    if (yearError) throw yearError;

    // Process each year folder
    for (const yearFolder of yearFolders) {
      const { data: monthFolders, error: monthError } = await supabase.storage
        .from('musoplay_melodies')
        .list(yearFolder.name);

      if (monthError) throw monthError;

      // Process each month folder
      for (const monthFolder of monthFolders) {
        const monthPath = `${yearFolder.name}/${monthFolder.name}`;
        const { data: melodyFolders, error: melodyError } = await supabase.storage
          .from('musoplay_melodies')
          .list(monthPath);

        if (melodyError) throw melodyError;

        // Process each melody folder
        for (const folder of melodyFolders) {
          if (folder.name.startsWith('melody_')) {
            // Extract date from folder name
            const dateMatch = folder.name.match(/(\d{4}_\d{2}_\d{2})/);
            if (dateMatch) {
              const date = new Date(dateMatch[1].replace(/_/g, '-'));
              const isSunday = date.getDay() === 0;
              const difficulty = isSunday ? 'difficult' : 'medium';
              
              const newName = folder.name.replace('melody_', `melody_${difficulty}_`);
              
              // Get all files in the folder
              const { data: files } = await supabase.storage
                .from('musoplay_melodies')
                .list(`${monthPath}/${folder.name}`);

              // Move each file to new location
              for (const file of files) {
                const oldPath = `${monthPath}/${folder.name}/${file.name}`;
                const newPath = `${monthPath}/${newName}/${file.name}`;

                // Move file to new location
                const { error: moveError } = await supabase.storage
                  .from('musoplay_melodies')
                  .move(oldPath, newPath);

                if (moveError) console.error(`Error moving ${oldPath}:`, moveError);
                else console.log(`Moved ${oldPath} to ${newPath}`);
              }
            }
          } else if (folder.name.startsWith('warmup_')) {
            // Handle warmup folders (always easy)
            const newName = folder.name.replace('warmup_', 'warmup_easy_');
            
            // Get all files in the folder
            const { data: files } = await supabase.storage
              .from('musoplay_melodies')
              .list(`${monthPath}/${folder.name}`);

            // Move each file to new location
            for (const file of files) {
              const oldPath = `${monthPath}/${folder.name}/${file.name}`;
              const newPath = `${monthPath}/${newName}/${file.name}`;

              const { error: moveError } = await supabase.storage
                .from('musoplay_melodies')
                .move(oldPath, newPath);

              if (moveError) console.error(`Error moving ${oldPath}:`, moveError);
              else console.log(`Moved ${oldPath} to ${newPath}`);
            }
          }
        }
      }
    }

    console.log('Folder renaming complete!');
  } catch (error) {
    console.error('Error in renaming process:', error);
  }
}

// Run the rename operation
renameFolders();