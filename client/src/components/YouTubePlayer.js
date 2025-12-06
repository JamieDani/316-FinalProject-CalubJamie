import { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';

const YouTubePlayer = ({ videoId = null, onPlayerReady = null }) => {
  const playerRef = useRef(null);
  const [isAPIReady, setIsAPIReady] = useState(false);

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
          'onReady': onPlayerReadyHandler
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
