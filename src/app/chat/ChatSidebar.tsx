import React, { useCallback, useEffect, useState } from "react";
import {
  ChannelList,
  ChannelPreviewMessenger,
  ChannelPreviewUIComponentProps,
} from "stream-chat-react";
import MenuBar from "./MenuBar";
import { UserResource } from "@clerk/types";
import UsersMenu from "./UsersMenu";

interface ChatSidebarProps {
  user: UserResource;
  show: boolean;
  onClose: () => void;
}

export default function ChatSidebar({ user, show, onClose }: ChatSidebarProps) {
  const [usersMenuOpen, setUsersMenuOpen] = useState(false);
  const ChannelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => (
      <ChannelPreviewMessenger
        {...props}
        onSelect={() => {
          props.setActiveChannel?.(props.channel, props.watchers);
          onClose();
        }}
      />
    ),
    [onClose]
  );

  useEffect(() => {
    if (!show) return setUsersMenuOpen(false);
  }, [show]);
  return (
    <div
      className={`relative w-full flex-col lg:max-w-[360px] ${
        show ? "flex" : "hidden"
      }`}
    >
      {usersMenuOpen && (
        <UsersMenu
          loggedInUser={user}
          onClose={() => setUsersMenuOpen(false)}
          onChannelSelected={() => {
            setUsersMenuOpen(false);
            onClose();
          }}
        />
      )}
      <MenuBar onUserMenuClick={() => setUsersMenuOpen(true)} />
      <ChannelList
        filters={{ type: "messaging", members: { $in: [user.id] } }}
        sort={{ last_message_at: -1 }}
        options={{ state: true, presence: true, limit: 10 }}
        showChannelSearch
        additionalChannelSearchProps={{
          searchForChannels: true,
          searchQueryParams: {
            channelFilters: { filters: { members: { $in: [user.id] } } },
          },
        }}
        Preview={ChannelPreviewCustom}
      />
    </div>
  );
}
