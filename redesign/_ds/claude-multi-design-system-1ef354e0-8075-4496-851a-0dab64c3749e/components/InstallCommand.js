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

  NS.InstallCommand = function InstallCommand(props) {
    var state = React.useState(false);
    var isCopied = state[0];
    var setCopied = state[1];

    var command = typeof props.command === 'string' ? props.command : String(props.command == null ? '' : props.command);

    var handleCopy = function () {
      copyText(command);
      setCopied(true);
      window.setTimeout(function () { setCopied(false); }, 1400);
    };

    return h(
      'div',
      {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '100%',
          padding: '10px 12px 10px 18px',
          background: 'var(--surface-code)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
        },
      },
      h(
        'span',
        {
          style: {
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        },
        h(
          'span',
          { style: { color: 'var(--accent)', fontWeight: 500, marginRight: '9px', userSelect: 'none' } },
          '$'
        ),
        h('span', { style: { color: 'var(--text-secondary)' } }, command)
      ),
      h(
        'button',
        {
          type: 'button',
          onClick: handleCopy,
          'aria-label': 'Copy install command',
          title: 'Copy',
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
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
            width: 14,
            height: 14,
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
                h('path', {
                  key: 'p',
                  d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
                }),
              ]
        )
      )
    );
  };
})();
