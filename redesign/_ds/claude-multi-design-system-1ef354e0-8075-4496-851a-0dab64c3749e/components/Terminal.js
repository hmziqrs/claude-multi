(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;
  var NS = (window.ClaudeMultiDesignSystem_1ef354 = window.ClaudeMultiDesignSystem_1ef354 || {});

  // Inject blink keyframes once.
  function ensureCursorStyle() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('ds-cursor-blink-style')) return;
    var el = document.createElement('style');
    el.id = 'ds-cursor-blink-style';
    el.textContent =
      '@keyframes ds-cursor-blink{0%,49%{opacity:1}50%,100%{opacity:0}}' +
      '.ds-cursor-blink{animation:ds-cursor-blink 1.06s steps(1) infinite}';
    document.head.appendChild(el);
  }

  NS.Terminal = function Terminal(props) {
    ensureCursorStyle();

    var title = props.title || 'terminal';
    var status = props.status === 'done' ? 'done' : 'running';
    var cursor = !!props.cursor;
    var lines = Array.isArray(props.lines) ? props.lines : [];

    var runningColor = 'var(--accent)';
    var doneColor = '#3fb950';

    var lineEls = lines.map(function (line, i) {
      var text = line && typeof line.text === 'string' ? line.text : '';
      var knownTones = ['command', 'arrow', 'success', 'muted', 'plain'];
      var tone = knownTones.indexOf(line && line.tone) !== -1 ? line.tone : 'plain';
      var isLast = i === lines.length - 1;

      var children = [];
      if (tone === 'command') {
        children.push(
          h('span', { key: 'pfx', style: { color: 'var(--accent)', fontWeight: 500, marginRight: '9px', userSelect: 'none' } }, '$')
        );
        children.push(h('span', { key: 'txt', style: { color: 'var(--text-primary)', fontWeight: 500 } }, text));
      } else if (tone === 'arrow') {
        children.push(
          h('span', { key: 'pfx', style: { color: 'var(--accent)', marginRight: '9px', userSelect: 'none' } }, '▸')
        );
        children.push(h('span', { key: 'txt', style: { color: 'var(--text-secondary)' } }, text));
      } else if (tone === 'success') {
        children.push(h('span', { key: 'txt', style: { color: '#3fb950' } }, text));
      } else if (tone === 'muted') {
        children.push(h('span', { key: 'txt', style: { color: 'var(--text-muted)' } }, text));
      } else {
        children.push(h('span', { key: 'txt', style: { color: 'var(--text-secondary)' } }, text));
      }

      if (cursor && isLast) {
        children.push(
          h('span', {
            key: 'cur',
            className: 'ds-cursor-blink',
            style: {
              display: 'inline-block',
              width: '7px',
              height: '14px',
              marginLeft: '3px',
              verticalAlign: '-2px',
              background: 'var(--accent)',
            },
          })
        );
      }

      return h(
        'div',
        {
          key: i,
          style: {
            display: tone === 'command' ? 'flex' : 'block',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          },
        },
        children
      );
    });

    return h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          background: 'var(--surface-code)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          overflow: 'hidden',
        },
      },
      // Header
      h(
        'div',
        {
          style: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 14px',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
          },
        },
        // Traffic dots
        h(
          'div',
          {
            style: {
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              gap: '6px',
            },
          },
          ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.18)', 'rgba(255,255,255,0.18)'].map(function (c, i) {
            return h('span', {
              key: i,
              style: { width: '9px', height: '9px', borderRadius: '50%', background: c, display: 'inline-block' },
            });
          })
        ),
        h(
          'span',
          {
            style: {
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            },
          },
          title
        ),
        // Status dot
        h(
          'div',
          {
            style: {
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
            },
          },
          h('span', {
            className: status === 'running' ? 'ds-cursor-blink' : undefined,
            style: {
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: status === 'running' ? runningColor : doneColor,
              boxShadow:
                status === 'running'
                  ? '0 0 6px rgba(217, 119, 87, 0.6)'
                  : '0 0 6px rgba(63, 185, 80, 0.5)',
              display: 'inline-block',
            },
          })
        )
      ),
      // Body
      h(
        'div',
        {
          style: {
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 18px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12.5px',
            lineHeight: 1.7,
            minHeight: '160px',
          },
        },
        lineEls,
        h('div', { style: { flex: '1 1 auto' } }) // filler so short lists fill naturally
      )
    );
  };
})();
