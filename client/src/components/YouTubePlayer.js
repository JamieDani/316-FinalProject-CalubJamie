import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

const YouTubePlayer = ({ playlist = [], initialSong = 0 }) => {
  const playerRef = useRef(null);
  const [currentSong, setCurrentSong] = useState(initialSong);
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
    if (isAPIReady && playlist.length > 0 && !playerRef.current) {
      playerRef.current = new window.YT.Player('youtube-player-container', {
        height: '100%',
        width: '100%',
        videoId: playlist[currentSong],
        playerVars: {
          'playsinline': 1
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    }
  }, [isAPIReady, playlist]);

  const onPlayerReady = (event) => {
    console.log('Player ready');
    event.target.playVideo();
  };

  const onPlayerStateChange = (event) => {
    const playerStatus = event.data;
    console.log("Player state change:", playerStatus);

    if (playerStatus === 0) {
      // Video ended
      console.log("Video ended");
      incSong();
    } else if (playerStatus === 1) {
      console.log("Video playing");
    } else if (playerStatus === 2) {
      console.log("Video paused");
    } else if (playerStatus === 3) {
      console.log("Video buffering");
    }
  };

  const incSong = () => {
    const nextSong = (currentSong + 1) % playlist.length;
    setCurrentSong(nextSong);
    changeSong(nextSong);
  };

  const changeSong = (songIndex) => {
    if (playerRef.current && songIndex >= 0 && songIndex < playlist.length) {
      playerRef.current.loadVideoById(playlist[songIndex]);
      console.log("Changed to song:", songIndex, "videoId:", playlist[songIndex]);
    }
  };

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
