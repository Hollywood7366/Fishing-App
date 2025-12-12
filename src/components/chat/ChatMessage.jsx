import React from 'react';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Simple markdown-like formatting for assistant messages
  const formatContent = (content) => {
    if (!isAssistant) return content;

    // Split by double newlines for paragraphs
    const parts = content.split(/\n\n/);
    
    return parts.map((part, i) => {
      // Check for bullet points
      if (part.includes('\n- ') || part.startsWith('- ')) {
        const lines = part.split('\n');
        return (
          <ul key={i} style={{ margin: '8px 0', paddingLeft: '20px' }}>
            {lines.map((line, j) => {
              if (line.startsWith('- ')) {
                return <li key={j} style={{ marginBottom: '4px' }}>{formatInline(line.slice(2))}</li>;
              }
              return line ? <p key={j} style={{ margin: '4px 0' }}>{formatInline(line)}</p> : null;
            })}
          </ul>
        );
      }

      // Check for numbered lists
      if (/^\d+\./.test(part)) {
        const lines = part.split('\n');
        return (
          <ol key={i} style={{ margin: '8px 0', paddingLeft: '20px' }}>
            {lines.map((line, j) => {
              const match = line.match(/^\d+\.\s*(.+)/);
              if (match) {
                return <li key={j} style={{ marginBottom: '4px' }}>{formatInline(match[1])}</li>;
              }
              return line ? <p key={j} style={{ margin: '4px 0' }}>{formatInline(line)}</p> : null;
            })}
          </ol>
        );
      }

      // Regular paragraph
      return <p key={i} style={{ margin: i === 0 ? '0' : '12px 0 0 0' }}>{formatInline(part)}</p>;
    });
  };

  // Format inline elements (bold, etc.)
  const formatInline = (text) => {
    // Handle **bold** text
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '12px',
        animation: 'fadeIn 0.3s ease'
      }}
    >
      <div
        style={{
          maxWidth: '85%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isUser ? 'flex-end' : 'flex-start'
        }}
      >
        {/* Avatar and name */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '4px',
          flexDirection: isUser ? 'row-reverse' : 'row'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            background: isUser 
              ? 'linear-gradient(135deg, #1976d2, #1e88e5)'
              : 'linear-gradient(135deg, #2d6a4f, #40916c)',
            color: 'white',
            fontWeight: '600',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
          }}>
            {isUser ? '👤' : '🐟'}
          </div>
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: 'var(--text-secondary)'
          }}>
            {isUser ? 'You' : 'Fishing Assistant'}
          </span>
        </div>

        {/* Message bubble */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            background: isUser
              ? 'linear-gradient(135deg, #1976d2, #1e88e5)'
              : 'rgba(255, 255, 255, 0.95)',
            color: isUser ? 'white' : 'var(--text-primary)',
            fontSize: '14px',
            lineHeight: '1.5',
            boxShadow: isUser
              ? '0 2px 8px rgba(25, 118, 210, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: isUser ? 'none' : '1px solid rgba(0, 0, 0, 0.05)'
          }}
        >
          {formatContent(message.content)}
        </div>

        {/* Timestamp */}
        {message.timestamp && (
          <span style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            marginTop: '4px',
            opacity: 0.7
          }}>
            {formatTime(message.timestamp)}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;






