import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface JitsiParticipant {
  id: string;
  displayName: string;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
}

type JitsiContextValue = {
  participants: JitsiParticipant[];
  localParticipantId: string | null;
  isConnected: boolean;
  conferenceError: string | null;
  kickedOut: boolean;
  joinConference: (options: {
    roomName: string;
    displayName: string;
    url: string;
  }) => void;
  leaveConference: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  pinParticipant: (id: string | null) => void;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  setOnLeaveConference: (cb: (() => void) | null) => void;
};

const JitsiRoomContext = createContext<JitsiContextValue | undefined>(
  undefined,
);

export function useJitsiRoom() {
  const ctx = useContext(JitsiRoomContext);
  if (!ctx)
    throw new Error("useJitsiRoom must be used within JitsiRoomProvider");
  return ctx;
}

function loadJitsiScript(origin: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).JitsiMeetExternalAPI) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[src*="/external_api.js"]');
    if (existing) {
      if ((window as any).JitsiMeetExternalAPI) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load script")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = `${origin}/external_api.js`;
    script.async = true;
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout loading Jitsi script from ${origin}`));
    }, 15000);
    script.onload = () => {
      clearTimeout(timeout);
      resolve();
    };
    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`Failed to load Jitsi script from ${origin}`));
    };
    document.head.appendChild(script);
  });
}

export const JitsiRoomProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const apiRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onLeaveCallbackRef = useRef<(() => void) | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [conferenceError, setConferenceError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<JitsiParticipant[]>([]);
  const [localParticipantId, setLocalParticipantId] = useState<string | null>(
    null,
  );

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [kickedOut, setKickedOut] = useState(false);

  const setOnLeaveConference = useCallback((cb: (() => void) | null) => {
    onLeaveCallbackRef.current = cb;
  }, []);

  const updateParticipant = useCallback(
    (id: string, updates: Partial<JitsiParticipant>) => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      );
    },
    [],
  );

  const resetAllState = useCallback(() => {
    setIsConnected(false);
    setConferenceError(null);
    setParticipants([]);
    setLocalParticipantId(null);
    setIsAudioMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setKickedOut(false);
  }, []);

  const leaveConference = useCallback(() => {
    const api = apiRef.current;

    if (!api) return;

    api.executeCommand("hangup");

    const handleLeft = () => {
      api.removeListener("videoConferenceLeft", handleLeft);

      api.dispose();
      apiRef.current = null;

      resetAllState();

      // Call the leave callback if set (e.g., to POST /meetings/end)
      onLeaveCallbackRef.current?.();
      onLeaveCallbackRef.current = null;
    };

    api.addListener("videoConferenceLeft", handleLeft);
  }, [resetAllState]);

  const joinConference = useCallback(
    async ({
      roomName,
      displayName,
      url,
    }: {
      roomName: string;
      displayName: string;
      url: string;
    }) => {
      if (!containerRef.current) {
        setConferenceError("DOM element container reference is not ready.");
        return;
      }

      setConferenceError(null);
      setIsConnected(false);
      setParticipants([]);
      setKickedOut(false);

      try {
        const parsed = new URL(url);
        await loadJitsiScript(parsed.origin);

        const JitsiMeetExternalAPI = (window as any).JitsiMeetExternalAPI;
        if (!JitsiMeetExternalAPI)
          throw new Error("Jitsi external API not available.");

        const api = new JitsiMeetExternalAPI(parsed.host, {
          roomName,
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          userInfo: { displayName },
          configOverwrite: {
            disableDeepLinking: true,
            prejoinPageEnabled: false,
            prejoinConfig: {
              enabled: false,
            },
            startWithAudioMuted: false,
            startWithVideoMuted: false,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            MOBILE_APP_PROMO: false,
          },
        });

        apiRef.current = api;

        api.addEventListener("videoConferenceJoined", (payload: any) => {
          setIsConnected(true);
          const myId = payload?.id || "local";
          setLocalParticipantId(myId);

          setParticipants((prev) => {
            if (prev.some((p) => p.id === myId)) return prev;
            return [
              {
                id: myId,
                displayName: displayName || "You",
                isAudioMuted: false,
                isVideoOff: false,
                isScreenSharing: false,
              },
              ...prev,
            ];
          });
        });

        api.addEventListener("participantJoined", (payload: any) => {
          setParticipants((prev) => {
            if (prev.some((p) => p.id === payload.id)) return prev;
            return [
              ...prev,
              {
                id: payload.id,
                displayName: payload.displayName || "Guest",
                isAudioMuted: false,
                isVideoOff: false,
                isScreenSharing: false,
              },
            ];
          });
        });

        api.addEventListener("participantLeft", (payload: any) => {
          setParticipants((prev) => prev.filter((p) => p.id !== payload.id));
        });

        api.addEventListener("displayNameChange", (payload: any) => {
          if (payload?.id) {
            updateParticipant(payload.id, {
              displayName: payload.displayname || "Guest",
            });
          }
        });

        api.addEventListener("audioMuteStatusChanged", (payload: any) => {
          const tid = payload?.id || apiRef.current?._myUserID || "local";
          const isLocal =
            tid === apiRef.current?._myUserID ||
            tid === "local" ||
            !payload?.id;
          if (isLocal) setIsAudioMuted(payload.muted);
          updateParticipant(tid, { isAudioMuted: payload.muted });
        });

        api.addEventListener("videoMuteStatusChanged", (payload: any) => {
          const tid = payload?.id || apiRef.current?._myUserID || "local";
          const isLocal =
            tid === apiRef.current?._myUserID ||
            tid === "local" ||
            !payload?.id;
          if (isLocal) setIsVideoOff(payload.muted);
          updateParticipant(tid, { isVideoOff: payload.muted });
        });

        api.addEventListener("screenShareStatusChanged", (payload: any) => {
          const tid = payload?.id || apiRef.current?._myUserID || "local";
          const isLocal =
            tid === apiRef.current?._myUserID ||
            tid === "local" ||
            !payload?.id;
          if (isLocal) setIsScreenSharing(payload.on);
          updateParticipant(tid, { isScreenSharing: payload.on });
        });

        api.addEventListener("participantKickedOut", () => {
          const kickedApi = apiRef.current;
          if (kickedApi) {
            try {
              kickedApi.dispose();
            } catch {
              // ignore
            }
            apiRef.current = null;
          }
          resetAllState();
          setKickedOut(true);
        });

        api.addEventListener("videoConferenceLeft", () => {
          const leftApi = apiRef.current;
          if (leftApi) {
            try {
              leftApi.dispose();
            } catch {
              // ignore
            }
            apiRef.current = null;
          }
          resetAllState();

          // Call the leave callback if set (e.g., to POST /meetings/end)
          // This handles when user clicks Jitsi's native hangup button
          onLeaveCallbackRef.current?.();
          onLeaveCallbackRef.current = null;
        });
      } catch (e: any) {
        setConferenceError(e?.message || "Failed to initialize Jitsi.");
      }
    },
    [updateParticipant, resetAllState],
  );

  const toggleAudio = useCallback(
    () => apiRef.current?.executeCommand("toggleAudio"),
    [],
  );
  const toggleVideo = useCallback(
    () => apiRef.current?.executeCommand("toggleVideo"),
    [],
  );
  const toggleScreenShare = useCallback(
    () => apiRef.current?.executeCommand("toggleShareScreen"),
    [],
  );
  const pinParticipant = useCallback(
    (id: string | null) => apiRef.current?.executeCommand("pinParticipant", id),
    [],
  );

  useEffect(() => {
    return () => leaveConference();
  }, [leaveConference]);

  const value = useMemo<JitsiContextValue>(
    () => ({
      participants,
      localParticipantId,
      isConnected,
      conferenceError,
      kickedOut,
      joinConference,
      leaveConference,
      toggleAudio,
      toggleVideo,
      toggleScreenShare,
      pinParticipant,
      isAudioMuted,
      isVideoOff,
      isScreenSharing,
      containerRef,
      setOnLeaveConference,
    }),
    [
      participants,
      localParticipantId,
      isConnected,
      conferenceError,
      kickedOut,
      isAudioMuted,
      isVideoOff,
      isScreenSharing,
      leaveConference,
      toggleAudio,
      toggleVideo,
      toggleScreenShare,
      pinParticipant,
      setOnLeaveConference,
    ],
  );

  return (
    <JitsiRoomContext.Provider value={value}>
      {children}
    </JitsiRoomContext.Provider>
  );
};
