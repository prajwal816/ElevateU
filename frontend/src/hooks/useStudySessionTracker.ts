import { useEffect, useRef } from "react";
import { startStudySession, pingStudySession, endStudySession } from "@/lib/apiService";

export const useStudySessionTracker = () => {
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartedRef = useRef(false);

  useEffect(() => {
    // Start session when component mounts
    const initSession = async () => {
      if (!sessionStartedRef.current) {
        try {
          await startStudySession({ activity: "general" });
          sessionStartedRef.current = true;
          console.log("Study session started");

          // Ping every 60 seconds to keep session alive
          pingIntervalRef.current = setInterval(async () => {
            try {
              await pingStudySession();
              console.log("Study session ping successful");
            } catch (error) {
              console.error("Failed to ping study session:", error);
            }
          }, 60000); // 60 seconds
        } catch (error) {
          console.error("Failed to start study session:", error);
        }
      }
    };

    initSession();

    // Cleanup: End session when component unmounts or page closes
    const handleUnload = async () => {
      if (sessionStartedRef.current) {
        try {
          await endStudySession();
          console.log("Study session ended");
        } catch (error) {
          console.error("Failed to end study session:", error);
        }
      }
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      // End session on cleanup
      if (sessionStartedRef.current) {
        endStudySession().catch(console.error);
      }
    };
  }, []);
};