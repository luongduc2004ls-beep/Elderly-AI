import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
// Use dynamic import for the pose-detection package to avoid Node-only APIs in browser
let poseDetection = null;

const FALL_THRESHOLD_FRAMES = 25;
const FALL_RESET_FRAMES = 2;
const COOLDOWN_MS = 10_000; // minimum time between alarms

const FallDetectionCamera = ({ onAlertCreated }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const detectorRef = useRef(null);
  const streamRef = useRef(null);
  const fallFrameCountRef = useRef(0);
  const isAlertRef = useRef(false);
  const headHistRef = useRef([]);
  const [isAlert, setIsAlert] = useState(false);
  const [statusText, setStatusText] = useState('Initializing AI...');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const initDetector = async () => {
      try {
        // start camera immediately (non-blocking) so user sees feed while model loads
        if (!streamRef.current) {
          startVideo().catch(() => {});
        }
        await tf.ready();
        if (!poseDetection) {
          try {
            const mod = await import('@tensorflow-models/pose-detection');
            poseDetection = mod && mod.default ? mod.default : mod;
          } catch (importErr) {
            console.warn('Dynamic import failed, attempting CDN fallback:', importErr);

            const loadScript = (src) => new Promise((resolve, reject) => {
              const s = document.createElement('script');
              s.src = src;
              s.async = true;
              s.onload = () => resolve();
              s.onerror = (e) => reject(new Error('Failed to load ' + src));
              document.head.appendChild(s);
            });

            // Load TF.js and pose-detection UMD bundles from CDN
            try {
              if (!window.tf) {
                await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
              }
              await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js');
              // UMD exposes a global `poseDetection`
              poseDetection = window.poseDetection || window.poseDetection || (window['pose-detection']);
            } catch (cdnErr) {
              console.error('CDN fallback failed:', cdnErr);
              throw cdnErr;
            }
          }
        }
        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        };
        // Retry logic for model creation (network flakiness)
        let activeDetector = null;
        let attempts = 0;
        while (!activeDetector && attempts < 3) {
          try {
            activeDetector = await poseDetection.createDetector(model, detectorConfig);
          } catch (e) {
            attempts += 1;
            console.warn('createDetector attempt failed', attempts, e);
            await new Promise((r) => setTimeout(r, 1000 * attempts));
          }
        }
        if (!activeDetector) throw new Error('Unable to create detector after retries');

        if (!isCancelled) {
          detectorRef.current = activeDetector;
          setStatusText('AI đã sẵn sàng. Đang mở camera...');
          await startVideo();
        }
      } catch (error) {
        console.error('Lỗi khởi tạo AI:', error);
        if (!isCancelled) {
          setStatusText('Không thể tải mô hình AI.');
          setErrorMessage('Mô hình TensorFlow.js không thể khởi động. Vui lòng thử lại sau.');
        }
      }
    };

    initDetector();

    return () => {
      isCancelled = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startVideo = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatusText('Không truy cập được Camera.');
      setErrorMessage('Trình duyệt của bạn chưa hỗ trợ camera.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // ensure canvas matches incoming video size when metadata is available
        const onLoaded = () => {
          const canvas = canvasRef.current;
          if (canvas && videoRef.current) {
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
          }
        };
        videoRef.current.addEventListener('loadedmetadata', onLoaded, { once: true });
        await videoRef.current.play().catch(() => undefined);
      }

      setStatusText('Hệ thống đang giám sát...');
      setErrorMessage('');
      // indicate success so UI can hide enable button
      setStatusText('Hệ thống đang giám sát...');
    } catch (error) {
      console.error('Lỗi mở camera:', error);
      console.error(error);
      // Provide clearer messages for common cases
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setStatusText('Không truy cập được Camera.');
        setErrorMessage('Quyền truy cập camera bị từ chối. Vui lòng cho phép camera (click biểu tượng ổ khóa ở thanh địa chỉ).');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setStatusText('Không tìm thấy Camera.');
        setErrorMessage('Không tìm thấy thiết bị camera. Vui lòng kiểm tra kết nối.');
      } else {
        setStatusText('Không truy cập được Camera.');
        setErrorMessage('Vui lòng cho phép quyền truy cập camera để bật chế độ giám sát.');
      }
    }
  };

  const handleEnableCamera = async () => {
    setErrorMessage('');
    setStatusText('Đang mở camera...');
    try {
      await startVideo();
    } catch (e) {
      console.warn('Enable camera failed', e);
    }
  };

  const triggerManualFallAlert = () => {
    if (!isAlertRef.current) {
      isAlertRef.current = true;
      setIsAlert(true);
      setStatusText('Cảnh báo: phát hiện có người ngã!');
    }

    const alert = {
      id: Date.now(),
      type: 'fall',
      title: 'Phát hiện té ngã',
      content: 'AI đã phát hiện tình huống té ngã thử nghiệm.',
      time: new Date().toLocaleString('vi-VN'),
      isRead: false,
    };
    if (typeof onAlertCreated === 'function') {
      onAlertCreated(alert);
    }
    // also play visual/audio feedback for manual test
    try {
      flashOverlay(900);
      triggerAlarm();
    } catch (e) {
      console.warn('Manual alert feedback failed', e);
    }
  };

  const triggerAlarm = () => {
    if (typeof window === 'undefined') {
      return;
    }

    const now = Date.now();
    if (triggerAlarm.last && now - triggerAlarm.last < COOLDOWN_MS) return;
    triggerAlarm.last = now;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 1.5);
    } catch (error) {
      console.warn('Không thể phát âm thanh cảnh báo:', error);
    }

    console.log('CẢNH BÁO: Phát hiện có người ngã!');
  };

  // visual flash overlay for short attention-grabbing when specific alerts trigger
  const flashOverlay = (duration = 800) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // reuse overlay element if already created
    let overlay = canvas.__flashOverlay;
    const parent = canvas.parentElement;
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.style.position = 'absolute';
      overlay.style.left = '0';
      overlay.style.top = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.pointerEvents = 'none';
      overlay.style.background = 'rgba(255,0,0,0.28)';
      overlay.style.opacity = '0';
      overlay.style.transition = `opacity ${duration}ms ease-out`;
      overlay.style.mixBlendMode = 'screen';
      // ensure parent is positioned
      if (parent && getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
      if (parent) parent.appendChild(overlay);
      canvas.__flashOverlay = overlay;
    }
    // show then fade
    overlay.style.transition = `opacity ${duration}ms ease-out`;
    overlay.style.opacity = '1';
    setTimeout(() => {
      overlay.style.opacity = '0';
    }, duration);
  };

  const resetFallState = () => {
    fallFrameCountRef.current = 0;
    if (isAlertRef.current) {
      isAlertRef.current = false;
      setIsAlert(false);
      setStatusText('Hệ thống đang giám sát...');
    }
  };

  const checkFallLogic = (keypoints) => {
    const leftShoulder = keypoints.find((keypoint) => keypoint.name === 'left_shoulder');
    const rightShoulder = keypoints.find((keypoint) => keypoint.name === 'right_shoulder');
    const leftHip = keypoints.find((keypoint) => keypoint.name === 'left_hip');
    const rightHip = keypoints.find((keypoint) => keypoint.name === 'right_hip');

    const shoulders = [leftShoulder, rightShoulder].filter(Boolean);
    const hips = [leftHip, rightHip].filter(Boolean);

    if (shoulders.length === 0 || hips.length === 0) {
      resetFallState();
      return;
    }

    const shoulder = {
      x: shoulders.reduce((sum, item) => sum + item.x, 0) / shoulders.length,
      y: shoulders.reduce((sum, item) => sum + item.y, 0) / shoulders.length,
      score: shoulders.reduce((sum, item) => sum + item.score, 0) / shoulders.length,
    };
    const hip = {
      x: hips.reduce((sum, item) => sum + item.x, 0) / hips.length,
      y: hips.reduce((sum, item) => sum + item.y, 0) / hips.length,
      score: hips.reduce((sum, item) => sum + item.score, 0) / hips.length,
    };

    if (shoulder.score < 0.35 || hip.score < 0.35) {
      resetFallState();
      return;
    }

    // If averaged angle provided, use it
    const angle = typeof keypoints._avgAngle === 'number'
      ? keypoints._avgAngle
      : Math.atan2(Math.abs(shoulder.x - hip.x), Math.max(Math.abs(shoulder.y - hip.y), 1)) * (180 / Math.PI);

    const dY = Math.abs(shoulder.y - hip.y);
    const isHorizontal = angle > 60 && dY < 120;

    if (isHorizontal) {
      fallFrameCountRef.current += 1;
      if (fallFrameCountRef.current > FALL_THRESHOLD_FRAMES && !isAlertRef.current) {
        isAlertRef.current = true;
        setIsAlert(true);
        setStatusText('Cảnh báo: phát hiện có người ngã!');
        triggerAlarm();
      }
    } else {
      fallFrameCountRef.current = Math.max(0, fallFrameCountRef.current - FALL_RESET_FRAMES);
      if (fallFrameCountRef.current === 0 && isAlertRef.current) {
        resetFallState();
      }
    }

    // head-bow detection: torso-normalized + velocity-based using stable ref
    try {
      const nose = keypoints.find((k) => k.name === 'nose' || k.part === 'nose');
      const leftShoulder = keypoints.find((k) => k.name === 'left_shoulder');
      const rightShoulder = keypoints.find((k) => k.name === 'right_shoulder');
      const leftHip = keypoints.find((k) => k.name === 'left_hip');
      const rightHip = keypoints.find((k) => k.name === 'right_hip');

      if (!nose || (!leftShoulder && !rightShoulder)) return;

      const shoulderY = ((leftShoulder?.y || 0) + (rightShoulder?.y || 0)) / ((leftShoulder ? 1 : 0) + (rightShoulder ? 1 : 0) || 1);
      const avgHipY = ((leftHip?.y || 0) + (rightHip?.y || 0));
      const hipCount = (leftHip ? 1 : 0) + (rightHip ? 1 : 0);
      const torso = hipCount > 0 ? (avgHipY / hipCount) - shoulderY : 120;
      const torsoRef = Math.max(70, Math.min(300, Math.abs(torso))); // stable torso reference

      const hist = headHistRef.current;
      const now = Date.now();

      // Normalize coordinates: if keypoints appear to be normalized [0..1], convert to pixels
      const canvas = canvasRef.current;
      const toPx = (v) => {
        if (!canvas) return v;
        // if value is small (<3) assume normalized and multiply by height
        if (typeof v === 'number' && Math.abs(v) < 3) return v * canvas.height;
        return v;
      };

      const noseY = toPx(nose.y);
      const shoulderYPx = toPx(shoulderY);
      const torsoPx = Math.max(70, Math.min(300, Math.abs(torso) < 30 ? Math.abs(torso) * (canvas ? canvas.height : 1) : Math.abs(torso)));

      hist.push({ y: noseY, t: now });
      // keep only recent ~1.2s of samples (depends on frame rate)
      while (hist.length > 50) hist.shift();

      if (hist.length < 3) {
        // log minimal diagnostics so user sees activity
        console.log('Head check (warming)', { noseY, shoulderYPx, torsoPx, samples: hist.length });
        return;
      }

      const first = hist[0];
      const prev = hist[hist.length - 2];
      const dy = noseY - first.y; // overall delta in px
      const dt = now - first.t;
      const dyPrev = noseY - prev.y;
      const dtPrev = now - prev.t;
      const velocity = dyPrev / Math.max(1, dtPrev); // px per ms (recent)

      // check if head was above shoulders sometime recently
      const startedAbove = hist.some((h) => h.y < shoulderYPx - torsoPx * 0.12);
      const nowBelow = noseY > shoulderYPx + torsoPx * 0.25;

      // log diagnostics
      try {
        console.log('Head check', { noseY, shoulderYPx, torsoPx, dy, dt, dyPrev, dtPrev, velocity, startedAbove, nowBelow });
      } catch (e) {}

      const QUICK_DROP_DISTANCE = torsoPx * 0.12; // px
      const VELOCITY_THRESHOLD = 0.04; // px/ms (~40 px / 1000ms)

      if (startedAbove && nowBelow && (dyPrev > QUICK_DROP_DISTANCE || velocity > VELOCITY_THRESHOLD)) {
        flashOverlay(900);
        triggerAlarm();
        headHistRef.current = [];
        // set visible alert state and status text
        isAlertRef.current = true;
        setIsAlert(true);
        setStatusText('Cảnh báo: phát hiện đầu gục!');

        // create an alert entry so it appears in the notification list
        const alert = {
          id: Date.now(),
          type: 'fall',
          title: 'Phát hiện đầu gục',
          content: 'Hệ thống AI phát hiện chuyển động cúi đầu nhanh cần kiểm tra.',
          time: new Date().toLocaleString('vi-VN'),
          isRead: false,
        };
        if (typeof onAlertCreated === 'function') onAlertCreated(alert);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    let isActive = true;
    // smoothing buffer for angle values to reduce jitter
    const angleBuffer = [];
    const ANGLE_SMOOTHING = 5;

    const detectPose = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const detector = detectorRef.current;

      if (video && canvas && video.readyState >= 2) {
        const ctx = canvas.getContext('2d');
        // always draw the video frame so the user sees the camera
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (detector) {
          try {
            const poses = await detector.estimatePoses(video);
            if (poses.length > 0) {
              const keypoints = poses[0].keypoints || [];
              drawKeypoints(ctx, keypoints);
              // compute rough angle and smooth it
              const leftShoulder = keypoints.find((k) => k.name === 'left_shoulder');
              const leftHip = keypoints.find((k) => k.name === 'left_hip');
              if (leftShoulder && leftHip) {
                const dX = Math.abs(leftShoulder.x - leftHip.x);
                const dY = Math.abs(leftShoulder.y - leftHip.y);
                const angle = Math.atan2(dX, Math.max(dY, 1)) * (180 / Math.PI);
                angleBuffer.push(angle);
                if (angleBuffer.length > ANGLE_SMOOTHING) angleBuffer.shift();
                const avgAngle = angleBuffer.reduce((s, v) => s + v, 0) / angleBuffer.length;
                // pass averaged angle by attaching to a shallow copy of keypoints
                const kpCopy = keypoints.slice();
                kpCopy._avgAngle = avgAngle;
                checkFallLogic(kpCopy);
              } else {
                checkFallLogic(keypoints);
              }
            } else {
              resetFallState();
            }
          } catch (error) {
            console.error('Lỗi phát hiện pose:', error);
          }
        }
      }

      if (isActive) {
        animationFrameRef.current = requestAnimationFrame(detectPose);
      }
    };

    // Always start the draw loop so camera frames appear while the model loads
    animationFrameRef.current = requestAnimationFrame(detectPose);

    return () => {
      isActive = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const drawKeypoints = (ctx, keypoints) => {
    // draw connections (skeleton) first for better visibility
    const connections = [
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'],
      ['left_elbow', 'left_wrist'],
      ['right_shoulder', 'right_elbow'],
      ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'],
      ['left_knee', 'left_ankle'],
      ['right_hip', 'right_knee'],
      ['right_knee', 'right_ankle'],
      ['nose', 'left_eye'],
      ['nose', 'right_eye'],
      ['left_eye', 'left_ear'],
      ['right_eye', 'right_ear'],
    ];

    const getByName = (name) => keypoints.find((k) => k.name === name || k.part === name || k.keypoint === name);

    // make skeleton lines thicker and high-contrast for visibility
    ctx.lineWidth = 4;
    ctx.strokeStyle = isAlert ? 'rgba(255,60,60,0.95)' : 'rgba(255,200,0,0.95)';
    const MIN_CONN_SCORE = 0.25; // lower threshold so partial poses still draw
    connections.forEach(([a, b]) => {
      const A = getByName(a);
      const B = getByName(b);
      if (A && B && (A.score || 0) > MIN_CONN_SCORE && (B.score || 0) > MIN_CONN_SCORE) {
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();
      }
    });

    // draw joints on top
    keypoints.forEach((keypoint) => {
      const score = keypoint.score || 0;
      if (score > 0.15) {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = isAlert ? 'red' : 'cyan';
        ctx.fill();
      }
    });
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 'bold' }}>Trạng thái: {statusText}</span>
        <span
          style={{
            backgroundColor: isAlert ? 'red' : '#198754',
            color: 'white',
            padding: '5px 14px',
            borderRadius: '999px',
            fontWeight: 'bold',
            animation: isAlert ? 'blink 1s infinite' : 'none',
          }}
        >
          {isAlert ? 'PHÁT HIỆN NGÃ' : 'ĐANG GIÁM SÁT'}
        </span>
      </div>

      {errorMessage && (
        <div style={{ marginBottom: '10px', color: '#8a4b00', backgroundColor: '#fff3cd', padding: '8px 12px', borderRadius: '6px' }}>
          {errorMessage}
        </div>
      )}

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '640px',
          aspectRatio: '4 / 3',
          borderRadius: '8px',
          overflow: 'hidden',
          border: isAlert ? '5px solid red' : '2px solid #ccc',
          backgroundColor: '#000',
        }}
      >
        <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} width="640" height="480" />
        <canvas ref={canvasRef} width="640" height="480" style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>

      <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={handleEnableCamera} style={{ backgroundColor: '#0d6efd', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>
          Bật camera
        </button>
        <button onClick={triggerManualFallAlert} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>
          Thử cảnh báo ngã
        </button>
        <span style={{ color: '#666', minWidth: '240px' }}>{errorMessage ? errorMessage : ''}</span>
      </div>

      <style>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default FallDetectionCamera;