import {
  Chat,
  MAX_CHATS,
} from '../types/chat';

const CHATS_KEY = 'volt-chats';

const ACTIVE_CHAT_KEY =
  'volt-active-chat-id';

export function loadChats(): Chat[] {
  try {
    const stored =
      localStorage.getItem(
        CHATS_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (chat): chat is Chat =>
          chat &&
          typeof chat.id ===
            'string' &&
          typeof chat.title ===
            'string' &&
          Array.isArray(
            chat.messages
          )
      )
      .slice(0, MAX_CHATS);
  } catch {
    return [];
  }
}

export function saveChats(
  chats: Chat[]
) {
  localStorage.setItem(
    CHATS_KEY,
    JSON.stringify(
      chats.slice(
        0,
        MAX_CHATS
      )
    )
  );
}

export function loadActiveChatId():
  string | null {
  return localStorage.getItem(
    ACTIVE_CHAT_KEY
  );
}

export function saveActiveChatId(
  id: string | null
) {
  if (!id) {
    localStorage.removeItem(
      ACTIVE_CHAT_KEY
    );

    return;
  }

  localStorage.setItem(
    ACTIVE_CHAT_KEY,
    id
  );
}