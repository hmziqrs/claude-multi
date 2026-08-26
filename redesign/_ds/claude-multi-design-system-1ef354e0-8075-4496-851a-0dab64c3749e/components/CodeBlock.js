(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;
  var NS = (window.ClaudeMultiDesignSystem_1ef354 = window.ClaudeMultiDesignSystem_1ef354 || {});

  var CopyIcon = function () {
    return h(
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
      h('rect', { x: 9, y: 9, width: 12, height: 12, rx: 2 }),
      h('path', { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' })
    );
  };

  var CheckIcon = function () {
    return h(
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
      h('path', { d: 'M20 6 9 17l-5-5' })
    );
  };

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

  // Basic JSON tinting: keys accent-ish, string values greenish, numbers/info, booleans/null warning.
  // Falls back to plain text on any unexpected input — never crashes.
  function highlightJson(code) {
    var out = [];
    var re = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b/g;
    var last = 0;
    var m;
    try {
      while ((m = re.exec(code)) !== null) {
        if (m.index > last) out.push(h('span', { key: out.length }, code.slice(last, m.index)));
        if (m[1] !== undefined) {
          var isKey = m[2] !== undefined;
          out.push(
            h(
              'span',
              { key: out.length, style: { color: isKey ? 'var(--accent-hover)' : '#7ee2a8' } },
              m[1]
            )
          );
          if (isKey) out.push(h('span', { key: out.length, style: { color: 'var(--text-muted)' } }, m[2]));
        } else if (m[3] !== undefined) {
          out.push(h('span', { key: out.length, style: { color: 'var(--info)' } }, m[3]));
        } else if (m[4] !== undefined) {
          out.push(h('span', { key: out.length, style: { color: 'var(--warning)' } }, m[4]));
        }
        last = re.lastIndex;
      }
      if (last < code.length) out.push(h('span', { key: out.length }, code.slice(last)));
      return out.length ? out : [code];
    } catch (e) {
      return [code];
    }
  }

  NS.CodeBlock = function CodeBlock(props) {
    var copied = React.useState(false);
    var isCopied = copied[0];
    var setCopied = copied[1];

    var filename = props.filename || '';
    var language = props.language || '';
    var code = typeof props.code === 'string' ? props.code : String(props.code == null ? '' : props.code);

    var bodyChildren;
    if (language === 'json') {
      bodyChildren = highlightJson(code);
    } else {
      bodyChildren = [code];
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
      // Header
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '8px 8px 8px 14px',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
          },
        },
        h(
          'span',
          {
            style: {
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
          },
          filename
        ),
        h(
          'button',
          {
            type: 'button',
            onClick: handleCopy,
            'aria-label': 'Copy code',
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
          isCopied ? h(CheckIcon) : h(CopyIcon)
        )
      ),
      // Body
      h(
        'pre',
        {
          style: {
            margin: 0,
            flex: '1 1 auto',
            padding: '14px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            lineHeight: 1.65,
            color: 'var(--text-secondary)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowX: 'auto',
          },
        },
        bodyChildren
      )
    );
  };
})();
