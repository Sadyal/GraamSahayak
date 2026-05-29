import React, { useState, useRef } from 'react';
import { Mic, Square, Play, RotateCcw } from 'lucide-react';

const AudioRecorder = ({ onAudioSaved }) => {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Convert to a File object so it can be uploaded via FormData easily
        const audioFile = new File([audioBlob], 'complaint-audio.wav', { type: 'audio/wav' });
        onAudioSaved(audioFile);

        // Stop all audio tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error opening microphone', err);
      alert('Could not access microphone. Please upload an audio file instead or grant permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
      setRecording(false);
    }
  };

  const resetRecording = () => {
    setAudioUrl('');
    setDuration(0);
    onAudioSaved(null);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{
      border: '1px dashed #d1d5db',
      padding: '16px',
      borderRadius: '4px',
      backgroundColor: '#f9fafb',
      marginTop: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {!recording && !audioUrl && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={startRecording}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Mic size={18} />
            Record Audio Complaint
          </button>
        )}

        {recording && (
          <button
            type="button"
            className="btn btn-danger"
            onClick={stopRecording}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Square size={18} fill="#ffffff" />
            Stop Recording ({formatDuration(duration)})
          </button>
        )}

        {audioUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', width: '100%' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>
                ✓ Audio recorded successfully!
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetRecording}
                style={{ padding: '4px 8px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={12} />
                Re-record
              </button>
            </div>
            <audio src={audioUrl} controls style={{ width: '100%', height: '40px' }} />
          </div>
        )}
      </div>
      <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
        Describe your complaint in voice if you prefer not to write it out in detail.
      </p>
    </div>
  );
};

export default AudioRecorder;
