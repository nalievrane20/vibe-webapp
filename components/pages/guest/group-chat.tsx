"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import {
  getChatChannels,
  getChatMessages,
  sendChatMessage,
} from "@/app/actions/admin/chat";

/* ----------------------------- Types (mirrors schema.prisma) ----------------------------- */

type AuthUser = {
  id: number;
  course_id: number | null;
};

type ChannelType = "GENERAL" | "COURSE";

type Channel = {
  id: number;
  type: ChannelType;
  course_id: number | null;
  name: string; // "General" or the course title
};

type Message = {
  id: number;
  channel_id: number;
  content: string;
  sender_id: number;
  sender: {
    id: number;
    first_name: string;
    last_name: string;
  };
  createdAt: Date;
};

export default function GroupChatPage({ user }: { user: AuthUser | null }) {
  // user.course_id: number | null — passed in from a Server Component (e.g. page.tsx)
  // which reads the session via lib/auth.ts. Do NOT import lib/auth.ts here —
  // it depends on next/headers and will break the client bundle.

  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const hasAccess = (channel: Channel) =>
    channel.type === "GENERAL" || channel.course_id === user?.course_id;

  // Fetch channels on mount
  useEffect(() => {
    async function loadChannels() {
      setLoadingChannels(true);
      try {
        const res = await getChatChannels();
        if (!res.success) {
          console.error("Failed to load channels:", res.message);
          setChannels([]);
          return;
        }
        const data = res.data as Channel[];
        setChannels(data);

        // default to General, or the user's own course channel if General isn't found
        const general = data.find((c) => c.type === "GENERAL");
        setSelectedChannel(general ?? data[0] ?? null);
      } catch (err) {
        console.error("Failed to load channels", err);
      } finally {
        setLoadingChannels(false);
      }
    }
    loadChannels();
  }, []);

  // Fetch messages whenever the selected channel changes
  useEffect(() => {
    if (!selectedChannel || !hasAccess(selectedChannel)) return;

    const loadMessages = async () => {
      const res = await getChatMessages(selectedChannel.id);

      if (res.success) {
        setMessages(res.data as Message[]);
      }
    };

    loadMessages();

    const interval = setInterval(loadMessages, 3000); // every 3 sec

    return () => clearInterval(interval);
  }, [selectedChannel]);

  const handleSelectChannel = (channel: Channel) => {
    if (!hasAccess(channel)) return; // locked, do nothing
    setSelectedChannel(channel);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedChannel || !hasAccess(selectedChannel)) return;

    const content = input;
    setInput("");

    try {
      const res = await sendChatMessage(selectedChannel.id, content);
      if (!res.success) {
        console.error("Failed to send message:", res.message);
        return;
      }
      setMessages((prev) => [...prev, res.data as Message]);
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <section className="container mx-auto my-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto gap-6 py-10 px-4">

        {/* LEFT: CHANNEL LIST */}
        <div className="lg:col-span-4">
          <Card className="overflow-hidden py-0">
            <CardHeader className="bg-black text-white p-4 rounded-none">Group</CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {loadingChannels && (
                  <div className="px-4 py-3 text-sm text-muted-foreground">
                    Loading...
                  </div>
                )}

                {!loadingChannels && channels.length === 0 && (
                  <div className="px-4 py-3 text-sm text-muted-foreground">
                    No groups available.
                  </div>
                )}

                {channels.map((channel) => {
                  const unlocked = hasAccess(channel);

                  return (
                    <button
                      key={channel.id}
                      onClick={() => handleSelectChannel(channel)}
                      disabled={!unlocked}
                      title={
                        unlocked
                          ? undefined
                          : "You're not enrolled in this course"
                      }
                      className={cn(
                        "flex items-center justify-between text-left px-4 py-3 border-b hover:bg-muted",
                        selectedChannel?.id === channel.id &&
                          unlocked &&
                          "bg-muted font-medium",
                        !unlocked &&
                          "opacity-50 cursor-not-allowed hover:bg-transparent"
                      )}
                    >
                      <span>{channel.name}</span>
                      {!unlocked && (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: CHAT */}
        <div className="lg:col-span-8">
          <Card className="shadow-sm py-0">
            <CardHeader className="bg-primary text-primary-foreground p-3">
              <h2 className="text-lg font-semibold">
                {selectedChannel?.name ?? "Select a group"}
              </h2>
            </CardHeader>

            <CardContent className="p-4">
              {selectedChannel && hasAccess(selectedChannel) ? (
                <>
                  <ScrollArea className="h-[400px] border rounded-md p-3 bg-background">
                    <div className="space-y-2">
                      {loadingMessages && (
                        <p className="text-sm text-muted-foreground">
                          Loading messages...
                        </p>
                      )}

                      {messages.map((msg) => {
                        const isMe = msg.sender_id === user?.id;

                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex w-full",
                              isMe ? "justify-end" : "justify-start"
                            )}
                          >
                            <div className="max-w-[70%]">
                              <p
                                className={cn(
                                  "text-xs text-muted-foreground mb-1",
                                  isMe ? "text-right" : "text-left"
                                )}
                              >
                                {isMe
                                  ? "You"
                                  : `${msg.sender.first_name} ${msg.sender.last_name}`}
                              </p>

                              <div
                                className={cn(
                                  "px-3 py-2 rounded-2xl text-sm",
                                  isMe
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                )}
                              >
                                {msg.content}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  <div className="flex gap-2 mt-3">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type message..."
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <Button onClick={sendMessage}>Send</Button>
                  </div>
                </>
              ) : !selectedChannel ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground border rounded-md gap-2">
                  <p>No channel selected.</p>
                </div>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground border rounded-md gap-2">
                  <Lock className="h-6 w-6" />
                  <p>You need to be enrolled in this course to chat here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}