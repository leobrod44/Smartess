"use client";

import BackArrowButton from "@/app/components/BackArrowBtn";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Replay5Icon from '@mui/icons-material/Replay5';
import Forward5Icon from '@mui/icons-material/Forward5';
import ConnectionSpeedModal from "@/app/components/IndividualUnitSurveillanceComponents/ConnectionSpeedModal";
import LatencyModal from "@/app/components/IndividualUnitSurveillanceComponents/LatencyModal";

export default function IndividualUnitSurveillancePage({
  params,
}: {
  params: { projectAddress: string; unit_id: string };
}) {
  const { projectAddress, unit_id } = params;

  // const [loading, setLoading] = useState(true);

  const router = useRouter();
  const decodedAddress = decodeURIComponent(projectAddress);

  const [isConnected, setIsConnected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [statusMessage, setStatusMessage] = useState("Initializing...");
  const [isLive, setIsLive] = useState(true);  

  // speed graph --------------------------------------------------------------
  const [isConnectionSpeedModalOpen, setConnectionSpeedModalOpen] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [speedData, setSpeedData] = useState<{ time: string; value: number }[]>([]);
  const lastChunkSizeRef = useRef<number>(0);
  const lastChunkTimeRef = useRef<number>(Date.now());
  const SAMPLING_INTERVAL = 3000; // 3 seconds between data points
  const lastSpeedUpdateRef = useRef<number>(0);
  // ------------------------------------------------------------------------------

  // latency --------------------------------------------------------------
  const [isLatencyModalOpen, setLatencyModalOpen] = useState(false);
  const [currentLatency, setCurrentLatency] = useState(0);
  const [latencyData, setLatencyData] = useState<{ time: string; value: number }[]>([]);
  const lastLatencyUpdateRef = useRef<number>(0);
  // ------------------------------------------------------------------------------

  // websocket -----------------------------------------------------------------
  const wsRef = useRef<WebSocket | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const pendingBuffersRef = useRef<ArrayBuffer[]>([]);
  const isSourceBufferValidRef = useRef<boolean>(false);
  const reconnectAttemptsRef = useRef<number>(0);
  const playbackStartedRef = useRef<boolean>(false);
  const connectionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordedBuffersRef = useRef<{timestamp: number, buffer: ArrayBuffer}[]>([]);
  const lastSeekTimeRef = useRef<number | null>(null);
  const seekingBackwardsRef = useRef<boolean>(false);
  // ------------------------------------------------------------------------------

  const showStatus = useCallback((message: string) => {
    setStatusMessage(message);
    console.log(`Stream status: ${message}`);
  }, []);

  // Create a ref for the restartPlayback function
  const restartPlaybackRef = useRef<(fromLive?: boolean) => void>(() => {});

  // Helper function to find the closest buffer to a timestamp - moved outside useEffect
  const findClosestBuffer = useCallback((targetTime: number) => {
    const buffers = recordedBuffersRef.current;
    if (!buffers.length) return null;
    
    let closest = buffers[0];
    let minDiff = Math.abs(targetTime - closest.timestamp);
    
    for (let i = 1; i < buffers.length; i++) {
      const diff = Math.abs(targetTime - buffers[i].timestamp);
      if (diff < minDiff) {
        minDiff = diff;
        closest = buffers[i];
      }
    }
    
    return closest;
  }, []);

  // Function to reconstruct the buffer for a historical time - now has access to showStatus
  const handleSeekToTimestamp = useCallback((timestamp: number) => {
    if (!videoRef.current || !mediaSourceRef.current || mediaSourceRef.current.readyState !== 'open') {
      return;
    }
    
    // Set flag to indicate we're seeking backwards
    seekingBackwardsRef.current = true;
    lastSeekTimeRef.current = timestamp;
    
    showStatus("Seeking to historical footage...");
    setIsLive(false);
    
    // Find the closest buffer to this timestamp
    const closestBuffer = findClosestBuffer(timestamp);
    if (!closestBuffer) {
      showStatus("No historical footage available");
      return;
    }
    
    // Get all buffers from this point forward
    const relevantBuffers = recordedBuffersRef.current
      .filter(item => item.timestamp >= closestBuffer.timestamp)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(item => item.buffer);
    
    // Clear existing source buffer and prepare for historical playback
    try {
      const sourceBuffer = sourceBufferRef.current;
      if (sourceBuffer) {
        if (sourceBuffer.updating) {
          sourceBuffer.abort();
        }
        
        // Clear the buffer and queue historical buffers
        sourceBuffer.remove(0, Infinity);
        
        sourceBuffer.addEventListener('updateend', function onUpdateEnd() {
          // Only run this once when the remove operation completes
          sourceBuffer.removeEventListener('updateend', onUpdateEnd);
          
          // Now add historical buffers
          if (relevantBuffers.length > 0) {
            try {
              // Add first buffer
              const buffer = relevantBuffers.shift();
              if (buffer) sourceBuffer.appendBuffer(buffer);
              
              // Queue the rest
              pendingBuffersRef.current = relevantBuffers;
            } catch (e) {
              console.log('Error adding historical buffer', e);
              showStatus("Error playing historical footage");
              // Use the ref to the restart function
              restartPlaybackRef.current(true); // Restart to live
            }
          }
        }, { once: true });
      }
    } catch (e) {
      console.log('Error preparing for historical playback', e);
      showStatus("Error preparing historical footage");
      // Use the ref to the restart function
      restartPlaybackRef.current(true); // Restart to live
    }
  }, [showStatus, findClosestBuffer]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/sign-in");
      return;
    }

    // -ESLINT ------- delete later
    setCurrentLatency(Math.floor(Math.random() * 200) + 50);  // Random latency between 50 and 250 ms
    setLatencyData([
      { time: "00:00", value: Math.floor(Math.random() * 200) + 50 },
      { time: "00:01", value: Math.floor(Math.random() * 200) + 50 },
      { time: "00:02", value: Math.floor(Math.random() * 200) + 50 },
    ]);  // Random latency data

    setCurrentSpeed(Math.floor(Math.random() * 1000) + 100);  // Random speed between 100 and 1100 kbps
    setSpeedData([
      { time: "00:00", value: Math.floor(Math.random() * 1000) + 100 },
      { time: "00:01", value: Math.floor(Math.random() * 1000) + 100 },
      { time: "00:02", value: Math.floor(Math.random() * 1000) + 100 },
    ]);  // Random speed data

    setIsConnected(Math.random() > 0.5);
    //-------------------------------



    const MAX_RECONNECT_ATTEMPTS = 20; // Increased for more resilience
    const BUFFER_WINDOW = 30.0; // Increased buffer window to support rewind functionality
    const RECONNECT_DELAY = 3000; // Match the 3-second pattern from logs
    const CONNECTION_TIMEOUT = 10000; // 10 seconds timeout for connection

    function cleanupMediaSource() {
      try {
        if (sourceBufferRef.current && mediaSourceRef.current && mediaSourceRef.current.readyState === 'open') {
          isSourceBufferValidRef.current = false;
          
          if (sourceBufferRef.current.updating) {
            sourceBufferRef.current.abort();
          }
          
          mediaSourceRef.current.removeSourceBuffer(sourceBufferRef.current);
        }
        
        if (mediaSourceRef.current && mediaSourceRef.current.readyState === 'open') {
          mediaSourceRef.current.endOfStream();
        }
      } catch (e) {
        console.log('Cleanup error - continuing', e);
      }
      
      sourceBufferRef.current = null;
      mediaSourceRef.current = null;
      pendingBuffersRef.current = [];
      recordedBuffersRef.current = []; // Clear recorded buffers on cleanup
    }

    async function trimBuffer() {
      const sourceBuffer = sourceBufferRef.current;
      const videoElement = videoRef.current;
      
      if (!sourceBuffer || !isSourceBufferValidRef.current || sourceBuffer.updating || !videoElement) {
        return false;
      }

      const buffered = sourceBuffer.buffered;
      if (buffered.length === 0) return false;

      const currentTime = videoElement.currentTime;
      const start = buffered.start(0);
      const end = buffered.end(0);

      // More conservative buffer management to retain history for rewind
      if (end - start > BUFFER_WINDOW && currentTime > BUFFER_WINDOW/2) {
        try {
          // Keep more buffer before current time to support rewind
          const removeEnd = Math.max(currentTime - BUFFER_WINDOW/2, start + 0.5);
          if (removeEnd > start) {
            sourceBuffer.remove(start, removeEnd);
            
            // Also remove corresponding recorded buffers
            const cutoffTime = Date.now() - (BUFFER_WINDOW * 1000);
            recordedBuffersRef.current = recordedBuffersRef.current.filter(
              item => item.timestamp >= cutoffTime
            );
            
            return true;
          }
        } catch (e) {
          console.log('Buffer trim error', e);
        }
      }
      return false;
    }

    async function processBufferQueue() {
      const sourceBuffer = sourceBufferRef.current;
      
      if (!sourceBuffer || !isSourceBufferValidRef.current || pendingBuffersRef.current.length === 0) {
        return;
      }
      
      if (sourceBuffer.updating) {
        return; // Wait for current operation to finish
      }

      // First priority: trim buffer if needed
      const trimming = await trimBuffer();
      if (trimming) return;

      // If not trimming and not updating, append next buffer
      try {
        if (!sourceBuffer.updating) {
          const buffer = pendingBuffersRef.current.shift();
          if (buffer) {
            sourceBuffer.appendBuffer(buffer);
          }
        }
      } catch (e) {
        console.log('Buffer append error - resetting', e);
        // Clear pending buffers and restart
        pendingBuffersRef.current = [];
        restartPlayback();
      }
    }

    function clearConnectionTimer() {
      if (connectionTimerRef.current) {
        clearTimeout(connectionTimerRef.current);
        connectionTimerRef.current = null;
      }
    }

    function restartPlayback(fromLive = true) {
      // Reset connection and try again
      clearConnectionTimer();
      
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          console.log('Error closing WebSocket', e);
        }
        wsRef.current = null;
      }
      
      // Give the system a moment to clean up
      setTimeout(() => {
        if (fromLive) {
          startPlayback();
          setIsLive(true);
        } else {
          // We're trying to restart from a historical position
          handleSeekToTimestamp(lastSeekTimeRef.current || Date.now() - 5000);
        }
      }, 1000);
    }

    // Store the restartPlayback function in the ref so it can be accessed outside useEffect
    restartPlaybackRef.current = restartPlayback;

    function setConnectionTimer() {
      clearConnectionTimer();
      // Set a timeout to check if we've received data
      connectionTimerRef.current = setTimeout(() => {
        if (!playbackStartedRef.current) {
          console.log('Connection timeout - restarting');
          restartPlayback();
        }
      }, CONNECTION_TIMEOUT);
    }

    function startPlayback() {
      if (!videoRef.current) return;
      
      cleanupMediaSource();
      playbackStartedRef.current = false;
      seekingBackwardsRef.current = false;
      
      // Reset connection status
      setIsConnected(false);
      
      // Create new MediaSource
      const mediaSource = new MediaSource();
      mediaSourceRef.current = mediaSource;
      videoRef.current.src = URL.createObjectURL(mediaSource);

      mediaSource.addEventListener('sourceopen', () => {
        showStatus('MediaSource opened, connecting to stream...');

        try {
          // Try with a more compatible MIME type for video
          const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42001e"');
          sourceBufferRef.current = sourceBuffer;
          sourceBuffer.mode = 'segments';
          isSourceBufferValidRef.current = true;

          sourceBuffer.addEventListener('updateend', () => {
            processBufferQueue();
          });

          // Only connect to WebSocket once source buffer is ready
          connectWebSocket();
          setConnectionTimer();
        } catch (e: unknown) {
          console.log('MediaSource setup error - trying alternative codec', e);
          
          try {
            // Fallback codec
            const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E"');
            sourceBufferRef.current = sourceBuffer;
            sourceBuffer.mode = 'segments';
            isSourceBufferValidRef.current = true;
            
            sourceBuffer.addEventListener('updateend', () => {
              processBufferQueue();
            });
            
            connectWebSocket();
            setConnectionTimer();
          } catch (e2: unknown) {
            console.log('MediaSource setup error - aborting', e2);
            showStatus('Unable to initialize video player');
            cleanupMediaSource();
          }
        }
      });

      mediaSource.addEventListener('sourceended', () => {
        showStatus('Stream ended');
        isSourceBufferValidRef.current = false;
      });

      mediaSource.addEventListener('sourceclose', () => {
        showStatus('Connection closed');
        isSourceBufferValidRef.current = false;
      });
    }

    function keepAliveWebSocket() {
      // Send an empty message periodically to keep the connection alive
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send('ping');
        setTimeout(keepAliveWebSocket, 2000); // Every 2 seconds
      }
    }

    function connectWebSocket() {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          console.log('Error closing WebSocket', e);
        }
      }

      const hostname = window.location.hostname;
      const ws = new WebSocket(`ws://${hostname}:8082/ws`);
      wsRef.current = ws;

      // Set a timeout for the connection attempt
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.log('WebSocket connection timeout - retrying');
          ws.close();
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            connectWebSocket();
          } else {
            showStatus('Failed to connect - please refresh the page');
          }
        }
      }, 5000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        showStatus('Connected to stream');
        reconnectAttemptsRef.current = 0;

        setIsConnected(true);
        
        // Start keep-alive mechanism
        keepAliveWebSocket();
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        
        // If connection closes normally, don't try to reconnect
        if (event.code === 1000) {
          showStatus('Stream connection closed normally');
          return;
        }
        
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const attempts = reconnectAttemptsRef.current + 1;
          showStatus(`Connection lost (${attempts}/${MAX_RECONNECT_ATTEMPTS}) - reconnecting...`);
          reconnectAttemptsRef.current = attempts;
          
          // Use the same reconnect delay as seen in your logs (3 seconds)
          setTimeout(connectWebSocket, RECONNECT_DELAY);
        } else {
          showStatus('Connection lost - max retries reached. Please refresh page.');
          setIsConnected(false);
        }
      };

      ws.onerror = () => {
        // Just log the error but let onclose handle reconnection
        showStatus('WebSocket error occurred');
      };

      ws.onmessage = async (event) => {
        if (!(event.data instanceof Blob)) {
          // Handle potential keep-alive responses
          return;
        }

        // If we got a message, we're successfully connected
        if (!playbackStartedRef.current) {
          playbackStartedRef.current = true;
          clearConnectionTimer();
          setIsConnected(true);
        }

        try {
          const buffer = await event.data.arrayBuffer();

          // Calculate and update stream speed
          const currentTime = Date.now();
          const chunkSize = buffer.byteLength;
          const timeDiff = currentTime - lastChunkTimeRef.current;
    
          if (timeDiff > 0) {
            // Calculate speed in kbps (kilobits per second)
            const speedKbps = Math.round((chunkSize * 8) / timeDiff);
            setCurrentSpeed(speedKbps);
            
            // Only add data points to the chart every SAMPLING_INTERVAL milliseconds
            if (currentTime - lastSpeedUpdateRef.current >= SAMPLING_INTERVAL) {
              const newTime = new Date().toLocaleTimeString();
              
              // Calculate a rolling average for smoother data
              setSpeedData(prevData => {
                // Get the last few values to average (if available)
                const recentValues = prevData.slice(-3).map(item => item.value);
                recentValues.push(speedKbps);
                
                // Calculate a weighted moving average (more weight to current value)
                const smoothedValue = recentValues.length > 1 
                  ? Math.round((recentValues.reduce((a, b) => a + b, 0) / recentValues.length) * 0.7 + speedKbps * 0.3)
                  : speedKbps;
                  
                const updatedData = [...prevData, { time: newTime, value: smoothedValue }];
                // Keep only the last 30 data points
                if (updatedData.length > 30) {
                  return updatedData.slice(updatedData.length - 30);
                }
                return updatedData;
              });
              
              lastSpeedUpdateRef.current = currentTime;
            }

              // Measure latency (you'll need to implement your own approach for latency measurement)
              // This is a simplified example - actual latency measurement would need timestamps from server
              const estimatedLatency = Math.round(100 + Math.random() * 50); // Replace with actual measurement
              setCurrentLatency(estimatedLatency);
              
              // Only add data points to the chart every SAMPLING_INTERVAL milliseconds
              if (currentTime - lastLatencyUpdateRef.current >= SAMPLING_INTERVAL) {
                const newTime = new Date().toLocaleTimeString();
                
                // Calculate a rolling average for smoother data
                setLatencyData(prevData => {
                  // Get the last few values to average (if available)
                  const recentValues = prevData.slice(-3).map(item => item.value);
                  recentValues.push(estimatedLatency);
                  
                  // Calculate a weighted moving average (more weight to current value)
                  const smoothedValue = recentValues.length > 1 
                    ? Math.round((recentValues.reduce((a, b) => a + b, 0) / recentValues.length) * 0.7 + estimatedLatency * 0.3)
                    : estimatedLatency;
                    
                  const updatedData = [...prevData, { time: newTime, value: smoothedValue }];
                  // Keep only the last 30 data points
                  if (updatedData.length > 30) {
                    return updatedData.slice(updatedData.length - 30);
                  }
                  return updatedData;
                });
                
                lastLatencyUpdateRef.current = currentTime;
              }
          }

          // Update refs for next calculation
          lastChunkSizeRef.current = chunkSize;
          lastChunkTimeRef.current = currentTime;
          
          // Store buffer with timestamp for rewind functionality
          const timestamp = Date.now();
          recordedBuffersRef.current.push({
            timestamp,
            buffer: buffer.slice(0) // Make copy to ensure it's preserved
          });
          
          if (isSourceBufferValidRef.current && mediaSourceRef.current && 
              mediaSourceRef.current.readyState === 'open') {
            
            // If we're viewing live content, add to pending buffers
            if (isLive) {
              // Limit buffer queue size to prevent memory issues
              const MAX_PENDING_BUFFERS = 10; // Increased for better buffering
              if (pendingBuffersRef.current.length < MAX_PENDING_BUFFERS) {
                pendingBuffersRef.current.push(buffer);
                
                const sourceBuffer = sourceBufferRef.current;
                if (sourceBuffer && !sourceBuffer.updating) {
                  processBufferQueue();
                }
              }
            }
          }
        } catch (e) {
          console.log('Error processing video chunk', e);
        }
      };
    }

    // Set up video event listeners
    const videoElement = videoRef.current;
    if (videoElement) {
      const handleVideoError = () => {
        const videoError = videoElement.error;
        if (videoError) {
          console.log(`Video error: code=${videoError.code}`);
          
          // For any video error, try to restart
          setTimeout(() => {
            restartPlayback(isLive);
          }, 2000);
        }
      };

      videoElement.addEventListener('error', handleVideoError);

      // Monitor buffering state
      videoElement.addEventListener('waiting', () => {
        if (seekingBackwardsRef.current) {
          showStatus('Seeking to historical footage...');
        } else {
          showStatus('Buffering...');
        }
      });

      videoElement.addEventListener('playing', () => {
        if (seekingBackwardsRef.current) {
          showStatus('Playing historical footage');
          seekingBackwardsRef.current = false;
        } else {
          showStatus('Playing');
        }
        
        // Once playing, we definitely have a connection
        playbackStartedRef.current = true;
        clearConnectionTimer();

        setIsConnected(true);
      });
      
      // Handle stalled playback
      videoElement.addEventListener('stalled', () => {
        if (seekingBackwardsRef.current) {
          showStatus('Seeking stalled - attempting recovery');
          setTimeout(() => {
            if (videoElement.readyState < 3) { // HAVE_FUTURE_DATA = 3
              restartPlayback(false); // Try to restart from historical position
            }
          }, 5000);
        } else {
          showStatus('Stream stalled - attempting to recover');
          setTimeout(() => {
            if (videoElement.readyState < 3) { // HAVE_FUTURE_DATA = 3
              restartPlayback(true);
            }
          }, 5000);
        }
      });
      
      // Listen for seeking to update UI accordingly
      videoElement.addEventListener('seeking', () => {
        const videoTime = videoElement.currentTime;
        const buffered = sourceBufferRef.current?.buffered;
        
        if (buffered && buffered.length > 0) {
          const bufferEnd = buffered.end(buffered.length - 1);
          
          // Check if seeking near the end of the buffer (live)
          if (bufferEnd - videoTime < 1.0) {
            setIsLive(true);
          } else {
            setIsLive(false);
          }
        }
      });
    }

    // Define a more robust visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Page is hidden, pause video but don't fully disconnect
        if (videoRef.current) {
          videoRef.current.pause();
        }
      } else if (document.visibilityState === 'visible') {
        // Page is visible again
        if (videoRef.current) {
          // Check if connection is still active
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            // Just resume playback
            videoRef.current.play().catch(() => {
              // If play fails, restart completely
              restartPlayback();
            });
          } else {
            // Connection lost while away, restart
            restartPlayback();
          }
        } else {
          // Something went wrong with video element, restart
          restartPlayback();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for page beforeunload to properly close connections
    const handleBeforeUnload = () => {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          console.log('Error closing WebSocket', e);
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Start playback when component mounts
    startPlayback();

    // Cleanup when component unmounts
    return () => {
      clearConnectionTimer();
      
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          console.log('Error closing WebSocket', e);
        }
        wsRef.current = null;
      }
      
      cleanupMediaSource();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (videoElement) {
        videoElement.removeEventListener('error', () => {});
        videoElement.removeEventListener('waiting', () => {});
        videoElement.removeEventListener('playing', () => {});
        videoElement.removeEventListener('stalled', () => {});
        videoElement.removeEventListener('seeking', () => {});
      }
    };
  
  }, [router, isLive, showStatus, handleSeekToTimestamp]);

  const handleSeekBackward = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const buffered = sourceBufferRef.current?.buffered;
      
      if (buffered && buffered.length > 0) {
        const bufferStart = buffered.start(0);
        // Make sure we don't seek before the buffer start
        const newTime = Math.max(bufferStart, currentTime - 5);
        videoRef.current.currentTime = newTime;
        
        // If we seeked far enough back, we're no longer live
        const bufferEnd = buffered.end(buffered.length - 1);
        if (bufferEnd - newTime > 1.0) {
          setIsLive(false);
        }
      } else {
        // If no buffer available, use timestamp-based seeking
        const approxTimestamp = Date.now() - 5000; // 5 seconds ago
        handleSeekToTimestamp(approxTimestamp);
      }
    }
  };
  
  const handleSeekForward = () => {
    if (videoRef.current) {
      const buffered = sourceBufferRef.current?.buffered;
      
      if (buffered && buffered.length > 0) {
        const bufferEnd = buffered.end(buffered.length - 1);
        const currentTime = videoRef.current.currentTime;
        
        // Calculate new time
        const newTime = Math.min(bufferEnd - 0.5, currentTime + 5);
        videoRef.current.currentTime = newTime;
        
        // If we're close to the end of the buffer, we're live
        if (bufferEnd - newTime < 1.0) {
          setIsLive(true);
        }
      } else {
        // If seeking forward with no buffer, just go live
        restartPlaybackRef.current(true);
      }
    }
  };

  const handleReturnToLive = () => {
    if (videoRef.current && sourceBufferRef.current) {
      const buffered = sourceBufferRef.current.buffered;
      if (buffered.length > 0) {
        // Seek to near the end of the buffer
        videoRef.current.currentTime = buffered.end(buffered.length - 1) - 0.5;
      }
      setIsLive(true);
    } else {
      restartPlaybackRef.current(true);
    }
  };

  const handleOpenConnectionSpeedModal = () => {
    setConnectionSpeedModalOpen(true);
  };

  const handleCloseConnectionSpeedModal = () => {
    setConnectionSpeedModalOpen(false);
  };  

  const handleOpenLatencyModal = () => {
    setLatencyModalOpen(true);
  };

  const handleCloseLatencyModal = () => {
    setLatencyModalOpen(false);
  };


  //   if (loading) {
  //     return (
  //       <div className="flex justify-center items-center h-screen">
  //         <div className="text-[#14323B] text-lg">Loading unit surveillance page...</div>
  //       </div>
  //     );
  //   }

  return (
    <div>
      <div className="flex-1 border border-black rounded-lg p-6 mx-4 lg:mx-8 min-h-screen flex flex-col">
        {/* Back Arrow Button */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[#325a67] text-[35px] leading-10 tracking-tight">
            {decodedAddress}
          </h1>
          <BackArrowButton />
        </div>
        <h1 className="text-[#729987] text-[25px] leading-10 tracking-tight">
          Unit {unit_id}
        </h1>

        {/* Video Section */}
        <div className="my-5 flex justify-center">
          <div className="rounded-lg bg-[#4b7d8d] p-2 w-full max-w-2xl">
            <div className="bg-white rounded-lg p-2 flex flex-col items-center w-full">
              {/* Video (Full Width) */}
              <video 
                ref={videoRef} 
                className="w-full border border-gray-300 rounded-lg"
                controls 
                autoPlay 
                playsInline 
              />

              {/* Status Message */}
              {statusMessage && (
                <div className="mt-2 text-sm text-gray-600 w-full text-center">
                  {statusMessage}
                </div>
              )}

              {/* Controls & Status Row */}
              <div className="mt-3 w-full flex justify-center relative items-center">
                {/* Live Indicator */}
                {!isLive && (
                  <button 
                    onClick={handleReturnToLive}
                    className="absolute left-2 flex items-center bg-black text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-700"
                  >
                    <div className="w-3 h-3 mr-2 flex items-center justify-center">
                      <div className="border-t-2 border-l-2 border-white w-2 h-2 rotate-[-45deg]"></div>
                    </div>
                    Return to Live
                  </button>
                )}

                {/* Centered Buttons */}
                <div className="flex gap-2 sm:gap-4 ml-2 sm:ml-4">
                  <button 
                    className="p-2 sm:p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition cursor-pointer"
                    onClick={handleSeekBackward}
                  >
                    <Replay5Icon className="text-xl sm:text-2xl" /> 
                  </button>

                  <button 
                    className="p-2 sm:p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition cursor-pointer"
                    onClick={handleSeekForward}
                  >
                    <Forward5Icon className="text-xl sm:text-2xl" />
                  </button>
                </div>

                {/* Status Widget (Far Right) */}
                <div className="absolute right-2 bg-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow flex items-center gap-2 border max-w-fit">
                  <span className="text-xs sm:text-sm font-bold text-black">
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                  <div 
                    className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Title & Description */}
        {!isConnected && (
          <>
            <div className="text-center text-black mb-2">
              <h2 className="text-2xl font-bold">Data Overview - Click to view graphs</h2>
            </div>
            <div className="rounded-lg bg-[#4b7d8d] max-w-[550px] w-full mx-auto max-h-[100px]">
              <div className="grid grid-cols-2 gap-1 h-full text-black">
                {/* Speed Section */}
                <div
                  className="rounded-lg p-2 cursor-pointer hover:bg-[#325a67] flex max-h-[100px]"
                  onClick={() => handleOpenConnectionSpeedModal()}
                >
                  <div className="bg-white rounded-lg p-4 text-center flex flex-col justify-center w-full h-full">
                    <h2 className="text-xl font-bold">Connection Speed</h2>
                    <p className="text-lg">{currentSpeed} kbps</p>
                  </div>
                </div>

                {/* Buffer Health Section */}
                <div
                  className="rounded-lg p-2 cursor-pointer hover:bg-[#325a67] flex max-h-[100px]"
                  onClick={handleOpenLatencyModal}
                >
                  <div className="bg-white rounded-lg p-4 text-center flex flex-col justify-center w-full h-full">
                    <h2 className="text-xl font-bold">Latency</h2>
                    <p className="text-lg">{currentLatency} ms</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Graph Modal */}
        {isConnectionSpeedModalOpen && (
          <ConnectionSpeedModal
            data={speedData}
            onClose={handleCloseConnectionSpeedModal}
          />
        )}

        {/* Latency Modal */}
        {isLatencyModalOpen && (
          <LatencyModal
            data={latencyData}
            onClose={handleCloseLatencyModal}
          />
        )}
      </div>
    </div>
  );
}