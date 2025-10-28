import { useCallback, useEffect, useRef, useState } from "react";
import "./index.css";
import {
  Avatar,
  ConfigProvider,
  Dropdown,
  MenuProps,
  message,
  Modal,
  Tooltip,
} from "antd";

interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: Date;
  messageCount: number;
  isSelected?: boolean;
}

interface CategorizedSessions {
  today: ChatSession[];
  last7Days: ChatSession[];
  last30Days: ChatSession[];
  older: ChatSession[];
}

type TimeCategory = keyof CategorizedSessions;

type Props = {
  sessions: ChatSession[];
  selectedSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onSessionRename: (sessionId: string, newTitle: string) => void;
  onSessionDelete: (sessionId: string) => void;
};

// 会话列表项组件
const SessionListItem: React.FC<{
  session: ChatSession;
  isSelected: boolean;
  isHovered: boolean;
  isEditing: boolean;
  onMouseEnter: () => void;
  onItemClick: () => void;
  onRenameStart: () => void;
  onRenameSubmit: (newTitle: string) => void;
  onRenameCancel: () => void;
  onDelete: () => void;
  formatTime: (date: Date) => string;
}> = ({
  session,
  isSelected,
  isHovered,
  isEditing,
  onMouseEnter,
  onItemClick,
  onRenameStart,
  onRenameSubmit,
  onRenameCancel,
  onDelete,
  formatTime,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [editValue, setEditValue] = useState(session.title);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRenameStart();
    setShowDropdown(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
    setShowDropdown(false);
  };

  const handleEditSubmit = () => {
    if (editValue.trim()) {
      onRenameSubmit(editValue.trim());
    } else {
      onRenameCancel();
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSubmit();
    } else if (e.key === "Escape") {
      onRenameCancel();
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "rename",
      label: "重命名",
    },
    {
      key: "delete",
      label: "删除",
    },
  ];

  const onClick: MenuProps["onClick"] = ({ key, domEvent }) => {
    if (key === "rename") {
      handleRenameClick(domEvent as React.MouseEvent);
    } else if (key === "delete") {
      handleDeleteClick(domEvent as React.MouseEvent);
    }
  };

  return (
    <div
      className={`session-item ${isSelected ? "selected" : ""}`}
      onMouseEnter={onMouseEnter}
      onClick={onItemClick}
    >
      <div className="session-item-content">
        <div className="session-icon">💬</div>
        <div className="session-info">
          {isEditing ? (
            <input
              ref={inputRef}
              className="rename-input"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={handleEditKeyDown}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="session-title">{session.title}</div>
          )}
          <div className="session-preview">
            {session.lastMessage || "新对话"}
          </div>
          <div className="session-time">{formatTime(session.updatedAt)}</div>
        </div>
      </div>

      <div className={`session-actions ${isHovered ? "visible" : ""}`}>
        <Dropdown menu={{ items, onClick }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </Dropdown>
        {/* <button
          className="more-actions-btn"
          onClick={handleMoreClick}
          title="更多操作"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </button>

        {showDropdown && (
          <div ref={dropdownRef} className="actions-dropdown">
            <button
              className="dropdown-item rename-btn"
              onClick={handleRenameClick}
            >
              重命名
            </button>
            <button
              className="dropdown-item delete-btn"
              onClick={handleDeleteClick}
            >
              删除
            </button>
          </div>
        )} */}
      </div>
    </div>
  );
};

const ChatStickyList: GenieType.FC<Props> = (props) => {
  const {
    sessions,
    selectedSessionId,
    onSessionSelect,
    onSessionRename,
    onSessionDelete,
  } = props;
  const [categorizedSessions, setCategorizedSessions] =
    useState<CategorizedSessions>({
      today: [],
      last7Days: [],
      last30Days: [],
      older: [],
    });
  const [activeStickyHeader, setActiveStickyHeader] =
    useState<TimeCategory | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRefs = useRef<Map<TimeCategory, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver>(null);

  const categorizeSessions = useCallback(
    (sessions: ChatSession[]): CategorizedSessions => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(
        today.getTime() - 30 * 24 * 60 * 60 * 1000
      );

      return sessions.reduce(
        (acc, session) => {
          const sessionDate = new Date(session.updatedAt);

          if (sessionDate >= today) {
            acc.today.push(session);
          } else if (sessionDate >= sevenDaysAgo) {
            acc.last7Days.push(session);
          } else if (sessionDate >= thirtyDaysAgo) {
            acc.last30Days.push(session);
          } else {
            acc.older.push(session);
          }

          return acc;
        },
        {
          today: [],
          last7Days: [],
          last30Days: [],
          older: [],
        } as CategorizedSessions
      );
    },
    []
  );

  useEffect(() => {
    const options = {
      root: containerRef.current,
      rootMargin: "-60px 0px 0px 0px",
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const header = entry.target as HTMLDivElement;
        const category = header.dataset.category as TimeCategory;

        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setActiveStickyHeader(category);
        } else if (entry.isIntersecting && activeStickyHeader === category) {
          setActiveStickyHeader(null);
        }
      });
    }, options);

    headerRefs.current.forEach((header) => {
      if (header) {
        observerRef.current?.observe(header);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [activeStickyHeader]);

  useEffect(() => {
    const categorized = categorizeSessions(sessions);
    setCategorizedSessions(categorized);
  }, [sessions, categorizeSessions]);

  const setHeaderRef = useCallback(
    (category: TimeCategory, element: HTMLDivElement | null) => {
      if (element) {
        headerRefs.current.set(category, element);
      } else {
        headerRefs.current.delete(category);
      }
    },
    []
  );

  const handleSessionClick = (sessionId: string) => {
    onSessionSelect(sessionId);
  };

  const handleRenameStart = (sessionId: string) => {
    setEditingSessionId(sessionId);
  };

  const handleRenameSubmit = (sessionId: string, newTitle: string) => {
    onSessionRename(sessionId, newTitle);
    setEditingSessionId(null);
  };

  const handleRenameCancel = () => {
    setEditingSessionId(null);
  };

  const handleDelete = (sessionId: string) => {
    if (window.confirm("确定要删除这个对话吗？")) {
      onSessionDelete(sessionId);
    }
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}天前`;
    } else {
      return date.toLocaleDateString("zh-CN");
    }
  };

  const getCategoryTitle = (category: TimeCategory): string => {
    const titles = {
      today: "今天",
      last7Days: "过去7天",
      last30Days: "过去30天",
      older: "更早",
    };
    return titles[category];
  };

  return (
    <div
      ref={containerRef}
      className="chat-session-list"
      onMouseLeave={() => setHoveredSessionId(null)}
    >
      {(["today", "last7Days", "last30Days", "older"] as TimeCategory[]).map(
        (category) => {
          const sessionsInCategory = categorizedSessions[category];
          if (sessionsInCategory.length === 0) return null;

          return (
            <div key={category} className="session-category">
              <div
                ref={(el) => setHeaderRef(category, el)}
                data-category={category}
                className={`category-header ${activeStickyHeader === category ? "sticky" : ""}`}
              >
                <span className="category-title">
                  {getCategoryTitle(category)}
                </span>
                <span className="session-count">
                  {sessionsInCategory.length}
                </span>
              </div>

              <div className="session-list">
                {sessionsInCategory.map((session) => (
                  <SessionListItem
                    key={session.id}
                    session={session}
                    isSelected={session.id === selectedSessionId}
                    isHovered={session.id === hoveredSessionId}
                    isEditing={session.id === editingSessionId}
                    onMouseEnter={() => setHoveredSessionId(session.id)}
                    onItemClick={() => handleSessionClick(session.id)}
                    onRenameStart={() => handleRenameStart(session.id)}
                    onRenameSubmit={(newTitle) =>
                      handleRenameSubmit(session.id, newTitle)
                    }
                    onRenameCancel={handleRenameCancel}
                    onDelete={() => handleDelete(session.id)}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            </div>
          );
        }
      )}
    </div>
  );
};

export default ChatStickyList;
