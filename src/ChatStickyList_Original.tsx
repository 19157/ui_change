import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ChatStickyList_Original.css';

// 类型定义
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

// 会话列表项组件
const SessionListItem: React.FC<{
  session: ChatSession;
  isSelected: boolean;
  isHovered: boolean;
  isEditing: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
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
  onClick,
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      onRenameCancel();
    }
  };

  return (
    <div
      className={`session-item ${isSelected ? 'selected' : ''}`}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
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
            {session.lastMessage || '新对话'}
          </div>
          <div className="session-time">
            {formatTime(session.updatedAt)}
          </div>
        </div>
      </div>

      <div className={`session-actions ${isHovered ? 'visible' : ''}`}>
        <button
          className="more-actions-btn"
          onClick={handleMoreClick}
          title="更多操作"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.5"/>
            <circle cx="8" cy="8" r="1.5"/>
            <circle cx="8" cy="13" r="1.5"/>
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
        )}
      </div>
    </div>
  );
};

// 主聊天列表组件
const ChatSessionList: React.FC<{
  sessions: ChatSession[];
  selectedSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onSessionRename: (sessionId: string, newTitle: string) => void;
  onSessionDelete: (sessionId: string) => void;
}> = ({
  sessions,
  selectedSessionId,
  onSessionSelect,
  onSessionRename,
  onSessionDelete,
}) => {
  const [categorizedSessions, setCategorizedSessions] = useState<CategorizedSessions>({
    today: [],
    last7Days: [],
    last30Days: [],
    older: [],
  });
  
  const [activeStickyHeader, setActiveStickyHeader] = useState<TimeCategory | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRefs = useRef<Map<TimeCategory, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver>(null);

  const categorizeSessions = useCallback((sessions: ChatSession[]): CategorizedSessions => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return sessions.reduce((acc, session) => {
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
    }, {
      today: [],
      last7Days: [],
      last30Days: [],
      older: [],
    } as CategorizedSessions);
  }, []);

  useEffect(() => {
    const options = {
      root: containerRef.current,
      rootMargin: '-60px 0px 0px 0px',
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
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

  const setHeaderRef = useCallback((category: TimeCategory, element: HTMLDivElement | null) => {
    if (element) {
      headerRefs.current.set(category, element);
    } else {
      headerRefs.current.delete(category);
    }
  }, []);

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
    if (window.confirm('确定要删除这个对话吗？')) {
      onSessionDelete(sessionId);
    }
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  const getCategoryTitle = (category: TimeCategory): string => {
    const titles = {
      today: '今天',
      last7Days: '过去7天',
      last30Days: '过去30天',
      older: '更早',
    };
    return titles[category];
  };

  return (
    <div 
      ref={containerRef}
      className="chat-session-list"
      onMouseLeave={() => setHoveredSessionId(null)}
    >
      {(['today', 'last7Days', 'last30Days', 'older'] as TimeCategory[]).map(category => {
        const sessionsInCategory = categorizedSessions[category];
        if (sessionsInCategory.length === 0) return null;

        return (
          <div key={category} className="session-category">
            <div
              ref={(el) => setHeaderRef(category, el)}
              data-category={category}
              className={`category-header ${activeStickyHeader === category ? 'sticky' : ''}`}
            >
              <span className="category-title">{getCategoryTitle(category)}</span>
              <span className="session-count">{sessionsInCategory.length}</span>
            </div>

            <div className="session-list">
              {sessionsInCategory.map(session => (
                <SessionListItem
                  key={session.id}
                  session={session}
                  isSelected={session.id === selectedSessionId}
                  isHovered={session.id === hoveredSessionId}
                  isEditing={session.id === editingSessionId}
                  onMouseEnter={() => setHoveredSessionId(session.id)}
                  onClick={() => handleSessionClick(session.id)}
                  onRenameStart={() => handleRenameStart(session.id)}
                  onRenameSubmit={(newTitle) => handleRenameSubmit(session.id, newTitle)}
                  onRenameCancel={handleRenameCancel}
                  onDelete={() => handleDelete(session.id)}
                  formatTime={formatTime}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 主应用组件
function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>();

  // 生成模拟数据
  const generateMockSessions = (): ChatSession[] => {
    const mockTitles = [
      'React学习笔记',
      '项目需求讨论',
      '技术方案设计',
      '代码评审问题',
      '产品功能规划',
      '性能优化方案',
      '架构设计讨论',
      'bug排查记录',
      '学习计划制定',
      '会议纪要整理',
      '技术调研报告',
      '工作总结',
      '学习心得',
      '问题解决方案',
      '技术分享准备'
    ];

    const mockMessages = [
      '你好！我想了解一下...',
      '这个问题可以通过...',
      '我建议采用以下方案...',
      '让我们讨论一下实现细节...',
      '这个功能的需求是...',
      '代码实现时需要注意...',
      '性能测试结果显示...',
      '用户反馈提到...',
      '技术选型考虑...',
      '下一步计划是...'
    ];

    const sessions: ChatSession[] = [];
    
    // 生成今天的数据
    for (let i = 0; i < 3; i++) {
      sessions.push({
        id: `today_${i}`,
        title: mockTitles[Math.floor(Math.random() * mockTitles.length)],
        lastMessage: mockMessages[Math.floor(Math.random() * mockMessages.length)],
        updatedAt: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000), // 12小时内
        messageCount: Math.floor(Math.random() * 20) + 1,
      });
    }

    // 生成7天内的数据
    for (let i = 0; i < 5; i++) {
      sessions.push({
        id: `week_${i}`,
        title: mockTitles[Math.floor(Math.random() * mockTitles.length)],
        lastMessage: mockMessages[Math.floor(Math.random() * mockMessages.length)],
        updatedAt: new Date(Date.now() - (2 + Math.random() * 5) * 24 * 60 * 60 * 1000), // 2-7天前
        messageCount: Math.floor(Math.random() * 50) + 1,
      });
    }

    // 生成30天内的数据
    for (let i = 0; i < 8; i++) {
      sessions.push({
        id: `month_${i}`,
        title: mockTitles[Math.floor(Math.random() * mockTitles.length)],
        lastMessage: mockMessages[Math.floor(Math.random() * mockMessages.length)],
        updatedAt: new Date(Date.now() - (8 + Math.random() * 22) * 24 * 60 * 60 * 1000), // 8-30天前
        messageCount: Math.floor(Math.random() * 100) + 1,
      });
    }

    // 生成更早的数据
    for (let i = 0; i < 6; i++) {
      sessions.push({
        id: `older_${i}`,
        title: mockTitles[Math.floor(Math.random() * mockTitles.length)],
        lastMessage: mockMessages[Math.floor(Math.random() * mockMessages.length)],
        updatedAt: new Date(Date.now() - (31 + Math.random() * 90) * 24 * 60 * 60 * 1000), // 31-120天前
        messageCount: Math.floor(Math.random() * 200) + 1,
      });
    }

    return sessions;
  };

  useEffect(() => {
    // 初始化模拟数据
    setSessions(generateMockSessions());
  }, []);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: '新对话',
      updatedAt: new Date(),
      messageCount: 0,
    };

    setSessions(prev => [newSession, ...prev]);
    setSelectedSessionId(newSession.id);
  };

  const selectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const renameSession = (sessionId: string, newTitle: string) => {
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, title: newTitle }
          : session
      )
    );
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    
    if (selectedSessionId === sessionId) {
      setSelectedSessionId(undefined);
    }
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={createNewSession}>
            + 新对话
          </button>
        </div>
        
        <div className="session-list-container">
          <ChatSessionList
            sessions={sessions}
            selectedSessionId={selectedSessionId}
            onSessionSelect={selectSession}
            onSessionRename={renameSession}
            onSessionDelete={deleteSession}
          />
        </div>
      </div>
      
      <div className="main-content">
        {selectedSessionId ? (
          <div className="chat-container">
            <div className="chat-header">
              <h3>{
                sessions.find(s => s.id === selectedSessionId)?.title || '对话'
              }</h3>
            </div>
            <div className="chat-messages">
              <div className="welcome-message">
                <h2>开始对话</h2>
                <p>这是一个模拟的聊天界面，你可以体验左侧会话列表的功能</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="welcome-screen">
            <h1>DeepSeek Chat</h1>
            <p>选择一个对话或创建新对话开始聊天</p>
            <div className="feature-cards">
              <div className="feature-card">
                <h3>智能对话</h3>
                <p>与AI进行自然流畅的对话</p>
              </div>
              <div className="feature-card">
                <h3>多轮对话</h3>
                <p>支持上下文连续的多轮对话</p>
              </div>
              <div className="feature-card">
                <h3>会话管理</h3>
                <p>智能分类和管理历史对话</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;