import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

type Database = {
  public: {
    Tables: {
      admin_logs: {
        Row: {
          id: string;
          error_message: string;
          details: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          error_message: string;
          details: Record<string, unknown>;
          created_at?: string;
        };
      };
    };
  };
};

// Add type for difficulty data
type DifficultyData = {
  difficulty: 'easy' | 'medium' | 'difficult';
  weekday: string;
  notes?: string;
};

// Helper function for admin logging
async function logAdminError(
  supabaseClient: SupabaseClient<Database>,
  error: string,
  details: Record<string, unknown> = {}
) {
  try {
    await supabaseClient
      .from('admin_logs')
      .insert({
        error_message: error,
        details,
        created_at: new Date().toISOString()
      });
  } catch (logError) {
    console.error('Failed to log admin error:', logError);
  }
}

// Validates the note sequence in a bar filename
function validateNoteSequence(filename: string): { isValid: boolean; error?: string } {
  const match = filename.match(/^bar[1-4].*\.mp3$/);
  if (!match) {
    return { isValid: false, error: 'Invalid filename format' };
  }
  return { isValid: true };
}

// Add difficulty validation function
function validateDifficultyForDay(difficultyData: DifficultyData, dayOfWeek: number): { isValid: boolean; error?: string } {
  const isSunday = dayOfWeek === 0;
  const expectedDifficulty = isSunday ? 'difficult' : 'medium';

  if (difficultyData.difficulty !== expectedDifficulty) {
    return {
      isValid: false,
      error: `Invalid difficulty level for ${isSunday ? 'Sunday' : 'weekday'}: expected ${expectedDifficulty}, got ${difficultyData.difficulty}`
    };
  }

  return { isValid: true };
}

// Main edge function
Deno.serve(async (_req) => {
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      throw new Error('Missing required environment variables');
    }

    const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey);

    // Get today's date in UTC
    const now = new Date();
    const year = now.getUTCFullYear().toString();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const dayOfWeek = now.getUTCDay(); // Get day of week for difficulty validation
    const folderPath = `${year}/december/melody_${year}_${month}_${day}`;

    // List files in melody folder
    const { data: files, error: listError } = await supabaseAdmin
      .storage
      .from('musoplay_melodies')
      .list(folderPath);

    if (listError) {
      await logAdminError(supabaseAdmin, 'Failed to list melody files', {
        folder: folderPath,
        error: listError
      });
      throw new Error(`Failed to list files: ${listError.message}`);
    }

    if (!files || files.length === 0) {
      await logAdminError(supabaseAdmin, 'No melody files found', {
        folder: folderPath
      });
      throw new Error(`No files found in ${folderPath}`);
    }

    // Check for difficulty.json
    const difficultyFile = files.find((file: { name: string }) => file.name === 'difficulty.json');
    if (!difficultyFile) {
      await logAdminError(supabaseAdmin, 'Missing difficulty.json', {
        folder: folderPath
      });
      throw new Error('Missing difficulty.json file');
    }

    // Read and validate difficulty.json
    const { data: difficultyContent, error: difficultyError } = await supabaseAdmin
      .storage
      .from('musoplay_melodies')
      .download(`${folderPath}/difficulty.json`);

    if (difficultyError || !difficultyContent) {
      await logAdminError(supabaseAdmin, 'Failed to read difficulty.json', {
        folder: folderPath,
        error: difficultyError
      });
      throw new Error('Failed to read difficulty.json');
    }

    const difficultyData: DifficultyData = JSON.parse(await difficultyContent.text());
    const difficultyValidation = validateDifficultyForDay(difficultyData, dayOfWeek);
    
    if (!difficultyValidation.isValid) {
      await logAdminError(supabaseAdmin, 'Invalid difficulty configuration', {
        folder: folderPath,
        error: difficultyValidation.error
      });
      throw new Error(difficultyValidation.error);
    }

    // Your existing melody file validation logic
    const barFiles = files.filter((file: { name: string }) => 
      file.name.match(/^bar[1-4]n.*\.mp3$/));
    
    if (barFiles.length !== 4) {
      await logAdminError(supabaseAdmin, 'Incorrect number of bar files', {
        folder: folderPath,
        found: barFiles.length,
        expected: 4
      });
      throw new Error('Must have exactly 4 bar files');
    }

    const sequenceErrors = barFiles
      .map((file: { name: string }) => {
        const validation = validateNoteSequence(file.name);
        return validation.isValid ? null : {
          file: file.name,
          error: validation.error
        };
      })
      .filter(error => error !== null);

    if (sequenceErrors.length > 0) {
      await logAdminError(supabaseAdmin, 'Invalid note sequences found', {
        folder: folderPath,
        errors: sequenceErrors
      });
      throw new Error('Invalid note sequences in bar files');
    }

    const tuneFile = files.find((file: { name: string }) => 
      file.name.match(/^test[0-9]*tune\.mp3$/));
    
    if (!tuneFile) {
      await logAdminError(supabaseAdmin, 'Missing tune file', {
        folder: folderPath
      });
      throw new Error('Missing complete tune file');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Daily melody verified successfully',
        folderPath,
        difficulty: difficultyData.difficulty,
        barFiles: barFiles.map((f: { name: string }) => f.name),
        tuneFile: tuneFile.name
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});