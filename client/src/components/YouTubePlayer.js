import { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';

const YouTubePlayer = ({ videoId = null, onPlayerReady = null, onSongEnd = null, onPlay = null }) => {
  const playerRef = useRef(null);
  const onSongEndRef = useRef(onSongEnd);
  const onPlayRef = useRef(onPlay);
  const [isAPIReady, setIsAPIReady] = useState(false);

  // Keep the refs up to date
  useEffect(() => {
    onSongEndRef.current = onSongEnd;
  }, [onSongEnd]);

  useEffect(() => {
    onPlayRef.current = onPlay;
  }, [onPlay]);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log("YouTube IFrame API Ready");
        setIsAPIReady(true);
      };
    } else if (window.YT && window.YT.Player) {
      setIsAPIReady(true);
    }
  }, []);

  useEffect(() => {
    if (isAPIReady && videoId && !playerRef.current) {
      playerRef.current = new window.YT.Player('youtube-player-container', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          'playsinline': 1
        },
        events: {
          'onReady': onPlayerReadyHandler,
          'onStateChange': onPlayerStateChange
        }
      });
    } else if (playerRef.current && videoId) {
      playerRef.current.loadVideoById(videoId);
      if (onPlayerReady) {
        onPlayerReady(playerRef.current);
      }
    }
  }, [isAPIReady, videoId]);

  const onPlayerReadyHandler = (event) => {
    console.log('Player ready');
    event.target.playVideo();
    if (onPlayerReady) {
      onPlayerReady(event.target);
    }
  };

  const onPlayerStateChange = (event) => {
    // YouTube player state: 0 = ended, 1 = playing, 2 = paused
    if (event.data === 1 && onPlayRef.current) {
      onPlayRef.current();
    } else if (event.data === 0 && onSongEndRef.current) {
      onSongEndRef.current();
    }
  };

  if (!videoId) {
    return (
      <Box
        sx={{
          width: '100%',
          maxWidth: '100%',
          aspectRatio: '16/9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          color: '#fff',
          border: '2px solid #ccc',
          borderRadius: 1
        }}
      >
        <Typography variant="h6">Select a song to play</Typography>
      </Box>
    );
  }

  return (
    <Box
      id="youtube-player-container"
      sx={{
        width: '100%',
        maxWidth: '100%',
        aspectRatio: '16/9',
        '& iframe': {
          width: '100%',
          height: '100%',
          maxWidth: '100%'
        }
      }}
    />
  );
};

export default YouTubePlayer;
