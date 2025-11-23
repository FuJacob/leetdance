"use client";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/shadcn-components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shadcn-components/ui/card";
import { Input } from "@/shadcn-components/ui/input";

export default function Home() {
  const [video1, setVideo1] = useState<File | null>(null);
  const [video2, setVideo2] = useState<File | null>(null);
  const [preview1, setPreview1] = useState<string | null>(null);
  const [preview2, setPreview2] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const [loading, setLoading] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setVideo: (file: File | null) => void,
    setPreview: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0] || null;
    setVideo(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video1 || !video2) {
      alert("Please upload both videos.");
      return;
    }

    setLoading(true);
    setError(null);
    setProcessedVideoUrl(null);

    try {
      // Step 1: Analyze videos
      const formData1 = new FormData();
      formData1.append("video1", video1);
      formData1.append("video2", video2);

      console.log("Analyzing videos...");
      const analyzeResponse = await fetch(
        "http://localhost:8000/upload-and-analyze",
        {
          method: "POST",
          body: formData1,
        }
      );

      if (!analyzeResponse.ok) {
        throw new Error(`Analysis failed: ${analyzeResponse.status}`);
      }

      const analyzeResult = await analyzeResponse.json();
      console.log("Analysis result:", analyzeResult);

      // Step 2: Process video directly with analysis
      const formData2 = new FormData();
      // Try to extract the actual analysis text, not the object
      let analysisText = "";
      if (typeof analyzeResult.response === "string") {
        analysisText = analyzeResult.response;
      } else if (analyzeResult.response) {
        analysisText = JSON.stringify(analyzeResult.response);
      } else {
        analysisText = JSON.stringify(analyzeResult);
      }

      formData2.append("dance_analysis", analysisText);
      formData2.append("video_file", video2);

      console.log("Processing video with analysis...");
      const processResponse = await fetch(
        "http://localhost:8000/process-dance-video",
        {
          method: "POST",
          body: formData2,
        }
      );

      if (!processResponse.ok) {
        const errorText = await processResponse.text();
        console.error("Process response error:", errorText);
        throw new Error(
          `Processing failed: ${processResponse.status} - ${errorText}`
        );
      }

      // Get the processed video
      const videoBlob = await processResponse.blob();
      console.log("Video blob size:", videoBlob.size, "type:", videoBlob.type);

      // DEBUG: Additional blob debugging
      console.log("DEBUG: Full blob details:", {
        size: videoBlob.size,
        type: videoBlob.type,
      });

      // DEBUG: Try to inspect the blob as ArrayBuffer first few bytes
      const arrayBuffer = await videoBlob.slice(0, 100).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      console.log(
        "DEBUG: First 20 bytes of video blob:",
        Array.from(uint8Array.slice(0, 20))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(" ")
      );

      // Check if blob looks like a video file (should start with video magic bytes)
      const firstBytes = Array.from(uint8Array.slice(0, 8));
      console.log(
        "DEBUG: First 8 bytes as hex:",
        firstBytes.map((b) => b.toString(16).padStart(2, "0")).join(" ")
      );

      const videoUrl = URL.createObjectURL(videoBlob);
      console.log("DEBUG: Created blob URL:", videoUrl);
      setProcessedVideoUrl(videoUrl);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Recording functions
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStream(stream);
      recordedChunksRef.current = [];
      const mediaRecorder = new window.MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        const file = new File([blob], "recorded-video.webm", {
          type: "video/webm",
        });
        setVideo2(file);
        setPreview2(URL.createObjectURL(blob));
        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop());
          setMediaStream(null);
        }
      };
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      alert("Could not access camera: " + err);
    }
  };

  const handleStopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  useEffect(() => {
    if (recording && videoPreviewRef.current && mediaStream) {
      (videoPreviewRef.current as any).srcObject = mediaStream;
    }
    if (!recording && videoPreviewRef.current) {
      (videoPreviewRef.current as any).srcObject = null;
    }
  }, [recording, mediaStream]);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-8 space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-slate-800">
            🎯 Dance Video Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Video 1 Upload */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Reference Video:
              </label>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, setVideo1, setPreview1)}
                className="mb-3"
              />
              {preview1 && (
                <video
                  src={preview1}
                  controls
                  className="w-full max-w-xs rounded-lg border"
                />
              )}
            </div>

            {/* Video 2 Recording */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-3 block">
                Your Dance (Record):
              </label>

              {!preview2 && !recording && (
                <Button
                  type="button"
                  onClick={handleStartRecording}
                  className="bg-green-600 hover:bg-green-700 text-white mb-3"
                >
                  Start Recording
                </Button>
              )}

              {recording && (
                <div className="mb-3">
                  <video
                    ref={videoPreviewRef}
                    autoPlay
                    muted
                    className="w-full max-w-xs rounded-lg border mb-3"
                  />
                  <Button
                    type="button"
                    onClick={handleStopRecording}
                    variant="destructive"
                  >
                    Stop Recording
                  </Button>
                </div>
              )}

              {preview2 && !recording && (
                <video
                  src={preview2}
                  controls
                  className="w-full max-w-xs rounded-lg border"
                />
              )}
            </div>

            <Button
              type="submit"
              disabled={!video1 || !video2 || loading}
              className="w-full text-lg py-3"
            >
              {loading ? "🔄 Processing..." : "🚀 Analyze & Process Videos"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-700">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processed Video Display */}
      {processedVideoUrl && (
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              🎯 Your Processed Dance Video
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <video
              src={processedVideoUrl}
              controls
              preload="metadata"
              className="w-full rounded-lg shadow-lg border"
              style={{ maxHeight: "500px" }}
              onError={(e) => {
                console.error("Video playback error:", e);

                // DEBUG: Get detailed error information
                const video = e.target as HTMLVideoElement;
                console.log("DEBUG: Video element error details:", {
                  error: video.error,
                  code: video.error?.code,
                  message: video.error?.message,
                  networkState: video.networkState,
                  readyState: video.readyState,
                  src: video.src,
                  currentSrc: video.currentSrc,
                });

                // Map error codes to readable messages
                const errorMessages = {
                  1: "MEDIA_ERR_ABORTED - The video download was aborted",
                  2: "MEDIA_ERR_NETWORK - A network error occurred",
                  3: "MEDIA_ERR_DECODE - The video is corrupted or not supported",
                  4: "MEDIA_ERR_SRC_NOT_SUPPORTED - The video format is not supported",
                };

                const errorCode = video.error?.code;
                const errorMessage = errorCode
                  ? errorMessages[errorCode as keyof typeof errorMessages]
                  : "Unknown error";
                console.error("DEBUG: Specific error:", errorMessage);

                setError(`Video playback failed: ${errorMessage}`);
              }}
              onCanPlay={() => {
                console.log("DEBUG: Video can start playing");
              }}
              onLoadedMetadata={(e) => {
                const video = e.target as HTMLVideoElement;
                console.log("DEBUG: Video metadata loaded:", {
                  duration: video.duration,
                  videoWidth: video.videoWidth,
                  videoHeight: video.videoHeight,
                  readyState: video.readyState,
                });
              }}
            >
              Your browser does not support the video tag.
            </video>
            <div className="mt-6 flex gap-4 justify-center">
              <Button
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = processedVideoUrl;
                  a.download = "dance_analysis_video.mp4";
                  a.click();
                }}
                className="px-6 py-3 bg-green-600 hover:bg-green-700"
              >
                📥 Download Video
              </Button>
              <Button
                onClick={() => {
                  setProcessedVideoUrl(null);
                  setVideo1(null);
                  setVideo2(null);
                  setPreview1(null);
                  setPreview2(null);
                  setError(null);
                }}
                variant="outline"
                className="px-6 py-3"
              >
                🔄 Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
