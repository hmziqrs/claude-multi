(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;
  var NS = (window.ClaudeMultiDesignSystem_1ef354 = window.ClaudeMultiDesignSystem_1ef354 || {});

  function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        return;
      }
    } catch (e) { /* fall through */ }
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) { /* ignore */ }
  }

  NS.CodeTabs = function CodeTabs(props) {
    var state = React.useState(0);
    var active = state[0];
    var setActive = state[1];

    var tabs = Array.isArray(props.tabs) ? props.tabs : [];
    if (!tabs.length) tabs = [{ label: '', code: '' }];
    var clamped = Math.min(Math.max(active, 0), tabs.length - 1);
    var current = tabs[clamped] || {};
    var label = typeof current.label === 'string' ? current.label : '';
    var code = typeof current.code === 'string' ? current.code : String(current.code == null ? '' : current.code);

    var copiedState = React.useState(false);
    var isCopied = copiedState[0];
    var setCopied = copiedState[1];
    // Reset copied flag when switching tabs.
    var lastTabState = React.useState(clamped);
    var lastTab = lastTabState[0];
    var setLastTab = lastTabState[1];
    if (lastTab !== clamped) {
      setLastTab(clamped);
      setCopied(false);
    }

    var handleCopy = function () {
      copyText(code);
      setCopied(true);
      window.setTimeout(function () { setCopied(false); }, 1400);
    };

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
      // Tab bar
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'stretch',
            padding: '0 8px',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
          },
        },
        tabs.map(function (tab, i) {
          var isActive = i === clamped;
          return h(
            'button',
            {
              key: i,
              type: 'button',
              onClick: function () { setActive(i); },
              style: {
                position: 'relative',
                appearance: 'none',
                background: 'transparent',
                border: 'none',
                borderBottom: '2px solid ' + (isActive ? 'var(--accent)' : 'transparent'),
                margin: '-1px 0',
                padding: '9px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11.5px',
                letterSpacing: '0.02em',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'color 120ms ease',
              },
              onMouseEnter: function (e) { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; },
              onMouseLeave: function (e) { if (!isActive) e.currentTarget.style.color = 'var(--text-muted)'; },
            },
            typeof tab.label === 'string' ? tab.label : ''
          );
        })
      ),
      // Body
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '12px 12px 12px 16px',
            flex: '1 1 auto',
            minHeight: 0,
          },
        },
        h(
          'code',
          {
            style: {
              flex: '1 1 auto',
              minWidth: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              lineHeight: 1.65,
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            },
          },
          code
        ),
        h(
          'button',
          {
            type: 'button',
            onClick: handleCopy,
            'aria-label': 'Copy command for ' + label,
            title: 'Copy',
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '26px',
              padding: 0,
              border: 'none',
              borderRadius: '6px',
              background: 'transparent',
              color: isCopied ? '#3fb950' : 'var(--text-muted)',
              cursor: 'pointer',
              flexShrink: 0,
            },
            onMouseEnter: function (e) { e.currentTarget.style.color = isCopied ? '#3fb950' : 'var(--text-secondary)'; },
            onMouseLeave: function (e) { e.currentTarget.style.color = isCopied ? '#3fb950' : 'var(--text-muted)'; },
          },
          h(
            'svg',
            {
              width: 13,
              height: 13,
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              strokeWidth: 1.75,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              'aria-hidden': true,
            },
            isCopied
              ? h('path', { d: 'M20 6 9 17l-5-5' })
              : [
                  h('rect', { key: 'r', x: 9, y: 9, width: 12, height: 12, rx: 2 }),
                  h('path', { key: 'p', d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' }),
                ]
          )
        )
      )
    );
  };
})();
