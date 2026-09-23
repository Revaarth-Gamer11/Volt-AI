import {
  Bolt,
  Check,
  MessageSquarePlus,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Settings,
  Trash2,
  X,
} from 'lucide-react';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Chat,
  MAX_PINNED_CHATS,
} from '../types/chat';

type Props = {
  chats: Chat[];
  activeChatId: string | null;

  onNewChat: () => void;

  onSelectChat: (
    chatId: string
  ) => void;

  onPinChat: (
    chatId: string
  ) => void;

  onRenameChat: (
    chatId: string,
    title: string
  ) => void;

  onDeleteChat: (
    chatId: string
  ) => void;

  onOpenSettings: () => void;
};

export function Sidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onPinChat,
  onRenameChat,
  onDeleteChat,
  onOpenSettings,
}: Props) {
  const [
    menuChatId,
    setMenuChatId,
  ] = useState<string | null>(
    null
  );

  const [
    renameChatId,
    setRenameChatId,
  ] = useState<string | null>(
    null
  );

  const [
    renameValue,
    setRenameValue,
  ] = useState('');

  const [
    deleteChatId,
    setDeleteChatId,
  ] = useState<string | null>(
    null
  );

  const menuRef =
    useRef<HTMLDivElement>(
      null
    );

  const pinnedChats = chats
    .filter(
      (chat) => chat.pinned
    )
    .sort(
      (a, b) =>
        b.updatedAt -
        a.updatedAt
    );

  const regularChats = chats
    .filter(
      (chat) => !chat.pinned
    )
    .sort(
      (a, b) =>
        b.updatedAt -
        a.updatedAt
    );

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setMenuChatId(null);
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
  }, []);

  function startRename(
    chat: Chat
  ) {
    setMenuChatId(null);

    setRenameChatId(
      chat.id
    );

    setRenameValue(
      chat.title
    );
  }

  function finishRename() {
    if (!renameChatId) {
      return;
    }

    const clean =
      renameValue.trim();

    if (clean) {
      onRenameChat(
        renameChatId,
        clean
      );
    }

    setRenameChatId(null);
    setRenameValue('');
  }

  function renderChat(
    chat: Chat
  ) {
    const isActive =
      activeChatId ===
      chat.id;

    const isRenaming =
      renameChatId ===
      chat.id;

    return (
      <div
        className={
          'chat-history-item' +
          (isActive
            ? ' active'
            : '')
        }
        key={chat.id}
      >
        {isRenaming ? (
          <div className="chat-rename">
            <input
              autoFocus
              value={
                renameValue
              }
              maxLength={80}
              onChange={(
                event
              ) =>
                setRenameValue(
                  event.target
                    .value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                  'Enter'
                ) {
                  finishRename();
                }

                if (
                  event.key ===
                  'Escape'
                ) {
                  setRenameChatId(
                    null
                  );
                }
              }}
            />

            <button
              onClick={
                finishRename
              }
              title="Save"
            >
              <Check
                size={14}
              />
            </button>

            <button
              onClick={() =>
                setRenameChatId(
                  null
                )
              }
              title="Cancel"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <button
              className="chat-history-title"
              onClick={() =>
                onSelectChat(
                  chat.id
                )
              }
              title={
                chat.title
              }
            >
              {chat.title}
            </button>

            <button
              className="chat-more-button"
              onClick={(
                event
              ) => {
                event.stopPropagation();

                setMenuChatId(
                  menuChatId ===
                    chat.id
                    ? null
                    : chat.id
                );
              }}
              aria-label={
                `Options for ${chat.title}`
              }
            >
              <MoreHorizontal
                size={17}
              />
            </button>

            {menuChatId ===
              chat.id && (
              <div
                className="chat-menu"
                ref={menuRef}
              >
                <button
                  onClick={() => {
                    setMenuChatId(
                      null
                    );

                    onPinChat(
                      chat.id
                    );
                  }}
                >
                  {chat.pinned ? (
                    <>
                      <PinOff
                        size={15}
                      />
                      Unpin
                    </>
                  ) : (
                    <>
                      <Pin
                        size={15}
                      />
                      Pin
                    </>
                  )}
                </button>

                <button
                  onClick={() =>
                    startRename(
                      chat
                    )
                  }
                >
                  <Pencil
                    size={15}
                  />
                  Rename
                </button>

                <button
                  className="danger"
                  onClick={() => {
                    setMenuChatId(
                      null
                    );

                    setDeleteChatId(
                      chat.id
                    );
                  }}
                >
                  <Trash2
                    size={15}
                  />
                  Delete
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="brand">
        <div className="logo">
          <Bolt
            size={19}
            fill="currentColor"
          />
        </div>

        <b>Volt AI</b>
      </div>

      <button
        className="new-chat"
        onClick={onNewChat}
      >
        <MessageSquarePlus
          size={18}
        />

        New chat
      </button>

      <div className="chat-history">
        {pinnedChats.length >
          0 && (
          <section className="chat-history-section">
            <div className="chat-history-heading">
              <span>
                PINNED
              </span>

              <small>
                {
                  pinnedChats.length
                }
                /
                {
                  MAX_PINNED_CHATS
                }
              </small>
            </div>

            {pinnedChats.map(
              renderChat
            )}
          </section>
        )}

        <section className="chat-history-section">
          <div className="chat-history-heading">
            <span>
              CHATS
            </span>

            <small>
              {chats.length}/50
            </small>
          </div>

          {regularChats.length ===
          0 ? (
            <div className="chat-history-empty">
              Your chats will
              appear here.
            </div>
          ) : (
            regularChats.map(
              renderChat
            )
          )}
        </section>
      </div>

      <div className="side-bottom">
        <button
          className="side-link"
          onClick={
            onOpenSettings
          }
        >
          <Settings
            size={18}
          />
          Settings
        </button>
      </div>

      {deleteChatId && (
        <div
          className="delete-chat-overlay"
          onClick={() =>
            setDeleteChatId(
              null
            )
          }
        >
          <div
            className="delete-chat-dialog"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <h3>
              Delete chat?
            </h3>

            <p>
              This conversation
              will be permanently
              removed.
            </p>

            <div className="delete-chat-actions">
              <button
                className="cancel-delete"
                onClick={() =>
                  setDeleteChatId(
                    null
                  )
                }
              >
                Cancel
              </button>

              <button
                className="confirm-delete"
                onClick={() => {
                  onDeleteChat(
                    deleteChatId
                  );

                  setDeleteChatId(
                    null
                  );
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}