"use client";
import { useUser } from "@clerk/nextjs";
import { Chat, LoadingIndicator, Streami18n } from "stream-chat-react";
import ChatChannel from "./ChatChannel";
import ChatSidebar from "./ChatSidebar";
import useInitializeChatClient from "./useInitializeChatClient";
import { useCallback, useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import useWindowSize from "@/hooks/useWindowSize";
import { mdBreakPoint } from "@/utils/tailwind";
import { useTheme } from "../ThemeProvider";
import { registerServiceWorkers } from "@/utils/serviceWorker";
import {
  getCurrentPushSubscription,
  sendPushSubscriptionToServer,
} from "@/notifications/pushService";

const i18Instance = new Streami18n({ language: "en" });

export default function ChatPage() {
  const chatClient = useInitializeChatClient();
  const { user } = useUser();
  const { theme } = useTheme();
  const [sideChatBarOpen, setSideChatBarOpen] = useState(false);

  const windowSize = useWindowSize();
  const isLargeScreen = windowSize.width >= mdBreakPoint;

  useEffect(() => {
    if (windowSize.width >= mdBreakPoint) {
      setSideChatBarOpen(false);
    }
  }, [windowSize.width]);

  useEffect(() => {
    async function setUpServiceWorker() {
      try {
        await registerServiceWorkers();
      } catch (error) {
        console.error(error);
      }
    }
    setUpServiceWorker();
  }, []);

  useEffect(() => {
    async function asyncPushSubscription() {
      try {
        const subscription = await getCurrentPushSubscription();
        if (subscription) {
          await sendPushSubscriptionToServer(subscription);
        }
      } catch (error) {
        console.error(error);
      }
    }

    asyncPushSubscription();
  }, []);

  const handleSidebarOnClose = useCallback(() => {
    setSideChatBarOpen(false);
  }, []);

  if (!chatClient || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-black">
        <LoadingIndicator size={40} />
      </div>
    );
  }
  return (
    <div className="h-screen bg-gray-100 text-black dark:bg-black dark:text-white xl:px-20 xl:py-8">
      <div className="m-auto flex h-full min-w-[350px] max-w-[1600px] flex-col shadow-sm">
        <Chat
          client={chatClient}
          i18nInstance={i18Instance}
          theme={
            theme === "dark" ? "str-chat__theme-dark" : "str-chat__theme-light"
          }
        >
          <div className="P-3 flex justify-center border-b border-b-[#DBDDE1] md:hidden">
            <button onClick={() => setSideChatBarOpen((prev) => !prev)}>
              {!sideChatBarOpen ? (
                <span className="flex items-center gap-1">
                  {" "}
                  <Menu /> Menu
                </span>
              ) : (
                <X />
              )}
            </button>
          </div>
          <div className="flex h-full flex-row overflow-y-auto">
            <ChatSidebar
              user={user}
              show={isLargeScreen || sideChatBarOpen}
              onClose={handleSidebarOnClose}
            />
            <ChatChannel
              show={isLargeScreen || !sideChatBarOpen}
              hideChannelOnThread={!isLargeScreen}
            />
          </div>
        </Chat>
      </div>
    </div>
  );
}
