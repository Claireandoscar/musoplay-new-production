import { supabase } from './supabase';

export class AudioFetchService {
  constructor() {
    this.publicURL = null;
  }

  async initialize() {
    if (!this.publicURL) {
      const { data } = await supabase.storage.from('musoplay_melodies').getPublicUrl('');
      this.publicURL = data.publicUrl;
      console.log('Storage base URL:', this.publicURL);
    }
  }

  // For main game - daily dates
  getDateParts() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const paddedMonth = String(month + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    
    return {
      year: year.toString(),
      month: monthNames[month],
      paddedMonth,
      day,
      formatted: `${year}_${paddedMonth}_${day}`
    };
  }

  // For warm-up game - weekly dates
  getWeeklyDateParts() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const currentDay = now.getDate();
    const paddedMonth = String(month + 1).padStart(2, '0');
    
    // Using current day for now - can be changed to Friday later
    const paddedDay = String(currentDay).padStart(2, '0');
    
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    
    return {
      year: year.toString(),
      month: monthNames[month],
      paddedMonth,
      day: paddedDay,
      formatted: `${year}_${paddedMonth}_${paddedDay}`
    };
  }

  async fetchSupabaseAudio() {
    try {
      await this.initialize();
      
      const { year, month, formatted } = this.getDateParts();
      const melodyPath = `${year}/${month}/melody_${formatted}`;
      
      // Test bucket access and list files
      const { data: melodyFiles, error: melodyError } = await supabase.storage
        .from('musoplay_melodies')
        .list(melodyPath);

      if (melodyError) {
        console.error('Failed to list melody folder:', melodyError);
        throw melodyError;
      }

      if (!melodyFiles || melodyFiles.length === 0) {
        console.error('No files found in melody folder');
        throw new Error('No files found');
      }

      // Find and sort bar files
      const barFiles = melodyFiles
        .filter(f => f.name.startsWith('bar') && f.name.endsWith('.mp3'))
        .sort((a, b) => {
          const aNum = parseInt(a.name.match(/bar(\d)/)?.[1] || '0');
          const bNum = parseInt(b.name.match(/bar(\d)/)?.[1] || '0');
          return aNum - bNum;
        });

      // Find tune file
      const tuneFile = melodyFiles.find(f => f.name.includes('tune.mp3'));

      if (barFiles.length !== 4 || !tuneFile) {
        throw new Error('Missing required audio files');
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
        date: formatted
      };
    } catch (error) {
      console.error('Supabase fetch failed:', error);
      throw error;
    }
  }

  async fetchWarmupAudio() {
    try {
      await this.initialize();
      
      const { year, month, formatted } = this.getWeeklyDateParts();
      const warmupPath = `${year}/${month}/warmup_${formatted}`;
      
      console.log('Fetching weekly warm-up from:', warmupPath);
      
      const { data: warmupFiles, error: warmupError } = await supabase.storage
        .from('musoplay_melodies')
        .list(warmupPath);

      if (warmupError) {
        console.error('Failed to list warm-up folder:', warmupError);
        throw warmupError;
      }

      if (!warmupFiles || warmupFiles.length === 0) {
        console.error('No files found in warm-up folder');
        throw new Error('No files found');
      }

      // Find and sort bar files
      const barFiles = warmupFiles
        .filter(f => f.name.startsWith('bar') && f.name.endsWith('.mp3'))
        .sort((a, b) => {
          const aNum = parseInt(a.name.match(/bar(\d)/)?.[1] || '0');
          const bNum = parseInt(b.name.match(/bar(\d)/)?.[1] || '0');
          return aNum - bNum;
        });

      // Find tune file
      const tuneFile = warmupFiles.find(f => f.name.includes('tune.mp3'));

      if (barFiles.length !== 4 || !tuneFile) {
        throw new Error('Missing required audio files');
      }

      // Get public URLs for all files
      const melodyParts = await Promise.all(
        barFiles.map(async file => {
          const { data } = await supabase.storage
            .from('musoplay_melodies')
            .getPublicUrl(`${warmupPath}/${file.name}`);
          return data.publicUrl;
        })
      );

      const { data: tuneData } = await supabase.storage
        .from('musoplay_melodies')
        .getPublicUrl(`${warmupPath}/${tuneFile.name}`);

      return {
        melodyParts,
        fullTune: tuneData.publicUrl,
        date: formatted,
        isWeekly: true
      };
    } catch (error) {
      console.error('Weekly warm-up fetch failed:', error);
      throw error;
    }
  }

  async fetchFallbackAudio() {
    console.log('Using fallback audio');
    const fallbackPath = '/assets/audio/testMelodies/2024-12-15';
    return {
      melodyParts: [
        `${fallbackPath}/bar1n1n5n8n3.mp3`,
        `${fallbackPath}/bar2n6QLn5QRn4QLn6QRn5n3.mp3`,
        `${fallbackPath}/bar3n6QLn5QRn4QLn6QRn5n2.mp3`,
        `${fallbackPath}/bar4n3n2QLn3QRn1n1.mp3`
      ],
      fullTune: `${fallbackPath}/test3tune.mp3`,
      date: null
    };
  }

  async fetchWarmupFallbackAudio() {
    console.log('Using warmup fallback audio');
    const fallbackPath = '/assets/audio/testMelodies/warmup-fallback';
    return {
      melodyParts: [
        `${fallbackPath}/bar1n1n5n8n3.mp3`,
        `${fallbackPath}/bar2n6QLn5QRn4QLn6QRn5n3.mp3`,
        `${fallbackPath}/bar3n6QLn5QRn4QLn6QRn5n2.mp3`,
        `${fallbackPath}/bar4n3n2QLn3QRn1n1.mp3`
      ],
      fullTune: `${fallbackPath}/test3tune.mp3`,
      date: null,
      isWeekly: true
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