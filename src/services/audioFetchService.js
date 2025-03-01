import { supabase } from './supabase';

export class AudioFetchService {
  constructor() {
    this.publicURL = null;
    this.monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
  }

  async initialize() {
    if (!this.publicURL) {
      const { data } = await supabase.storage.from('musoplay_melodies').getPublicUrl('');
      this.publicURL = data.publicUrl;
      console.log('Storage base URL:', this.publicURL);
    }
  }

  // For main game - daily dates with difficulty
  getDateParts() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const paddedMonth = String(month + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dayOfWeek = now.getDay();
    const difficulty = dayOfWeek === 0 ? 'difficult' : 'medium';
    
    return {
      year: year.toString(),
      month: paddedMonth,
      monthName: this.monthNames[month],
      day,
      difficulty,
      formatted: `${year}_${paddedMonth}_${day}`
    };
  }

  // For warm-up game - weekly dates (always easy difficulty)
  getWeeklyDateParts() {
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    
    // If it's not Sunday, go back to the most recent Sunday
    const daysToSubtract = currentDay;
    const lastSunday = new Date(now);
    lastSunday.setDate(now.getDate() - daysToSubtract);
    
    const year = lastSunday.getFullYear();
    const month = lastSunday.getMonth();
    const day = String(lastSunday.getDate()).padStart(2, '0');
    const paddedMonth = String(month + 1).padStart(2, '0');
    
    return {
      year: year.toString(),
      month: this.monthNames[month],
      paddedMonth,
      day,
      formatted: `${year}_${paddedMonth}_${day}`
    };
  }

  async fetchSupabaseAudio() {
    try {
      await this.initialize();
      
      const { year, month, day, monthName, formatted, difficulty } = this.getDateParts();
      const melodyPath = `${year}/${monthName}/${year}_${month}_${day}_${difficulty}`;
      
      console.log('Fetching from path:', melodyPath);
      
      const { data: melodyFiles, error: melodyError } = await supabase.storage
        .from('musoplay_melodies')
        .list(melodyPath);

      if (melodyError) {
        console.error('Failed to list melody folder:', melodyError);
        return this.fetchFallbackAudio();
      }

      if (!melodyFiles || melodyFiles.length === 0) {
        console.error('No files found in melody folder');
        return this.fetchFallbackAudio();
      }

      // Find and sort bar files
      const barFiles = melodyFiles
        .filter(f => f.name.startsWith('bar') && f.name.endsWith('.mp3'))
        .sort((a, b) => {
          const aNum = parseInt(a.name.match(/bar(\d)/)?.[1] || '0');
          const bNum = parseInt(b.name.match(/bar(\d)/)?.[1] || '0');
          return aNum - bNum;
        });

      // Find tune file with new naming pattern (e.g., jan01tune.mp3)
      const tuneFile = melodyFiles.find(f => f.name.match(/^[a-z]+\d{2}tune\.mp3$/));

      if (barFiles.length !== 4 || !tuneFile) {
        console.error('Missing required audio files');
        return this.fetchFallbackAudio();
      }

      // Get public URLs for all files
      const melodyParts = await Promise.all(
        barFiles.map(async file => {
          const { data } = await supabase.storage
            .from('musoplay_melodies')
            .getPublicUrl(`${melodyPath}/${file.name}`);
          return data.publicUrl;
        })
      );

      const { data: tuneData } = await supabase.storage
        .from('musoplay_melodies')
        .getPublicUrl(`${melodyPath}/${tuneFile.name}`);

      return {
        melodyParts,
        fullTune: tuneData.publicUrl,
        date: formatted,
        difficulty
      };
    } catch (error) {
      console.error('Supabase fetch failed:', error);
      return this.fetchFallbackAudio();
    }
  }

  // NEW FUNCTION: Add this fetchHistoricalMelody function
  async fetchHistoricalMelody(date) {
    try {
      await this.initialize();
      
      // Extract date parts exactly like the main function
      const year = date.getFullYear();
      const month = date.getMonth();
      const paddedMonth = String(month + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dayOfWeek = date.getDay();
      const difficulty = dayOfWeek === 0 ? 'difficult' : 'medium';
      const monthName = this.monthNames[month];
      const formatted = `${year}_${paddedMonth}_${day}`;
      
      // Log the details to debug
      console.log('Historical date details:', {
        dateObject: date,
        dateString: date.toISOString(),
        year,
        month,
        paddedMonth,
        day,
        dayOfWeek,
        difficulty,
        monthName,
        formatted
      });
      
      // Use the EXACT same path format as fetchSupabaseAudio
      const melodyPath = `${year}/${monthName}/${year}_${paddedMonth}_${day}_${difficulty}`;
      
      console.log('Attempting to fetch from historical path:', melodyPath);
      
      const { data: melodyFiles, error: melodyError } = await supabase.storage
        .from('musoplay_melodies')
        .list(melodyPath);

      // Log more debug info
      console.log('Supabase response:', { 
        hasFiles: melodyFiles && melodyFiles.length > 0,
        fileCount: melodyFiles?.length || 0,
        error: melodyError
      });

      if (melodyError) {
        console.error('Failed to list historical melody folder:', melodyError);
        return this.fetchFallbackAudio();
      }

      if (!melodyFiles || melodyFiles.length === 0) {
        console.error('No files found in historical melody folder');
        return this.fetchFallbackAudio();
      }

      // The rest is unchanged
      const barFiles = melodyFiles
        .filter(f => f.name.startsWith('bar') && f.name.endsWith('.mp3'))
        .sort((a, b) => {
          const aNum = parseInt(a.name.match(/bar(\d)/)?.[1] || '0');
          const bNum = parseInt(b.name.match(/bar(\d)/)?.[1] || '0');
          return aNum - bNum;
        });

      const tuneFile = melodyFiles.find(f => f.name.match(/^[a-z]+\d{2}tune\.mp3$/));

      console.log('Files analysis:', {
        barFiles: barFiles.map(f => f.name),
        tuneFile: tuneFile?.name
      });

      if (barFiles.length !== 4 || !tuneFile) {
        console.error('Missing required historical audio files');
        return this.fetchFallbackAudio();
      }

      const melodyParts = await Promise.all(
        barFiles.map(async file => {
          const { data } = await supabase.storage
            .from('musoplay_melodies')
            .getPublicUrl(`${melodyPath}/${file.name}`);
          return data.publicUrl;
        })
      );

      const { data: tuneData } = await supabase.storage
        .from('musoplay_melodies')
        .getPublicUrl(`${melodyPath}/${tuneFile.name}`);

      return {
        melodyParts,
        fullTune: tuneData.publicUrl,
        date: formatted,
        difficulty,
        isHistorical: true
      };
    } catch (error) {
      console.error('Historical melody fetch failed:', error);
      return this.fetchFallbackAudio();
    }
  }

  async fetchFallbackAudio() {
    console.log('Using fallback audio');
    return {
        melodyParts: [
            '/assets/audio/testMelodies/2024-12-15/bar1n1n5n8n3.mp3',
            '/assets/audio/testMelodies/2024-12-15/bar2n6QLn5QRn4QLn6QRn5n3.mp3',
            '/assets/audio/testMelodies/2024-12-15/bar3n6QLn5QRn4QLn6QRn5n2.mp3',
            '/assets/audio/testMelodies/2024-12-15/bar4n3n2QLn3QRn1n1.mp3'
        ],
        fullTune: '/assets/audio/testMelodies/2024-12-15/test3tune.mp3',
        date: this.getLocalDateString(),
        difficulty: 'medium'
    };
  }

  async fetchWarmupFallbackAudio() {
    console.log('Using warmup fallback audio');
    const fallbackPath = '/assets/audio/testMelodies/warmup-fallback';
    return {
      melodyParts: [
        `${fallbackPath}/bar1n1n2n3n4.mp3`,
        `${fallbackPath}/bar2n5n4n3n2.mp3`,
        `${fallbackPath}/bar3n3n4n5n4.mp3`,
        `${fallbackPath}/bar4n3n2n1n1.mp3`
      ],
      fullTune: `${fallbackPath}/test1tune.mp3`,
      date: this.getLocalWeeklyString(),
      isWeekly: true,
      difficulty: 'easy'
    };
  }

  getLocalDateString() {
    return this.getDateParts().formatted;
  }

  getLocalWeeklyString() {
    return this.getWeeklyDateParts().formatted;
  }
}

export const audioFetchService = new AudioFetchService();