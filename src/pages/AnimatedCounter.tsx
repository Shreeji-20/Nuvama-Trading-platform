import React, { useState, useRef, useEffect } from "react";

const AnimatedCounter: React.FC = () => {
  const [targetCount, setTargetCount] = useState<number>(100);
  const [targetTime, setTargetTime] = useState<number>(2); // seconds
  const [targetFPS, setTargetFPS] = useState<number>(60); // Target FPS
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [actualTimeTaken, setActualTimeTaken] = useState<number | null>(null);
  const [fastestIterationTime, setFastestIterationTime] = useState<
    number | null
  >(null);
  const [adjustedTime, setAdjustedTime] = useState<number | null>(null);
  const [actualFPS, setActualFPS] = useState<number | null>(null);

  const animationRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const frameTimesRef = useRef<number[]>([]);

  const startAnimation = () => {
    // Reset states
    setCurrentCount(0);
    setActualTimeTaken(null);
    setFastestIterationTime(null);
    setAdjustedTime(null);
    setActualFPS(null);
    frameTimesRef.current = [];

    setIsAnimating(true);
    startTimeRef.current = performance.now();
    const duration = targetTime * 1000; // convert to ms
    const frameInterval = 1000 / targetFPS; // ms per frame
    let lastCount = 0;

    const animate = () => {
      const currentTime = performance.now();

      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Calculate how many counts we should be at based on elapsed time
      const expectedCount = Math.floor(progress * targetCount);

      // Update count - this can increment by more than 1 per frame for high speeds
      if (expectedCount !== lastCount) {
        setCurrentCount(expectedCount);
        lastCount = expectedCount;
      }

      // Track frame times for fastest iteration calculation
      if (frameTimesRef.current.length > 0) {
        const lastFrameTime =
          frameTimesRef.current[frameTimesRef.current.length - 1];
        const frameTime = currentTime - lastFrameTime;
        frameTimesRef.current.push(currentTime);

        // Update fastest iteration time
        if (!fastestIterationTime || frameTime < fastestIterationTime) {
          setFastestIterationTime(frameTime);
        }
      } else {
        frameTimesRef.current.push(currentTime);
      }

      if (progress < 1) {
        // Continue animation
      } else {
        // Animation complete
        setCurrentCount(targetCount);
        setIsAnimating(false);
        setActualTimeTaken(elapsed / 1000); // convert to seconds

        // Calculate actual FPS
        if (frameTimesRef.current.length > 1) {
          const totalTime =
            frameTimesRef.current[frameTimesRef.current.length - 1] -
            frameTimesRef.current[0];
          const fps = (frameTimesRef.current.length / totalTime) * 1000;
          setActualFPS(fps);
        }

        // Calculate fastest iteration time from all frames
        let minFrameTime = Infinity;
        for (let i = 1; i < frameTimesRef.current.length; i++) {
          const frameTime =
            frameTimesRef.current[i] - frameTimesRef.current[i - 1];
          if (frameTime < minFrameTime) {
            minFrameTime = frameTime;
          }
        }
        setFastestIterationTime(minFrameTime);

        // Clear interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    // Use setInterval for precise timing control
    intervalRef.current = setInterval(animate, frameInterval);
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsAnimating(false);
  };

  const resetAnimation = () => {
    stopAnimation();
    setCurrentCount(0);
    setActualTimeTaken(null);
    setFastestIterationTime(null);
    setAdjustedTime(null);
    setActualFPS(null);
    frameTimesRef.current = [];
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Animated Counter with requestAnimationFrame
        </h1>

        {/* Input Section */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Target Count Input */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Target Count
              </label>
              <input
                type="number"
                value={targetCount}
                onChange={(e) =>
                  setTargetCount(Math.max(1, parseInt(e.target.value) || 1))
                }
                disabled={isAnimating}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                min="1"
              />
            </div>

            {/* Target Time Input */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Target Time (seconds)
              </label>
              <input
                type="number"
                value={targetTime}
                onChange={(e) =>
                  setTargetTime(
                    Math.max(0.1, parseFloat(e.target.value) || 0.1)
                  )
                }
                disabled={isAnimating}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                min="0.1"
                step="0.1"
              />
            </div>

            {/* Target FPS Input */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Target FPS
              </label>
              <input
                type="number"
                value={targetFPS}
                onChange={(e) =>
                  setTargetFPS(Math.max(1, parseInt(e.target.value) || 60))
                }
                disabled={isAnimating}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                min="1"
                max="1000"
              />
              <p className="text-xs text-gray-400 mt-1">
                60 = standard, 120+ = high speed
              </p>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={startAnimation}
              disabled={isAnimating}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
            >
              {isAnimating ? "Animating..." : "Start Animation"}
            </button>
            <button
              onClick={stopAnimation}
              disabled={!isAnimating}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Stop
            </button>
            <button
              onClick={resetAnimation}
              disabled={isAnimating}
              className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Counter Display */}
        <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg shadow-2xl p-12 mb-8">
          <div className="text-center">
            <p className="text-gray-300 text-lg mb-4">Current Count</p>
            <p className="text-8xl font-bold text-white mb-4 font-mono">
              {currentCount.toLocaleString()}
            </p>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100"
                style={{ width: `${(currentCount / targetCount) * 100}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {((currentCount / targetCount) * 100).toFixed(1)}% Complete
            </p>
          </div>
        </div>

        {/* Statistics */}
        {(actualTimeTaken !== null || fastestIterationTime !== null) && (
          <div className="bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Actual Time */}
              {actualTimeTaken !== null && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">
                    Actual Time Taken
                  </p>
                  <p className="text-2xl font-bold text-green-400">
                    {actualTimeTaken.toFixed(3)}s
                  </p>
                </div>
              )}

              {/* Fastest Iteration */}
              {fastestIterationTime !== null && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">
                    Fastest Frame Time
                  </p>
                  <p className="text-2xl font-bold text-blue-400">
                    {fastestIterationTime.toFixed(2)}ms
                  </p>
                </div>
              )}

              {/* Total Frames */}
              {frameTimesRef.current.length > 0 && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Total Frames</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {frameTimesRef.current.length}
                  </p>
                </div>
              )}
            </div>

            {/* FPS Display Row */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Actual FPS */}
              {actualFPS !== null && (
                <div className="bg-gradient-to-r from-purple-700 to-pink-700 rounded-lg p-4 border-2 border-purple-500">
                  <p className="text-gray-200 text-sm mb-1">
                    Actual FPS Achieved
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {actualFPS.toFixed(2)} fps
                  </p>
                  <p className="text-gray-300 text-xs mt-1">
                    Target: {targetFPS} fps
                  </p>
                </div>
              )}

              {/* Average FPS (legacy) */}
              {actualTimeTaken !== null && frameTimesRef.current.length > 0 && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">
                    Average FPS (calculated)
                  </p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {(frameTimesRef.current.length / actualTimeTaken).toFixed(
                      2
                    )}{" "}
                    fps
                  </p>
                </div>
              )}
            </div>

            {/* Rate per Second */}
            {actualTimeTaken !== null && (
              <div className="mt-4 bg-gradient-to-r from-green-700 to-emerald-700 rounded-lg p-6 border-2 border-green-500">
                <p className="text-gray-200 text-sm mb-1">
                  Actual Rate per Second
                </p>
                <p className="text-4xl font-bold text-white">
                  {(targetCount / actualTimeTaken).toFixed(2)} counts/sec
                </p>
                <p className="text-gray-300 text-xs mt-2">
                  Target Rate: {(targetCount / targetTime).toFixed(2)}{" "}
                  counts/sec
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedCounter;
