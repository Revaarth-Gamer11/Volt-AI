import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Bolt,
  Check,
  Menu,
  MessageSquarePlus,
  Monitor,
  Palette,
  Save,
  Send,
  Settings,
  Sparkles,
  Sun,
  Moon,
  Trash2,
  X,
} from 'lucide-react';

import { Sidebar } from './components/Sidebar';
import {
  Chat,
  Message,
  MAX_CHATS,
  MAX_PINNED_CHATS,
} from './types/chat';
import {
  loadActiveChatId,
  loadChats,
  saveActiveChatId,
  saveChats,
} from './utils/chatStorage';

type SettingsTab =
  | 'themes'
  | 'custom';

type Theme =
  | 'system'
  | 'light'
  | 'dark'
  | 'volt'
  | 'ocean'
  | 'emerald'
  | 'violet'
  | 'rose'
  | 'midnight'
  | 'graphite'
  | 'aurora'
  | 'sunset'
  | 'electric'
  | 'lagoon'
  | 'candy'
  | 'custom';

type CustomStyle =
  | 'solid'
  | 'gradient';

type SavedCustomTheme = {
  style: CustomStyle;
  colourOne: string;
  colourTwo: string;
};

type ThemeOption = {
  id: Theme;
  name: string;
  type: 'system' | 'solid' | 'gradient';
};

const presetThemes: ThemeOption[] = [
  {
    id: 'system',
    name: 'Browser preference',
    type: 'system',
  },
  {
    id: 'light',
    name: 'Light',
    type: 'solid',
  },
  {
    id: 'dark',
    name: 'Dark',
    type: 'solid',
  },

  {
    id: 'volt',
    name: 'Volt',
    type: 'solid',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    type: 'solid',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    type: 'solid',
  },
  {
    id: 'violet',
    name: 'Violet',
    type: 'solid',
  },
  {
    id: 'rose',
    name: 'Rose',
    type: 'solid',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    type: 'solid',
  },
  {
    id: 'graphite',
    name: 'Graphite',
    type: 'solid',
  },

  {
    id: 'aurora',
    name: 'Aurora',
    type: 'gradient',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    type: 'gradient',
  },
  {
    id: 'electric',
    name: 'Electric',
    type: 'gradient',
  },
  {
    id: 'lagoon',
    name: 'Lagoon',
    type: 'gradient',
  },
  {
    id: 'candy',
    name: 'Candy',
    type: 'gradient',
  },
];

const starters = [
  'Explain quantum computing simply',
  'Help me plan a productive week',
  'Write a React component',
  'Brainstorm a startup idea',
];

const CUSTOM_SLOT_COUNT = 15;

function getSavedTheme(): Theme {
  const saved =
    localStorage.getItem(
      'volt-theme'
    ) as Theme | null;

  const validThemes: Theme[] = [
    ...presetThemes.map(
      (theme) => theme.id
    ),
    'custom',
  ];

  return saved &&
    validThemes.includes(saved)
    ? saved
    : 'volt';
}

function getSavedCustomStyle():
  CustomStyle {
  const saved =
    localStorage.getItem(
      'volt-custom-style'
    );

  return saved === 'gradient'
    ? 'gradient'
    : 'solid';
}

function getSavedSlots():
  Array<SavedCustomTheme | null> {
  try {
    const stored =
      localStorage.getItem(
        'volt-custom-slots'
      );

    if (!stored) {
      return Array(
        CUSTOM_SLOT_COUNT
      ).fill(null);
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return Array(
        CUSTOM_SLOT_COUNT
      ).fill(null);
    }

    return Array.from(
      {
        length:
          CUSTOM_SLOT_COUNT,
      },
      (_, index) =>
        parsed[index] ?? null
    );
  } catch {
    return Array(
      CUSTOM_SLOT_COUNT
    ).fill(null);
  }
}

function isValidHex(
  value: string
) {
  return /^#[0-9A-Fa-f]{6}$/.test(
    value
  );
}

function getContrastText(
  hex: string
) {
  if (!isValidHex(hex)) {
    return '#FFFFFF';
  }

  const clean =
    hex.substring(1);

  const red = parseInt(
    clean.substring(0, 2),
    16
  );

  const green = parseInt(
    clean.substring(2, 4),
    16
  );

  const blue = parseInt(
    clean.substring(4, 6),
    16
  );

  const brightness =
    (red * 299 +
      green * 587 +
      blue * 114) /
    1000;

  return brightness > 155
    ? '#111318'
    : '#FFFFFF';
}

function ColourInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  const [typedValue, setTypedValue] =
    useState(value);

  useEffect(() => {
    setTypedValue(value);
  }, [value]);

  function handleTypedValue(
    value: string
  ) {
    setTypedValue(value);

    if (isValidHex(value)) {
      onChange(value);
    }
  }

  return (
    <div className="colour-control">
      <label>{label}</label>

      <div className="colour-control-row">
        <input
          className="colour-picker"
          type="color"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
        />

        <input
          className="colour-code"
          type="text"
          value={typedValue}
          maxLength={7}
          spellCheck={false}
          onChange={(event) =>
            handleTypedValue(
              event.target.value
            )
          }
          onBlur={() => {
            if (
              !isValidHex(
                typedValue
              )
            ) {
              setTypedValue(
                value
              );
            }
          }}
          aria-label={`${label} hex code`}
        />
      </div>
    </div>
  );
}

export function App() {
  const [chats, setChats] =
    useState<Chat[]>(loadChats);

  const [activeChatId, setActiveChatId] =
    useState<string | null>(() => {
      const savedId = loadActiveChatId();
      const storedChats = loadChats();

      return savedId &&
        storedChats.some((chat) => chat.id === savedId)
        ? savedId
        : null;
    });

  const [draftMessages, setDraftMessages] =
    useState<Message[]>([]);

  const [chatNotice, setChatNotice] =
    useState('');

  const activeChat =
    chats.find((chat) => chat.id === activeChatId) ?? null;

  const messages =
    activeChat?.messages ?? draftMessages;

  const [input, setInput] =
    useState('');

  const [sidebar, setSidebar] =
    useState(true);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false);

  const [
    settingsTab,
    setSettingsTab,
  ] =
    useState<SettingsTab>(
      'themes'
    );

  const [theme, setTheme] =
    useState<Theme>(
      getSavedTheme
    );

  const [
    systemDark,
    setSystemDark,
  ] = useState(() =>
    window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
  );

  const [
    customStyle,
    setCustomStyle,
  ] =
    useState<CustomStyle>(
      getSavedCustomStyle
    );

  const [
    customColourOne,
    setCustomColourOne,
  ] = useState(
    () =>
      localStorage.getItem(
        'volt-custom-colour-one'
      ) || '#172554'
  );

  const [
    customColourTwo,
    setCustomColourTwo,
  ] = useState(
    () =>
      localStorage.getItem(
        'volt-custom-colour-two'
      ) || '#047857'
  );

  const [
    savedCustomThemes,
    setSavedCustomThemes,
  ] = useState<
    Array<SavedCustomTheme | null>
  >(getSavedSlots);

  const [
    activeSlot,
    setActiveSlot,
  ] = useState<
    number | null
  >(() => {
    const saved =
      localStorage.getItem(
        'volt-active-custom-slot'
      );

    if (saved === null) {
      return null;
    }

    const slot = Number(saved);

    return Number.isInteger(
      slot
    ) &&
      slot >= 0 &&
      slot <
        CUSTOM_SLOT_COUNT
      ? slot
      : null;
  });

  const messagesEndRef =
    useRef<HTMLDivElement>(
      null
    );

  const inputRef =
    useRef<HTMLTextAreaElement>(
      null
    );

  useEffect(() => {
    messagesEndRef.current
      ?.scrollIntoView({
        behavior: 'smooth',
      });
  }, [
    messages,
    isLoading,
  ]);

  useEffect(() => {
    if (
      !isLoading &&
      !settingsOpen
    ) {
      inputRef.current
        ?.focus();
    }
  }, [
    isLoading,
    settingsOpen,
  ]);

  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  useEffect(() => {
    saveActiveChatId(activeChatId);
  }, [activeChatId]);

  useEffect(() => {
    const media =
      window.matchMedia(
        '(prefers-color-scheme: dark)'
      );

    function handleChange(
      event:
        MediaQueryListEvent
    ) {
      setSystemDark(
        event.matches
      );
    }

    media.addEventListener(
      'change',
      handleChange
    );

    return () =>
      media.removeEventListener(
        'change',
        handleChange
      );
  }, []);

  useEffect(() => {
    const root =
      document.documentElement;

    const appliedTheme =
      theme === 'system'
        ? systemDark
          ? 'dark'
          : 'light'
        : theme;

    root.dataset.theme =
      appliedTheme;

    root.dataset.customStyle =
      customStyle;

    root.style.setProperty(
      '--custom-colour-one',
      customColourOne
    );

    root.style.setProperty(
      '--custom-colour-two',
      customColourTwo
    );

    root.style.setProperty(
      '--custom-text',
      getContrastText(
        customColourOne
      )
    );

    localStorage.setItem(
      'volt-theme',
      theme
    );

    localStorage.setItem(
      'volt-custom-style',
      customStyle
    );

    localStorage.setItem(
      'volt-custom-colour-one',
      customColourOne
    );

    localStorage.setItem(
      'volt-custom-colour-two',
      customColourTwo
    );

    localStorage.setItem(
      'volt-custom-slots',
      JSON.stringify(
        savedCustomThemes
      )
    );

    if (
      activeSlot === null
    ) {
      localStorage.removeItem(
        'volt-active-custom-slot'
      );
    } else {
      localStorage.setItem(
        'volt-active-custom-slot',
        String(activeSlot)
      );
    }
  }, [
    theme,
    systemDark,
    customStyle,
    customColourOne,
    customColourTwo,
    savedCustomThemes,
    activeSlot,
  ]);

  useEffect(() => {
    if (!settingsOpen) {
      return;
    }

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (
        event.key === 'Escape'
      ) {
        setSettingsOpen(
          false
        );
      }
    }

    window.addEventListener(
      'keydown',
      handleEscape
    );

    return () =>
      window.removeEventListener(
        'keydown',
        handleEscape
      );
  }, [settingsOpen]);

  function selectPreset(
    selectedTheme: Theme
  ) {
    setTheme(
      selectedTheme
    );

    setActiveSlot(null);
  }

  function selectCustomStyle(
    style: CustomStyle
  ) {
    setCustomStyle(style);
    setTheme('custom');
    setActiveSlot(null);
  }

  function changeCustomColourOne(
    colour: string
  ) {
    setCustomColourOne(
      colour
    );

    setTheme('custom');
    setActiveSlot(null);
  }

  function changeCustomColourTwo(
    colour: string
  ) {
    setCustomColourTwo(
      colour
    );

    setTheme('custom');
    setActiveSlot(null);
  }

  function saveCustomSlot(
    index: number
  ) {
    const next =
      [...savedCustomThemes];

    next[index] = {
      style: customStyle,
      colourOne:
        customColourOne,
      colourTwo:
        customColourTwo,
    };

    setSavedCustomThemes(
      next
    );

    setTheme('custom');
    setActiveSlot(index);
  }

  function loadCustomSlot(
    index: number
  ) {
    const savedTheme =
      savedCustomThemes[index];

    if (!savedTheme) {
      return;
    }

    setCustomStyle(
      savedTheme.style
    );

    setCustomColourOne(
      savedTheme.colourOne
    );

    setCustomColourTwo(
      savedTheme.colourTwo
    );

    setTheme('custom');
    setActiveSlot(index);
  }

  function deleteCustomSlot(
    index: number
  ) {
    const next =
      [...savedCustomThemes];

    next[index] = null;

    setSavedCustomThemes(
      next
    );

    if (
      activeSlot === index
    ) {
      setActiveSlot(null);
    }
  }

  function createChatTitle(text: string) {
    const clean = text
      .replace(/\s+/g, ' ')
      .trim();

    if (clean.length <= 42) {
      return clean;
    }

    return `${clean.slice(0, 42).trim()}…`;
  }

  function showChatNotice(message: string) {
    setChatNotice(message);

    window.setTimeout(() => {
      setChatNotice('');
    }, 2800);
  }

  function updateChatMessages(
    chatId: string,
    nextMessages: Message[]
  ) {
    setChats((current) =>
      current.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: nextMessages,
              updatedAt: Date.now(),
            }
          : chat
      )
    );
  }

  async function submit(
    text = input
  ) {
    const clean =
      text.trim();

    if (
      !clean ||
      isLoading
    ) {
      return;
    }

    const userMessage: Message = {
      role: 'user',
      text: clean,
    };

    let targetChatId =
      activeChatId;

    let conversation: Message[];

    if (targetChatId) {
      const targetChat =
        chats.find(
          (chat) =>
            chat.id === targetChatId
        );

      conversation = [
        ...(targetChat?.messages ?? []),
        userMessage,
      ];

      updateChatMessages(
        targetChatId,
        conversation
      );
    } else {
      if (
        chats.length >=
        MAX_CHATS
      ) {
        showChatNotice(
          'You have reached the 50-chat limit. Delete a chat to create a new one.'
        );

        return;
      }

      targetChatId =
        crypto.randomUUID();

      const now =
        Date.now();

      conversation = [
        ...draftMessages,
        userMessage,
      ];

      const newChat: Chat = {
        id: targetChatId,
        title:
          createChatTitle(
            clean
          ),
        messages:
          conversation,
        pinned: false,
        createdAt: now,
        updatedAt: now,
      };

      setChats(
        (current) => [
          newChat,
          ...current,
        ]
      );

      setActiveChatId(
        targetChatId
      );

      setDraftMessages([]);
    }

    const responseChatId =
      targetChatId;

    setInput('');
    setIsLoading(true);

    try {
      const response =
        await fetch(
          'http://localhost:3001/api/chat',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body:
              JSON.stringify({
                messages:
                  conversation.map(
                    (
                      message
                    ) => ({
                      role:
                        message.role,
                      content:
                        message.text,
                    })
                  ),
              }),
          }
        );

      if (!response.ok) {
        throw new Error(
          'Volt AI request failed'
        );
      }

      if (!response.body) {
        throw new Error(
          'Streaming is not supported'
        );
      }

      const reader =
        response.body
          .getReader();

      const decoder =
        new TextDecoder();

      let assistantText =
        '';

      while (true) {
        const {
          value,
          done,
        } =
          await reader.read();

        if (done) {
          break;
        }

        const chunk =
          decoder.decode(
            value,
            {
              stream: true,
            }
          );

        if (!chunk) {
          continue;
        }

        assistantText +=
          chunk;

        const streamedMessages = [
          ...conversation,
          {
            role:
              'assistant' as const,
            text:
              assistantText,
          },
        ];

        updateChatMessages(
          responseChatId,
          streamedMessages
        );
      }
    } catch (error) {
      console.error(
        'Volt AI error:',
        error
      );

      updateChatMessages(
        responseChatId,
        [
          ...conversation,
          {
            role:
              'assistant',
            text:
              'Sorry, I could not generate a response. Please try again.',
          },
        ]
      );
    } finally {
      setIsLoading(
        false
      );

      setTimeout(() => {
        inputRef.current
          ?.focus();
      }, 0);
    }
  }

  function newChat() {
    if (
      chats.length >=
        MAX_CHATS &&
      activeChatId !== null
    ) {
      showChatNotice(
        'You have reached the 50-chat limit. Delete a chat to create a new one.'
      );

      return;
    }

    setActiveChatId(null);
    setDraftMessages([]);
    setInput('');

    setTimeout(() => {
      inputRef.current
        ?.focus();
    }, 0);
  }

  function selectChat(
    chatId: string
  ) {
    setActiveChatId(
      chatId
    );

    setDraftMessages([]);
    setInput('');

    setTimeout(() => {
      inputRef.current
        ?.focus();
    }, 0);
  }

  function togglePinChat(
    chatId: string
  ) {
    const target =
      chats.find(
        (chat) =>
          chat.id === chatId
      );

    if (!target) {
      return;
    }

    if (!target.pinned) {
      const pinnedCount =
        chats.filter(
          (chat) =>
            chat.pinned
        ).length;

      if (
        pinnedCount >=
        MAX_PINNED_CHATS
      ) {
        showChatNotice(
          'You can pin up to 10 chats.'
        );

        return;
      }
    }

    setChats(
      (current) =>
        current.map(
          (chat) =>
            chat.id ===
            chatId
              ? {
                  ...chat,
                  pinned:
                    !chat.pinned,
                  updatedAt:
                    Date.now(),
                }
              : chat
        )
    );
  }

  function renameChat(
    chatId: string,
    title: string
  ) {
    const clean =
      title.trim();

    if (!clean) {
      return;
    }

    setChats(
      (current) =>
        current.map(
          (chat) =>
            chat.id ===
            chatId
              ? {
                  ...chat,
                  title:
                    clean.slice(
                      0,
                      80
                    ),
                }
              : chat
        )
    );
  }

  function deleteChat(
    chatId: string
  ) {
    setChats(
      (current) =>
        current.filter(
          (chat) =>
            chat.id !==
            chatId
        )
    );

    if (
      activeChatId ===
      chatId
    ) {
      setActiveChatId(
        null
      );

      setDraftMessages(
        []
      );

      setInput('');
    }
  }

  return (
    <div className="app">
      <aside
        className={
          sidebar
            ? 'sidebar'
            : 'sidebar hidden'
        }
      >
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={newChat}
          onSelectChat={selectChat}
          onPinChat={togglePinChat}
          onRenameChat={renameChat}
          onDeleteChat={deleteChat}
          onOpenSettings={() =>
            setSettingsOpen(true)
          }
        />
      </aside>

      {chatNotice && (
        <div className="chat-notice">
          {chatNotice}
        </div>
      )}

      <main>
        <header>
          <button
            className="icon-btn"
            onClick={() =>
              setSidebar(
                (value) =>
                  !value
              )
            }
          >
            <Menu size={20} />
          </button>

          <div className="model">
            Volt AI{' '}
            <span>Core</span>
          </div>

          <button className="upgrade">
            <Sparkles
              size={16}
            />
            Upgrade
          </button>
        </header>

        <section className="chat">
          {messages.length ===
            0 &&
          !isLoading ? (
            <div className="welcome">
              <div className="hero-logo">
                <Bolt
                  size={32}
                  fill="currentColor"
                />
              </div>

              <h1>
                What can I help
                you with?
              </h1>

              <p>
                Ask questions,
                create, learn,
                code, plan, and
                explore ideas
                with Volt AI.
              </p>

              <div className="starters">
                {starters.map(
                  (starter) => (
                    <button
                      key={
                        starter
                      }
                      onClick={() =>
                        submit(
                          starter
                        )
                      }
                      disabled={
                        isLoading
                      }
                    >
                      {starter}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map(
                (
                  message,
                  index
                ) => (
                  <div
                    className={
                      'message ' +
                      message.role
                    }
                    key={
                      index
                    }
                  >
                    <div className="avatar">
                      {message.role ===
                      'assistant' ? (
                        <Bolt
                          size={
                            17
                          }
                        />
                      ) : (
                        'You'
                      )}
                    </div>

                    <div className="bubble">
                      {
                        message.text
                      }
                    </div>
                  </div>
                )
              )}

              {isLoading &&
                messages[
                  messages.length -
                    1
                ]?.role !==
                  'assistant' && (
                  <div className="message assistant">
                    <div className="avatar">
                      <Bolt
                        size={
                          17
                        }
                      />
                    </div>

                    <div className="bubble typing-indicator">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}

              <div
                ref={
                  messagesEndRef
                }
              />
            </div>
          )}
        </section>

        <div className="composer-wrap">
          <div className="composer">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(
                event
              ) =>
                setInput(
                  event.target
                    .value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                    'Enter' &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  submit();
                }
              }}
              placeholder={
                isLoading
                  ? 'Volt is responding...'
                  : 'Message Volt AI...'
              }
              rows={1}
              disabled={
                isLoading
              }
            />

            <button
              className="send"
              onClick={() =>
                submit()
              }
              disabled={
                !input.trim() ||
                isLoading
              }
            >
              <Send
                size={18}
              />
            </button>
          </div>

          <small>
            Volt AI can make
            mistakes. Check
            important
            information.
          </small>
        </div>
      </main>

      {settingsOpen && (
        <div
          className="settings-overlay"
          onClick={() =>
            setSettingsOpen(
              false
            )
          }
        >
          <div
            className="settings-modal"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div className="settings-header">
              <div>
                <h2>
                  Settings
                </h2>
                <p>
                  Personalise
                  Volt AI
                </p>
              </div>

              <button
                className="close-settings"
                onClick={() =>
                  setSettingsOpen(
                    false
                  )
                }
                aria-label="Close settings"
              >
                <X size={20} />
              </button>
            </div>

            <div className="settings-layout">
              <nav className="settings-tabs">
                <button
                  className={
                    settingsTab ===
                    'themes'
                      ? 'active'
                      : ''
                  }
                  onClick={() =>
                    setSettingsTab(
                      'themes'
                    )
                  }
                >
                  <Sparkles
                    size={17}
                  />
                  Themes
                </button>

                <button
                  className={
                    settingsTab ===
                    'custom'
                      ? 'active'
                      : ''
                  }
                  onClick={() =>
                    setSettingsTab(
                      'custom'
                    )
                  }
                >
                  <Palette
                    size={17}
                  />
                  Custom
                </button>
              </nav>

              <div className="settings-content">
                {settingsTab ===
                  'themes' && (
                  <>
                    <div className="settings-page-heading">
                      <h3>
                        Themes
                      </h3>

                      <p>
                        Choose a
                        preset
                        appearance
                        for Volt.
                      </p>
                    </div>

                    <div className="theme-section">
                      <h4>
                        Appearance
                      </h4>

                      <div className="theme-grid appearance-grid">
                        {presetThemes
                          .slice(
                            0,
                            3
                          )
                          .map(
                            (
                              option
                            ) => (
                              <button
                                key={
                                  option.id
                                }
                                className={
                                  'theme-card ' +
                                  (theme ===
                                  option.id
                                    ? 'selected'
                                    : '')
                                }
                                onClick={() =>
                                  selectPreset(
                                    option.id
                                  )
                                }
                              >
                                <div
                                  className={
                                    'theme-preview preview-' +
                                    option.id
                                  }
                                >
                                  {option.id ===
                                    'system' && (
                                    <Monitor
                                      size={
                                        22
                                      }
                                    />
                                  )}

                                  {option.id ===
                                    'light' && (
                                    <Sun
                                      size={
                                        22
                                      }
                                    />
                                  )}

                                  {option.id ===
                                    'dark' && (
                                    <Moon
                                      size={
                                        22
                                      }
                                    />
                                  )}
                                </div>

                                <span>
                                  {
                                    option.name
                                  }
                                </span>

                                {theme ===
                                  option.id && (
                                  <div className="theme-selected-check">
                                    <Check
                                      size={
                                        13
                                      }
                                    />
                                  </div>
                                )}
                              </button>
                            )
                          )}
                      </div>
                    </div>

                    <div className="theme-section">
                      <h4>
                        Colour
                        themes
                      </h4>

                      <div className="theme-grid">
                        {presetThemes
                          .slice(
                            3,
                            10
                          )
                          .map(
                            (
                              option
                            ) => (
                              <button
                                key={
                                  option.id
                                }
                                className={
                                  'theme-card ' +
                                  (theme ===
                                  option.id
                                    ? 'selected'
                                    : '')
                                }
                                onClick={() =>
                                  selectPreset(
                                    option.id
                                  )
                                }
                              >
                                <div
                                  className={
                                    'theme-preview preview-' +
                                    option.id
                                  }
                                >
                                  <span />
                                  <span />
                                  <span />
                                </div>

                                <span>
                                  {
                                    option.name
                                  }
                                </span>

                                {theme ===
                                  option.id && (
                                  <div className="theme-selected-check">
                                    <Check
                                      size={
                                        13
                                      }
                                    />
                                  </div>
                                )}
                              </button>
                            )
                          )}
                      </div>
                    </div>

                    <div className="theme-section">
                      <h4>
                        Gradient
                        themes
                      </h4>

                      <div className="theme-grid">
                        {presetThemes
                          .slice(10)
                          .map(
                            (
                              option
                            ) => (
                              <button
                                key={
                                  option.id
                                }
                                className={
                                  'theme-card ' +
                                  (theme ===
                                  option.id
                                    ? 'selected'
                                    : '')
                                }
                                onClick={() =>
                                  selectPreset(
                                    option.id
                                  )
                                }
                              >
                                <div
                                  className={
                                    'theme-preview preview-' +
                                    option.id
                                  }
                                >
                                  <span />
                                  <span />
                                  <span />
                                </div>

                                <span>
                                  {
                                    option.name
                                  }
                                </span>

                                {theme ===
                                  option.id && (
                                  <div className="theme-selected-check">
                                    <Check
                                      size={
                                        13
                                      }
                                    />
                                  </div>
                                )}
                              </button>
                            )
                          )}
                      </div>
                    </div>
                  </>
                )}

                {settingsTab ===
                  'custom' && (
                  <>
                    <div className="settings-page-heading">
                      <h3>
                        Custom
                        themes
                      </h3>

                      <p>
                        Create a
                        solid or
                        gradient
                        theme and
                        save it for
                        later.
                      </p>
                    </div>

                    <div className="custom-builder">
                      <div className="custom-style-switch">
                        <button
                          className={
                            customStyle ===
                            'solid'
                              ? 'active'
                              : ''
                          }
                          onClick={() =>
                            selectCustomStyle(
                              'solid'
                            )
                          }
                        >
                          Solid
                        </button>

                        <button
                          className={
                            customStyle ===
                            'gradient'
                              ? 'active'
                              : ''
                          }
                          onClick={() =>
                            selectCustomStyle(
                              'gradient'
                            )
                          }
                        >
                          Gradient
                        </button>
                      </div>

                      {customStyle ===
                        'solid' && (
                        <div className="custom-options">
                          <ColourInput
                            label="Colour"
                            value={
                              customColourOne
                            }
                            onChange={
                              changeCustomColourOne
                            }
                          />
                        </div>
                      )}

                      {customStyle ===
                        'gradient' && (
                        <div className="custom-options">
                          <ColourInput
                            label="First colour"
                            value={
                              customColourOne
                            }
                            onChange={
                              changeCustomColourOne
                            }
                          />

                          <ColourInput
                            label="Second colour"
                            value={
                              customColourTwo
                            }
                            onChange={
                              changeCustomColourTwo
                            }
                          />
                        </div>
                      )}

                      <div className="custom-live-preview">
                        <div>
                          <Bolt
                            size={
                              22
                            }
                            fill="currentColor"
                          />

                          <span>
                            Volt AI
                          </span>
                        </div>

                        <small>
                          Live
                          preview
                        </small>
                      </div>
                    </div>

                    <div className="saved-themes-heading">
                      <div>
                        <h4>
                          Saved
                          themes
                        </h4>

                        <p>
                          Select an
                          empty slot
                          to save the
                          current
                          custom
                          theme.
                        </p>
                      </div>

                      <span>
                        {
                          savedCustomThemes.filter(
                            Boolean
                          ).length
                        }
                        /15
                      </span>
                    </div>

                    <div className="save-slot-grid">
                      {Array.from(
                        {
                          length:
                            CUSTOM_SLOT_COUNT,
                        },
                        (
                          _,
                          index
                        ) => {
                          const savedTheme =
                            savedCustomThemes[
                              index
                            ];

                          const isActive =
                            activeSlot ===
                            index &&
                            theme ===
                              'custom';

                          if (
                            !savedTheme
                          ) {
                            return (
                              <button
                                key={
                                  index
                                }
                                className="save-slot empty"
                                onClick={() =>
                                  saveCustomSlot(
                                    index
                                  )
                                }
                              >
                                <Save
                                  size={
                                    17
                                  }
                                />

                                <span>
                                  Slot{' '}
                                  {index +
                                    1}
                                </span>

                                <small>
                                  Save
                                </small>
                              </button>
                            );
                          }

                          return (
                            <div
                              key={
                                index
                              }
                              className={
                                'save-slot saved ' +
                                (isActive
                                  ? 'active'
                                  : '')
                              }
                            >
                              <button
                                className="saved-slot-main"
                                onClick={() =>
                                  loadCustomSlot(
                                    index
                                  )
                                }
                              >
                                <div
                                  className="saved-slot-preview"
                                  style={{
                                    background:
                                      savedTheme.style ===
                                      'gradient'
                                        ? `linear-gradient(135deg, ${savedTheme.colourOne}, ${savedTheme.colourTwo})`
                                        : savedTheme.colourOne,
                                  }}
                                />

                                <span>
                                  Slot{' '}
                                  {index +
                                    1}
                                </span>

                                <small>
                                  {savedTheme.style ===
                                  'gradient'
                                    ? 'Gradient'
                                    : 'Solid'}
                                </small>
                              </button>

                              <button
                                className="delete-slot"
                                onClick={() =>
                                  deleteCustomSlot(
                                    index
                                  )
                                }
                                aria-label={`Delete slot ${
                                  index +
                                  1
                                }`}
                              >
                                <Trash2
                                  size={
                                    14
                                  }
                                />
                              </button>

                              {isActive && (
                                <div className="slot-active-check">
                                  <Check
                                    size={
                                      12
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}