// individualUnitSurveillance.test.js
const { JSDOM } = require('jsdom');

// Mock global objects needed for tests
global.WebSocket = class MockWebSocket {
  constructor() {
    this.readyState = 0; // CONNECTING
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) this.onopen();
    }, 10);
  }
  send() {}
  close() {}
};

// Constants used in the component
const BUFFER_WINDOW = 30.0;
const SAMPLING_INTERVAL = 3000;

// Create mocks
const mockMediaSource = {
  readyState: 'open',
  addSourceBuffer: jest.fn(() => mockSourceBuffer),
  removeSourceBuffer: jest.fn(),
  endOfStream: jest.fn(),
};

const mockSourceBuffer = {
  mode: 'segments',
  updating: false,
  buffered: {
    length: 1,
    start: jest.fn(() => 0),
    end: jest.fn(() => 60),
  },
  appendBuffer: jest.fn(),
  remove: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn((event, callback) => {
    if (event === 'updateend') callback();
  }),
  removeEventListener: jest.fn(),
};

const mockVideoElement = {
  src: '',
  currentTime: 30,
  readyState: 4,
  error: null,
  play: jest.fn(() => Promise.resolve()),
  pause: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Setup DOM for testing
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.URL = {
  createObjectURL: jest.fn(() => 'blob:mock-url'),
};

describe('Video Streaming Methods', () => {
  // Helper function to create the context similar to what we have in the component
  function createTestContext() {
    return {
      wsRef: { current: null },
      mediaSourceRef: { current: mockMediaSource },
      sourceBufferRef: { current: mockSourceBuffer },
      videoRef: { current: mockVideoElement },
      pendingBuffersRef: { current: [] },
      isSourceBufferValidRef: { current: true },
      recordedBuffersRef: { current: [] },
      playbackStartedRef: { current: false },
      lastChunkSizeRef: { current: 0 },
      lastChunkTimeRef: { current: Date.now() - 1000 },
      lastSpeedUpdateRef: { current: 0 },
      lastLatencyUpdateRef: { current: 0 },
      seekingBackwardsRef: { current: false },
      lastSeekTimeRef: { current: null },
      connectionTimerRef: { current: null },
      reconnectAttemptsRef: { current: 0 },
      setIsConnected: jest.fn(),
      setCurrentSpeed: jest.fn(),
      setSpeedData: jest.fn(callback => {
        const prevData = [{ time: '00:00', value: 500 }];
        return callback(prevData);
      }),
      setCurrentLatency: jest.fn(),
      setLatencyData: jest.fn(callback => {
        const prevData = [{ time: '00:00', value: 100 }];
        return callback(prevData);
      }),
      setStatusMessage: jest.fn(),
      setIsLive: jest.fn(),
      showStatus: jest.fn(),
    };
  }

  // Extract the methods from your component for testing
  // These functions will use the context created above

  test('cleanupMediaSource should clean up media source and buffers', () => {
    const context = createTestContext();
    
    // Store the original mediaSource for assertions later
    const originalMediaSource = context.mediaSourceRef.current;
  
    function cleanupMediaSource() {
      try {
        if (context.sourceBufferRef.current && context.mediaSourceRef.current && context.mediaSourceRef.current.readyState === 'open') {
          context.isSourceBufferValidRef.current = false;
          
          if (context.sourceBufferRef.current.updating) {
            context.sourceBufferRef.current.abort();
          }
          
          context.mediaSourceRef.current.removeSourceBuffer(context.sourceBufferRef.current);
        }
        
        if (context.mediaSourceRef.current && context.mediaSourceRef.current.readyState === 'open') {
          context.mediaSourceRef.current.endOfStream();
        }
      } catch (e) {
        console.log('Cleanup error - continuing', e);
      }
      
      context.sourceBufferRef.current = null;
      context.mediaSourceRef.current = null;
      context.pendingBuffersRef.current = [];
      context.recordedBuffersRef.current = [];
    }
  
    cleanupMediaSource();
  
    expect(context.isSourceBufferValidRef.current).toBe(false);
    // Use originalMediaSource instead of context.mediaSourceRef.current which is now null
    expect(originalMediaSource.removeSourceBuffer).toHaveBeenCalledWith(mockSourceBuffer);
    expect(originalMediaSource.endOfStream).toHaveBeenCalled();
    expect(context.sourceBufferRef.current).toBeNull();
    expect(context.mediaSourceRef.current).toBeNull();
    expect(context.pendingBuffersRef.current).toEqual([]);
    expect(context.recordedBuffersRef.current).toEqual([]);
  });

  // Test trimBuffer function
  test('trimBuffer should trim the buffer when it exceeds window size', async () => {
    const context = createTestContext();

    async function trimBuffer() {
      const sourceBuffer = context.sourceBufferRef.current;
      const videoElement = context.videoRef.current;
      
      if (!sourceBuffer || !context.isSourceBufferValidRef.current || sourceBuffer.updating || !videoElement) {
        return false;
      }

      const buffered = sourceBuffer.buffered;
      if (buffered.length === 0) return false;

      const currentTime = videoElement.currentTime;
      const start = buffered.start(0);
      const end = buffered.end(0);

      if (end - start > BUFFER_WINDOW && currentTime > BUFFER_WINDOW/2) {
        try {
          const removeEnd = Math.max(currentTime - BUFFER_WINDOW/2, start + 0.5);
          if (removeEnd > start) {
            sourceBuffer.remove(start, removeEnd);
            
            const cutoffTime = Date.now() - (BUFFER_WINDOW * 1000);
            context.recordedBuffersRef.current = context.recordedBuffersRef.current.filter(
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

    // Setup test conditions
    context.sourceBufferRef.current.buffered.start.mockReturnValue(0);
    context.sourceBufferRef.current.buffered.end.mockReturnValue(60); // Buffer is 60 seconds, exceeding BUFFER_WINDOW
    context.videoRef.current.currentTime = 40; // Current time is past BUFFER_WINDOW/2

    // Add some recorded buffers with timestamps
    const now = Date.now();
    context.recordedBuffersRef.current = [
      { timestamp: now - 40000, buffer: new ArrayBuffer(10) },
      { timestamp: now - 20000, buffer: new ArrayBuffer(10) },
      { timestamp: now - 5000, buffer: new ArrayBuffer(10) },
    ];

    const result = await trimBuffer();

    expect(result).toBe(true);
    expect(context.sourceBufferRef.current.remove).toHaveBeenCalledWith(0, 25); // 40 - BUFFER_WINDOW/2 = 25
    expect(context.recordedBuffersRef.current.length).toBe(2); // Oldest buffer should be removed
  });

  // Test processBufferQueue function
  test('processBufferQueue should process pending buffers', async () => {
    const context = createTestContext();

    async function trimBuffer() {
      // Simplified for this test
      return false; // No trimming needed
    }

    async function processBufferQueue() {
      const sourceBuffer = context.sourceBufferRef.current;
      
      if (!sourceBuffer || !context.isSourceBufferValidRef.current || context.pendingBuffersRef.current.length === 0) {
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
          const buffer = context.pendingBuffersRef.current.shift();
          if (buffer) {
            sourceBuffer.appendBuffer(buffer);
          }
        }
      } catch (e) {
        console.log('Buffer append error - resetting', e);
        // Clear pending buffers and restart
        context.pendingBuffersRef.current = [];
      }
    }

    // Setup test
    const mockBuffer1 = new ArrayBuffer(10);
    const mockBuffer2 = new ArrayBuffer(20);
    context.pendingBuffersRef.current = [mockBuffer1, mockBuffer2];

    await processBufferQueue();

    expect(context.sourceBufferRef.current.appendBuffer).toHaveBeenCalledWith(mockBuffer1);
    expect(context.pendingBuffersRef.current.length).toBe(1);
    expect(context.pendingBuffersRef.current[0]).toBe(mockBuffer2);
  });

  // Test findClosestBuffer function
  test('findClosestBuffer should find the buffer closest to target time', () => {
    const context = createTestContext();

    const findClosestBuffer = (targetTime) => {
      const buffers = context.recordedBuffersRef.current;
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
    };

    // Setup test data
    const now = Date.now();
    const buffer1 = { timestamp: now - 10000, buffer: new ArrayBuffer(10) };
    const buffer2 = { timestamp: now - 5000, buffer: new ArrayBuffer(20) };
    const buffer3 = { timestamp: now - 1000, buffer: new ArrayBuffer(30) };
    
    context.recordedBuffersRef.current = [buffer1, buffer2, buffer3];

    // Test finding closest buffer
    const targetTime = now - 6000;
    const result = findClosestBuffer(targetTime);
    
    expect(result).toBe(buffer2); // Buffer2 is closest to targetTime
  });

  // Test handleSeekToTimestamp function
  test('handleSeekToTimestamp should seek to historical footage', () => {
    const context = createTestContext();

    // Simplified version of findClosestBuffer for this test
    const findClosestBuffer = jest.fn((targetTime) => {
      const now = Date.now();
      return { timestamp: now - 5000, buffer: new ArrayBuffer(10) };
    });

    const handleSeekToTimestamp = (timestamp) => {
      if (!context.videoRef.current || !context.mediaSourceRef.current || context.mediaSourceRef.current.readyState !== 'open') {
        return;
      }
      
      // Set flag to indicate we're seeking backwards
      context.seekingBackwardsRef.current = true;
      context.lastSeekTimeRef.current = timestamp;
      
      context.showStatus("Seeking to historical footage...");
      context.setIsLive(false);
      
      // Find the closest buffer to this timestamp
      const closestBuffer = findClosestBuffer(timestamp);
      if (!closestBuffer) {
        context.showStatus("No historical footage available");
        return;
      }
      
      // Get all buffers from this point forward
      const relevantBuffers = context.recordedBuffersRef.current
        .filter(item => item.timestamp >= closestBuffer.timestamp)
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(item => item.buffer);
      
      // Clear existing source buffer and prepare for historical playback
      try {
        const sourceBuffer = context.sourceBufferRef.current;
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
                context.pendingBuffersRef.current = relevantBuffers;
              } catch (e) {
                console.log('Error adding historical buffer', e);
                context.showStatus("Error playing historical footage");
              }
            }
          }, { once: true });
        }
      } catch (e) {
        console.log('Error preparing for historical playback', e);
        context.showStatus("Error preparing historical footage");
      }
    };

    // Setup test data
    const now = Date.now();
    const buffer1 = { timestamp: now - 10000, buffer: new ArrayBuffer(10) };
    const buffer2 = { timestamp: now - 5000, buffer: new ArrayBuffer(20) };
    
    context.recordedBuffersRef.current = [buffer1, buffer2];
    
    // Call function
    handleSeekToTimestamp(now - 6000);
    
    // Verify expected behavior
    expect(context.seekingBackwardsRef.current).toBe(true);
    expect(context.lastSeekTimeRef.current).toBe(now - 6000);
    expect(context.setIsLive).toHaveBeenCalledWith(false);
    expect(context.showStatus).toHaveBeenCalledWith("Seeking to historical footage...");
    expect(context.sourceBufferRef.current.remove).toHaveBeenCalledWith(0, Infinity);
    expect(context.sourceBufferRef.current.addEventListener).toHaveBeenCalled();
  });

  // Test WebSocket message handling logic
  test('WebSocket onmessage should process video chunks and update metrics', async () => {
    const context = createTestContext();
    
    // Mock array buffer for testing
    const mockArrayBuffer = new ArrayBuffer(100000); // 100KB buffer
    const mockBlob = new Blob([mockArrayBuffer]);
    mockBlob.arrayBuffer = jest.fn(() => Promise.resolve(mockArrayBuffer));
    
    // The onmessage handler from the component
    const onMessage = async (event) => {
      if (!(event.data instanceof Blob)) {
        return;
      }

      if (!context.playbackStartedRef.current) {
        context.playbackStartedRef.current = true;
        context.setIsConnected(true);
      }

      try {
        const buffer = await event.data.arrayBuffer();

        // Calculate and update stream speed
        const currentTime = Date.now();
        const chunkSize = buffer.byteLength;
        const timeDiff = currentTime - context.lastChunkTimeRef.current;

        if (timeDiff > 0) {
          // Calculate speed in kbps (kilobits per second)
          const speedKbps = Math.round((chunkSize * 8) / timeDiff);
          context.setCurrentSpeed(speedKbps);
          
          // Only add data points to the chart every SAMPLING_INTERVAL milliseconds
          if (currentTime - context.lastSpeedUpdateRef.current >= SAMPLING_INTERVAL) {
            context.setSpeedData(prevData => {
              const recentValues = prevData.slice(-3).map(item => item.value);
              recentValues.push(speedKbps);
              
              const smoothedValue = recentValues.length > 1 
                ? Math.round((recentValues.reduce((a, b) => a + b, 0) / recentValues.length) * 0.7 + speedKbps * 0.3)
                : speedKbps;
                
              const updatedData = [...prevData, { time: new Date().toLocaleTimeString(), value: smoothedValue }];
              if (updatedData.length > 30) {
                return updatedData.slice(updatedData.length - 30);
              }
              return updatedData;
            });
            
            context.lastSpeedUpdateRef.current = currentTime;
          }

          // Simplified latency estimation
          const estimatedLatency = Math.round(100 + Math.random() * 50);
          context.setCurrentLatency(estimatedLatency);
          
          if (currentTime - context.lastLatencyUpdateRef.current >= SAMPLING_INTERVAL) {
            context.setLatencyData(prevData => {
              const recentValues = prevData.slice(-3).map(item => item.value);
              recentValues.push(estimatedLatency);
              
              const smoothedValue = recentValues.length > 1 
                ? Math.round((recentValues.reduce((a, b) => a + b, 0) / recentValues.length) * 0.7 + estimatedLatency * 0.3)
                : estimatedLatency;
                
              const updatedData = [...prevData, { time: new Date().toLocaleTimeString(), value: smoothedValue }];
              if (updatedData.length > 30) {
                return updatedData.slice(updatedData.length - 30);
              }
              return updatedData;
            });
            
            context.lastLatencyUpdateRef.current = currentTime;
          }
        }

        // Update refs for next calculation
        context.lastChunkSizeRef.current = chunkSize;
        context.lastChunkTimeRef.current = currentTime;
        
        // Store buffer with timestamp for rewind functionality
        const timestamp = Date.now();
        context.recordedBuffersRef.current.push({
          timestamp,
          buffer: buffer.slice(0) // Make copy to ensure it's preserved
        });
        
        // Add to pending buffers if we're viewing live content
        if (context.isSourceBufferValidRef.current && context.mediaSourceRef.current && 
            context.mediaSourceRef.current.readyState === 'open') {
          
          context.pendingBuffersRef.current.push(buffer);
        }
      } catch (e) {
        console.log('Error processing video chunk', e);
      }
    };

    // Create a mock event
    const mockEvent = {
      data: mockBlob
    };

    // Call onMessage
    await onMessage(mockEvent);

    // Verify expectations
    expect(context.playbackStartedRef.current).toBe(true);
    expect(context.setIsConnected).toHaveBeenCalledWith(true);
    expect(context.setCurrentSpeed).toHaveBeenCalled();
    expect(context.setSpeedData).toHaveBeenCalled();
    expect(context.setCurrentLatency).toHaveBeenCalled();
    expect(context.setLatencyData).toHaveBeenCalled();
    expect(context.recordedBuffersRef.current.length).toBe(1);
    expect(context.pendingBuffersRef.current.length).toBe(1);
  });

  // Test handleSeekBackward function
  test('handleSeekBackward should seek 5 seconds back in the video', () => {
    const context = createTestContext();
    
    const handleSeekBackward = () => {
      if (context.videoRef.current) {
        const currentTime = context.videoRef.current.currentTime;
        const buffered = context.sourceBufferRef.current?.buffered;
        
        if (buffered && buffered.length > 0) {
          const bufferStart = buffered.start(0);
          // Make sure we don't seek before the buffer start
          const newTime = Math.max(bufferStart, currentTime - 5);
          context.videoRef.current.currentTime = newTime;
          
          // If we seeked far enough back, we're no longer live
          const bufferEnd = buffered.end(buffered.length - 1);
          if (bufferEnd - newTime > 1.0) {
            context.setIsLive(false);
          }
        }
      }
    };

    // Setup test
    context.videoRef.current.currentTime = 30;
    context.sourceBufferRef.current.buffered.start.mockReturnValue(10);
    context.sourceBufferRef.current.buffered.end.mockReturnValue(60);
    
    // Execute
    handleSeekBackward();
    
    // Verify
    expect(context.videoRef.current.currentTime).toBe(25); // Should be 30 - 5
    expect(context.setIsLive).toHaveBeenCalledWith(false);
  });

  // Test handleSeekForward function
  test('handleSeekForward should seek 5 seconds forward in the video', () => {
    const context = createTestContext();
    
    const handleSeekForward = () => {
      if (context.videoRef.current) {
        const buffered = context.sourceBufferRef.current?.buffered;
        
        if (buffered && buffered.length > 0) {
          const bufferEnd = buffered.end(buffered.length - 1);
          const currentTime = context.videoRef.current.currentTime;
          
          // Calculate new time
          const newTime = Math.min(bufferEnd - 0.5, currentTime + 5);
          context.videoRef.current.currentTime = newTime;
          
          // If we're close to the end of the buffer, we're live
          if (bufferEnd - newTime < 1.0) {
            context.setIsLive(true);
          }
        }
      }
    };

    // Setup test
    context.videoRef.current.currentTime = 30;
    context.sourceBufferRef.current.buffered.start.mockReturnValue(10);
    context.sourceBufferRef.current.buffered.end.mockReturnValue(40);
    
    // Execute
    handleSeekForward();
    
    // Verify
    expect(context.videoRef.current.currentTime).toBe(35); // Should be 30 + 5
    // Not close enough to end to be considered "live"
    expect(context.setIsLive).not.toHaveBeenCalledWith(true);
  });

  // Test handleReturnToLive function
  test('handleReturnToLive should seek to the end of the buffer', () => {
    const context = createTestContext();
    
    const handleReturnToLive = () => {
      if (context.videoRef.current && context.sourceBufferRef.current) {
        const buffered = context.sourceBufferRef.current.buffered;
        if (buffered.length > 0) {
          // Seek to near the end of the buffer
          context.videoRef.current.currentTime = buffered.end(buffered.length - 1) - 0.5;
        }
        context.setIsLive(true);
      }
    };

    // Setup test
    context.sourceBufferRef.current.buffered.end.mockReturnValue(60);
    
    // Execute
    handleReturnToLive();
    
    // Verify
    expect(context.videoRef.current.currentTime).toBe(59.5); // Should be buffer end - 0.5
    expect(context.setIsLive).toHaveBeenCalledWith(true);
  });
});