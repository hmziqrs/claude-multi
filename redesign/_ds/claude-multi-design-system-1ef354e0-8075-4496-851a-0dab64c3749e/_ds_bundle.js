// ClaudeMultiDesignSystem_1ef354 — generated design system bundle
// Order: icons first, then components alphabetically. Do not edit by hand.

// ===== icons.js =====
(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;
  var NS = (window.ClaudeMultiDesignSystem_1ef354 = window.ClaudeMultiDesignSystem_1ef354 || {});

  // Lucide-style inline SVG path data, 24x24 viewBox, stroke-based.
  var PATHS = {
    'git-branch': [
      { tag: 'line', attrs: { x1: '6', y1: '3', x2: '6', y2: '15' } },
      { tag: 'circle', attrs: { cx: '18', cy: '6', r: '3' } },
      { tag: 'circle', attrs: { cx: '6', cy: '18', r: '3' } },
      { tag: 'path', attrs: { d: 'M18 9a9 9 0 0 1-9 9' } }
    ],
    shield: [
      {
        tag: 'path',
        attrs: {
          d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'
        }
      }
    ],
    link: [
      { tag: 'path', attrs: { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' } },
      { tag: 'path', attrs: { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' } }
    ],
    terminal: [
      { tag: 'polyline', attrs: { points: '4 17 10 11 4 5' } },
      { tag: 'line', attrs: { x1: '12', y1: '19', x2: '20', y2: '19' } }
    ],
    key: [
      {
        tag: 'path',
        attrs: {
          d: 'm21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4'
        }
      }
    ],
    'hard-drive': [
      { tag: 'line', attrs: { x1: '22', y1: '12', x2: '2', y2: '12' } },
      {
        tag: 'path',
        attrs: {
          d: 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'
        }
      },
      { tag: 'line', attrs: { x1: '6', y1: '16', x2: '6.01', y2: '16' } },
      { tag: 'line', attrs: { x1: '10', y1: '16', x2: '10.01', y2: '16' } }
    ],
    briefcase: [
      { tag: 'path', attrs: { d: 'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' } },
      { tag: 'rect', attrs: { width: '20', height: '14', x: '2', y: '6', rx: '2' } }
    ],
    rocket: [
      { tag: 'path', attrs: { d: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z' } },
      { tag: 'path', attrs: { d: 'm12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z' } },
      { tag: 'path', attrs: { d: 'M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0' } },
      { tag: 'path', attrs: { d: 'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5' } }
    ],
    'flask-conical': [
      { tag: 'path', attrs: { d: 'M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2' } },
      { tag: 'path', attrs: { d: 'M8.5 2h7' } },
      { tag: 'path', attrs: { d: 'M7 16h10' } }
    ],
    'graduation-cap': [
      { tag: 'path', attrs: { d: 'M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z' } },
      { tag: 'path', attrs: { d: 'M22 10v6' } },
      { tag: 'path', attrs: { d: 'M6 12.5V16a6 3 0 0 0 12 0v-3.5' } }
    ],
    users: [
      { tag: 'path', attrs: { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' } },
      { tag: 'circle', attrs: { cx: '9', cy: '7', r: '4' } },
      { tag: 'path', attrs: { d: 'M22 21v-2a4 4 0 0 0-3-3.87' } },
      { tag: 'path', attrs: { d: 'M16 3.13a4 4 0 0 1 0 7.75' } }
    ],
    layers: [
      { tag: 'path', attrs: { d: 'm12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z' } },
      { tag: 'path', attrs: { d: 'm22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65' } },
      { tag: 'path', attrs: { d: 'm22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65' } }
    ],
    folder: [
      { tag: 'path', attrs: { d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z' } }
    ],
    check: [{ tag: 'path', attrs: { d: 'M20 6 9 17l-5-5' } }],
    copy: [
      { tag: 'rect', attrs: { width: '14', height: '14', x: '8', y: '8', rx: '2', ry: '2' } },
      { tag: 'path', attrs: { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' } }
    ],
    'chevron-down': [{ tag: 'path', attrs: { d: 'm6 9 6 6 6-6' } }],
    'arrow-right': [
      { tag: 'path', attrs: { d: 'M5 12h14' } },
      { tag: 'path', attrs: { d: 'm12 5 7 7-7 7' } }
    ],
    star: [
      {
        tag: 'polygon',
        attrs: {
          points:
            '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'
        }
      }
    ],
    github: [
      {
        tag: 'path',
        attrs: {
          d: 'M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4'
        }
      },
      { tag: 'path', attrs: { d: 'M9 18c-4.51 2-5-2-7-2' } }
    ],
    'external-link': [
      { tag: 'path', attrs: { d: 'M15 3h6v6' } },
      { tag: 'path', attrs: { d: 'M10 14 21 3' } },
      { tag: 'path', attrs: { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' } }
    ]
  };

  NS.Icon = function Icon(props) {
    props = props || {};
    var name = props.name;
    var size = props.size != null ? props.size : 16;
    var strokeWidth = props.strokeWidth != null ? props.strokeWidth : 1.75;

    var shapes = PATHS[name] || [
      // Unknown name -> small dot fallback
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '3' } }
    ];

    var children = shapes.map(function (shape, i) {
      return h(shape.tag, Object.assign({ key: i }, shape.attrs));
    });

    var style = Object.assign(
      { color: 'var(--text-muted)', flexShrink: 0, display: 'inline-block' },
      props.style || {}
    );
    if (props.color) style.color = props.color;

    return h(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: strokeWidth,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        style: style,
        'aria-hidden': true
      },
      children
    );
  };
})();

// ===== Badge.js =====
(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;
  var NS = (window.ClaudeMultiDesignSystem_1ef354 = window.ClaudeMultiDesignSystem_1ef354 || {});

  // Inject the pulse keyframes once.
  if (!document.getElementById('cm-badge-styles')) {
    var styleEl = document.createElement('style');
    styleEl.id = 'cm-badge-styles';
    styleEl.textContent =
      '@keyframes cm-badge-pulse {' +
      '0% { box-shadow: 0 0 0 0 rgba(217, 119, 87, 0.5); }' +
      '70% { box-shadow: 0 0 0 5px rgba(217, 119, 87, 0); }' +
      '100% { box-shadow: 0 0 0 0 rgba(217, 119, 87, 0); }' +
      '}';
    document.head.appendChild(styleEl);
  }

  NS.Badge = function Badge(props) {
    props = props || {};
    var tone = props.tone === 'neutral' ? 'neutral' : 'accent';

    var toneStyles =
      tone === 'accent'
        ? {
            background: 'var(--accent-soft)',
            border: '1px solid var(--accent-border)',
            color: 'var(--accent)'
          }
        : {
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)'
          };

    return h(
      'span',
      {
        className: props.className,
        style: Object.assign(
          {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            height: '24px',
            padding: '0 12px',
            borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            lineHeight: 1
          },
          toneStyles,
          props.style || {}
        )
      },
      props.dot
        ? h('span', {
            'aria-hidden': true,
            style: {
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'currentColor',
              flexShrink: 0,
              animation: 'cm-badge-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }
          })
        : null,
      props.children
    );
  };
})();

// ===== Button.js =====
(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;
  var NS = (window.ClaudeMultiDesignSystem_1ef354 = window.ClaudeMultiDesignSystem_1ef354 || {});

  var VARIANTS = {
    primary: {
      background: 'var(--accent)',
      color: '#16130f',
      border: '1px solid transparent',
      hoverFilter: 'brightness(1.08)'
    },
    secondary: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
      hoverBorder: 'var(--accent-border)',
      hoverBg: 'rgba(255, 255, 255, 0.03)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent',
      hoverColor: 'var(--text-primary)',
      hoverBg: 'rgba(255, 255, 255, 0.04)'
    }
  };

  NS.Button = function Button(props) {
    props = props || {};
    var variant = VARIANTS[props.variant] ? props.variant : 'primary';
    var v = VARIANTS[variant];
    var size = props.size === 'sm' ? 'sm' : 'md';

    var base = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      height: size === 'sm' ? '30px' : '38px',
      padding: size === 'sm' ? '0 12px' : '0 18px',
      fontSize: size === 'sm' ? '13px' : '14px',
      fontWeight: 500,
      fontFamily: 'var(--font-sans)',
      lineHeight: 1,
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition:
        'background var(--duration-fast) ease, border-color var(--duration-fast) ease, color var(--duration-fast) ease, filter var(--duration-fast) ease',
      WebkitTapHighlightColor: 'transparent'
    };

    if (variant === 'primary') {
      base.background = v.background;
      base.color = v.color;
      base.border = v.border;
    } else if (variant === 'secondary') {
      base.background = v.background;
      base.color = v.color;
      base.border = v.border;
    } else {
      base.color = v.color;
    }

    var hasTrailing =
      props.trailing !== undefined && props.trailing !== null && props.trailing !== '';

    return h(
      'button',
      {
        type: 'button',
        onClick: props.onClick,
        className: props.className,
        style: Object.assign(base, props.style || {}),
        onMouseEnter: function (e) {
          var s = e.currentTarget.style;
          if (variant === 'primary') {
            s.filter = v.hoverFilter;
          } else if (variant === 'secondary') {
            if (v.hoverBorder) s.borderColor = v.hoverBorder;
            if (v.hoverBg) s.backgroundColor = v.hoverBg;
          } else {
            if (v.hoverColor) s.color = v.hoverColor;
            if (v.hoverBg) s.backgroundColor = v.hoverBg;
          }
        },
        onMouseLeave: function (e) {
          var s = e.currentTarget.style;
          s.filter = '';
          if (variant === 'secondary') {
            s.borderColor = 'var(--border)';
            s.backgroundColor = 'transparent';
          } else if (variant === 'ghost') {
            s.color = v.color;
            s.backgroundColor = 'transparent';
          }
        }
      },
      h('span', { style: { display: 'inline-flex', alignItems: 'center' } }, props.children),
      hasTrailing
        ? h(
            'span',
            {
              style: {
                fontFamily: 'var(--font-mono)',
                fontSize: size === 'sm' ? '11px' : '12px',
                fontWeight: 400,
                color: variant === 'primary' ? 'rgba(22, 19, 15, 0.7)' : 'var(--text-muted)',
                marginLeft: '-2px'
              }
            },
            String(props.trailing)
          )
        : null
    );
  };
})();

// ===== CodeBlock.js =====
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

// ===== CodeTabs.js =====
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

// ===== FAQ.js =====
(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;
  var NS = (window.ClaudeMultiDesignSystem_1ef354 = window.ClaudeMultiDesignSystem_1ef354 || {});

  function Chevron(props) {
    var open = !!props.open;
    return h(
      'svg',
      {
        width: 16,
        height: 16,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '1.75',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
        style: {
          flex: 'none',
          color: 'var(--text-faint)',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform var(--duration-normal) var(--ease-out)',
        },
      },
      h('polyline', { points: '6 9 12 15 18 9' })
    );
  }

  NS.FAQ = function FAQ(props) {
    var eyebrow = props.eyebrow;
    var title = props.title;
    var items = Array.isArray(props.items) ? props.items : [];
    var _a = React.useState(0);
    var openIndex = _a[0];
    var setOpenIndex = _a[1];

    return h(
      'div',
      { style: { fontFamily: 'var(--font-sans)' } },
      /* Heading */
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '36px' } },
        eyebrow
          ? h(
              'div',
              {
                style: {
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '.07em',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                },
              },
              eyebrow
            )
          : null,
        title
          ? h(
              'h2',
              {
                style: {
                  margin: 0,
                  fontSize: '32px',
                  lineHeight: 1.15,
                  letterSpacing: '-.02em',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                },
              },
              title
            )
          : null
      ),

      /* Accordion list — bordered top + bottom, rows separated by hairlines */
      h(
        'div',
        { style: { borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' } },
        items.map(function (item, i) {
          var isOpen = i === openIndex;
          return h(
            'div',
            { key: i, style: { borderBottom: '1px solid var(--border-subtle)' } },
            h(
              'button',
              {
                type: 'button',
                onClick: function () { setOpenIndex(isOpen ? -1 : i); },
                'aria-expanded': isOpen,
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                  width: '100%',
                  padding: '20px 0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                },
              },
              h(
                'span',
                {
                  style: {
                    fontSize: '15.5px',
                    fontWeight: 500,
                    lineHeight: 1.4,
                    color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
                  },
                },
                item.question
              ),
              h(Chevron, { open: isOpen })
            ),
            /* Smooth expand/collapse via grid-template-rows */
            h(
              'div',
              {
                style: {
                  display: 'grid',
                  gridTemplateRows: isOpen ? '1fr' : '0fr',
                  transition: 'grid-template-rows var(--duration-normal) var(--ease-out)',
                },
              },
              h(
                'div',
                { style: { overflow: 'hidden' } },
                h(
                  'p',
                  {
                    style: {
                      margin: 0,
                      padding: isOpen ? '0 40px 22px 0' : '0 40px 0 0',
                      fontSize: '14px',
                      lineHeight: 1.65,
                      color: 'var(--text-secondary)',
                    },
                  },
                  item.answer
                )
              )
            )
          );
        })
      )
    );
  };
})();

// ===== FeatureCard.js =====
(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;
  var NS = (window.ClaudeMultiDesignSystem_1ef354 = window.ClaudeMultiDesignSystem_1ef354 || {});

  function svg(children) {
    return h(
      'svg',
      {
        width: 16,
        height: 16,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.75,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
      children
    );
  }

  var ICONS = {
    'git-branch': svg([
      h('line', { key: 'l1', x1: 6, y1: 3, x2: 6, y2: 15 }),
      h('circle', { key: 'c1', cx: 18, cy: 6, r: 3 }),
      h('circle', { key: 'c2', cx: 6, cy: 18, r: 3 }),
      h('path', { key: 'p1', d: 'M18 9a9 9 0 0 1-9 9' }),
    ]),
    shield: svg([h('path', { key: 'p', d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })]),
    link: svg([
      h('path', { key: 'p1', d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }),
      h('path', { key: 'p2', d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' }),
    ]),
    terminal: svg([
      h('polyline', { key: 'pl', points: '4 17 10 11 4 5' }),
      h('line', { key: 'ln', x1: 12, y1: 19, x2: 20, y2: 19 }),
    ]),
    key: svg([
      h('path', { key: 'p', d: 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4' }),
    ]),
    'hard-drive': svg([
      h('line', { key: 'l1', x1: 22, y1: 12, x2: 2, y2: 12 }),
      h('path', { key: 'p', d: 'M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z' }),
      h('line', { key: 'l2', x1: 6, y1: 16, x2: 6.01, y2: 16 }),
      h('line', { key: 'l3', x1: 10, y1: 16, x2: 10.01, y2: 16 }),
    ]),
    briefcase: svg([
      h('rect', { key: 'r', x: 2, y: 7, width: 20, height: 14, rx: 2 }),
      h('path', { key: 'p', d: 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' }),
    ]),
    rocket: svg([
      h('path', { key: 'p', d: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z' }),
      h('path', { key: 'p2', d: 'M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z' }),
      h('path', { key: 'p3', d: 'M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0' }),
      h('path', { key: 'p4', d: 'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5' }),
    ]),
    'flask-conical': svg([
      h('path', { key: 'p', d: 'M10 2v7.31' }),
      h('path', { key: 'p2', d: 'M14 9.3V1.99' }),
      h('path', { key: 'p3', d: 'M8.5 2h7' }),
      h('path', { key: 'p4', d: 'M14 9.3a6.5 6.5 0 1 1-4 0' }),
      h('path', { key: 'p5', d: 'M5.52 16h12.96' }),
    ]),
    'graduation-cap': svg([
      h('path', { key: 'p1', d: 'M22 10v6M2 10l10-5 10 5-10 5z' }),
      h('path', { key: 'p2', d: 'M6 12v5c3 3 9 3 12 0v-5' }),
    ]),
    users: svg([
      h('path', { key: 'p1', d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
      h('circle', { key: 'c1', cx: 9, cy: 7, r: 4 }),
      h('path', { key: 'p2', d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
      h('path', { key: 'p3', d: 'M16 3.13a4 4 0 0 1 0 7.75' }),
    ]),
  };

  NS.FeatureCard = function FeatureCard(props) {
    var hovered = React.useState(false);
    var isHovered = hovered[0];
    var setHovered = hovered[1];

    var iconEl = ICONS[props.icon] || null;

    return h(
      'div',
      {
        onMouseEnter: function () { setHovered(true); },
        onMouseLeave: function () { setHovered(false); },
        style: {
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--surface-1)',
          border: '1px solid ' + (isHovered ? 'var(--border)' : 'var(--border-subtle)'),
          borderRadius: '10px',
          padding: '22px',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          transition:
            'transform var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out)',
        },
      },
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            flexShrink: 0,
          },
        },
        iconEl
      ),
      h(
        'div',
        {
          style: {
            marginTop: '16px',
            fontSize: '15px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
          },
        },
        props.title
      ),
      props.description
        ? h(
            'div',
            {
              style: {
                marginTop: '8px',
                fontSize: '13.5px',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
              },
            },
            props.description
          )
        : null,
      props.children
        ? h('div', { style: { display: 'contents' } }, props.children)
        : null
    );
  };
})();

// ===== Footer.js =====
(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;
  var NS = (window.ClaudeMultiDesignSystem_1ef354 = window.ClaudeMultiDesignSystem_1ef354 || {});

  NS.Footer = function Footer(props) {
    var tagline = props.tagline;
    var note = props.note;
    var columns = Array.isArray(props.columns) ? props.columns : [];

    return h(
      'footer',
      {
        style: {
          borderTop: '1px solid var(--border-subtle)',
          padding: '64px 0 40px',
          background: 'var(--surface-page)',
          fontFamily: 'var(--font-sans)',
        },
      },
      h(
        'div',
        {
          style: {
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 32px',
          },
        },

        /* Top: wordmark left, tagline right */
        h(
          'div',
          {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '48px',
              flexWrap: 'wrap',
            },
          },
          h(
            'span',
            {
              style: {
                fontFamily: 'var(--font-mono)',
                fontSize: '15px',
                fontWeight: 500,
                letterSpacing: '-.02em',
                color: 'var(--text-primary)',
              },
            },
            'claude',
            h('span', { style: { color: 'var(--accent)', padding: '0 .12em' } }, '·'),
            'multi'
          ),
          tagline
            ? h(
                'p',
                {
                  style: {
                    margin: 0,
                    maxWidth: '420px',
                    fontSize: '13.5px',
                    lineHeight: 1.6,
                    color: 'var(--text-secondary)',
                  },
                },
                tagline
              )
            : null
        ),

        /* Link columns */
        h(
          'div',
          {
            style: {
              marginTop: '56px',
              display: 'grid',
              gridTemplateColumns: 'repeat(' + Math.max(columns.length, 1) + ', minmax(0, 1fr))',
              gap: '32px',
            },
          },
          columns.map(function (col, i) {
            return h(
              'div',
              { key: i },
              h(
                'div',
                {
                  style: {
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '.07em',
                    textTransform: 'uppercase',
                    color: 'var(--text-faint)',
                    marginBottom: '14px',
                  },
                },
                col.label
              ),
              h(
                'ul',
                { style: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' } },
                (Array.isArray(col.items) ? col.items : []).map(function (label, j) {
                  return h(
                    'li',
                    { key: j },
                    h(
                      'a',
                      {
                        href: '#',
                        style: {
                          fontSize: '13px',
                          lineHeight: 1.4,
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          transition: 'color var(--duration-fast) var(--ease-out)',
                        },
                        onMouseEnter: function (e) { e.currentTarget.style.color = 'var(--text-primary)'; },
                        onMouseLeave: function (e) { e.currentTarget.style.color = 'var(--text-secondary)'; },
                      },
                      label
                    )
                  );
                })
              )
            );
          })
        ),

        /* Bottom bar */
        h(
          'div',
          {
            style: {
              marginTop: '56px',
              paddingTop: '24px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
            },
          },
          h(
            'span',
            {
              style: {
                fontFamily: 'var(--font-mono)',
                fontSize: '11.5px',
                letterSpacing: '.02em',
                color: 'var(--text-muted)',
              },
            },
            note
          ),
          h(
            'span',
            { style: { fontSize: '11.5px', color: 'var(--text-faint)' } },
            'local-first · isolated configs'
          )
        )
      )
    );
  };
})();

// ===== InstallCommand.js =====
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

// ===== MetricCard.js =====
(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;
  var NS = (window.ClaudeMultiDesignSystem_1ef354 = window.ClaudeMultiDesignSystem_1ef354 || {});

  NS.MetricCard = function MetricCard(props) {
    var tone = props.tone === 'accent';
    var bordered = !!props.bordered;

    var style = {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: '10px',
      minHeight: '120px',
      padding: '22px',
      background: 'var(--surface-1)',
    };
    if (bordered) {
      style.borderLeft = '1px solid var(--border-subtle)';
    }

    return h(
      'div',
      { style: style },
      h(
        'div',
        {
          style: {
            fontFamily: 'var(--font-mono)',
            fontSize: '34px',
            lineHeight: 1,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
            color: tone ? 'var(--accent)' : 'var(--text-primary)',
          },
        },
        props.value
      ),
      h(
        'div',
        {
          style: {
            fontSize: '12px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: 'var(--text-muted)',
          },
        },
        props.label
      )
    );
  };
})();

// ===== ProductTable.js =====
(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;
  var NS = (window.ClaudeMultiDesignSystem_1ef354 = window.ClaudeMultiDesignSystem_1ef354 || {});

  NS.ProductTable = function ProductTable(props) {
    var columns = props.columns || [];
    var rows = props.rows || [];
    var dense = !!props.dense;
    var selectedIndex =
      typeof props.selectedIndex === 'number' ? props.selectedIndex : -1;

    var rowPadV = dense ? '8px' : '12px';
    var rowPadH = dense ? '14px' : '16px';

    var gridTemplate = columns
      .map(function (col) {
        return col.width || '1fr';
      })
      .join(' ');

    var headerCells = columns.map(function (col) {
      return h(
        'div',
        {
          key: 'h-' + col.key,
          style: {
            fontFamily: 'var(--font-mono)',
            fontSize: '10.5px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
            padding: rowPadH + ' ' + rowPadH,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        },
        col.label
      );
    });

    var bodyRows = rows.map(function (row, i) {
      var selected = i === selectedIndex;

      var cells = columns.map(function (col) {
        var cellStyle = {
          padding: rowPadV + ' ' + rowPadH,
          fontSize: '13px',
          lineHeight: 1.45,
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        };
        if (col.emphasis) {
          cellStyle.fontWeight = 500;
          cellStyle.color = 'var(--text-primary)';
        }
        if (col.mono) {
          cellStyle.fontFamily = 'var(--font-mono)';
          cellStyle.fontSize = '12px';
          cellStyle.color = 'var(--text-secondary)';
        }
        return h(
          'div',
          { key: col.key, style: cellStyle, title: row[col.key] },
          row[col.key]
        );
      });

      return h(
        'div',
        {
          key: 'r-' + i,
          style: {
            display: 'grid',
            gridTemplateColumns: gridTemplate,
            alignItems: 'center',
            background: selected
              ? 'color-mix(in srgb, var(--accent) 8%, transparent)'
              : 'transparent',
            boxShadow: selected
              ? 'inset 2px 0 0 var(--accent)'
              : 'none',
            borderBottom: i < rows.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            transition: 'background var(--duration-instant) var(--ease-out)',
          },
          onMouseEnter: function (e) {
            if (!selected) e.currentTarget.style.background = 'var(--surface-code)';
          },
          onMouseLeave: function (e) {
            if (!selected) e.currentTarget.style.background = 'transparent';
          },
        },
        cells
      );
    });

    return h(
      'div',
      { style: { width: '100%', display: 'flex', flexDirection: 'column' } },
      h(
        'div',
        {
          style: {
            display: 'grid',
            gridTemplateColumns: gridTemplate,
            alignItems: 'center',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--surface-1)',
          },
        },
        headerCells
      ),
      h('div', { style: { display: 'flex', flexDirection: 'column' } }, bodyRows)
    );
  };
})();

// ===== StatusBadge.js =====
(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;
  var NS = (window.ClaudeMultiDesignSystem_1ef354 = window.ClaudeMultiDesignSystem_1ef354 || {});

  var STATUS_COLORS = {
    connected: '#3fb950',
    idle: '#787f8c',
    running: 'var(--accent)'
  };

  NS.StatusBadge = function StatusBadge(props) {
    props = props || {};
    var status = STATUS_COLORS[props.status] ? props.status : 'idle';
    var dotColor = STATUS_COLORS[status];

    return h(
      'span',
      {
        className: props.className,
        style: Object.assign(
          {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            fontSize: '12px',
            fontFamily: 'var(--font-sans)',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            lineHeight: 1
          },
          props.style || {}
        )
      },
      h('span', {
        'aria-hidden': true,
        style: {
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          flexShrink: 0
        }
      }),
      props.label != null ? props.label : status
    );
  };
})();

// ===== Tag.js =====
(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;
  var NS = (window.ClaudeMultiDesignSystem_1ef354 = window.ClaudeMultiDesignSystem_1ef354 || {});

  NS.Tag = function Tag(props) {
    props = props || {};
    return h(
      'span',
      {
        className: props.className,
        style: Object.assign(
          {
            display: 'inline-flex',
            alignItems: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            lineHeight: 1,
            padding: '4px 8px',
            borderRadius: '5px',
            border: '1px solid var(--border-subtle)',
            background: 'var(--surface-code)',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap'
          },
          props.style || {}
        )
      },
      props.children
    );
  };
})();

// ===== Terminal.js =====
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

// ===== Workflow.js =====
(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;
  var NS = (window.ClaudeMultiDesignSystem_1ef354 = window.ClaudeMultiDesignSystem_1ef354 || {});

  /* Inject keyframes once */
  if (!document.getElementById('cm-ds-workflow-style')) {
    var st = document.createElement('style');
    st.id = 'cm-ds-workflow-style';
    st.textContent =
      '@keyframes cm-wf-dash{from{background-position:0 0}to{background-position:16px 0}}' +
      '@keyframes cm-wf-pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(74,222,128,.35)}50%{opacity:.75;box-shadow:0 0 0 4px rgba(74,222,128,0)}}' +
      '@media (prefers-reduced-motion: reduce){' +
      '[data-cm-wf-flow]{animation:none!important}' +
      '[data-cm-wf-dot]{animation:none!important}' +
      '}';
    document.head.appendChild(st);
  }

  function Icon(props) {
    var name = props.name;
    var size = props.size || 13;
    var paths = {
      'layers': [
        h('polygon', { points: '12 2 2 7 12 12 22 7 12 2' }),
        h('polyline', { points: '2 17 12 22 22 17' }),
        h('polyline', { points: '2 12 12 17 22 12' }),
      ],
      'folder': [
        h('path', { d: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' }),
      ],
      'box': [
        h('path', { d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' }),
        h('polyline', { points: '3.27 6.96 12 12.01 20.73 6.96' }),
        h('line', { x1: '12', y1: '22.08', x2: '12', y2: '12' }),
      ],
    };
    return h(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '1.75',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        style: { flex: 'none' },
        'aria-hidden': true,
      },
      paths[name] || paths['box']
    );
  }

  /* A single node card inside a branch chain */
  function NodeCard(props) {
    var node = props.node || {};
    var bright = !!props.bright;
    var violet = node.tone === 'violet';
    var running = node.status === 'running';

    return h(
      'div',
      {
        style: {
          flex: '1 1 0',
          minWidth: 0,
          background: bright ? 'var(--surface-code)' : 'var(--surface-code)',
          border: '1px solid ' + (bright ? 'var(--border)' : 'var(--border-subtle)'),
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
        },
      },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '7px', minHeight: '15px' } },
        node.icon
          ? h(Icon, { name: node.icon, size: 12 })
          : null,
        h(
          'span',
          {
            style: {
              fontSize: '12.5px',
              fontWeight: 500,
              lineHeight: 1.3,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          },
          node.label
        ),
        running
          ? h('span', {
              'data-cm-wf-dot': true,
              title: 'running',
              style: {
                flex: 'none',
                marginLeft: 'auto',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--success)',
                animation: 'cm-wf-pulse 2s ease-in-out infinite',
              },
            })
          : null
      ),
      node.sublabel
        ? h(
            'span',
            {
              style: {
                fontFamily: 'var(--font-mono)',
                fontSize: '10.5px',
                lineHeight: 1.4,
                letterSpacing: '.01em',
                color: violet ? '#a78bfa' : 'var(--text-faint)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            },
            node.sublabel
          )
        : null
    );
  }

  /* Horizontal connector segment; flows when active + animated */
  function FlowLine(props) {
    var flow = !!props.flow;
    var color = props.color;
    var base = {
      height: '1px',
      flex: 'none',
      backgroundColor: color,
    };
    if (flow) {
      delete base.backgroundColor;
      base.backgroundImage =
        'repeating-linear-gradient(90deg, ' + color + ' 0, ' + color + ' 4px, transparent 4px, transparent 8px)';
      base.animation = 'cm-wf-dash 1s linear infinite';
    }
    return h('div', { 'data-cm-wf-flow': flow ? '' : undefined, style: base });
  }

  NS.Workflow = function Workflow(props) {
    var root = props.root || {};
    var branches = Array.isArray(props.branches) ? props.branches : [];
    var animated = props.animated !== false;

    var hasActive = branches.some(function (b) { return b && b.active; });

    return h(
      'div',
      { style: { fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' } },
      /* Root node */
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--surface-code)',
            border: '1px solid var(--accent-border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
          },
        },
        h(
          'span',
          {
            style: {
              flex: 'none',
              width: '26px',
              height: '26px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent-border)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          },
          h(Icon, { name: root.icon || 'layers', size: 13 })
        ),
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 } },
          h(
            'span',
            { style: { fontSize: '12.5px', fontWeight: 600, lineHeight: 1.3 } },
            root.label
          ),
          root.sublabel
            ? h(
                'span',
                {
                  style: {
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10.5px',
                    lineHeight: 1.4,
                    color: 'var(--text-faint)',
                  },
                },
                root.sublabel
              )
            : null
        )
      ),

      /* Branch fan-out */
      h(
        'div',
        {
          style: {
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginTop: '12px',
          },
        },
        /* Vertical rail fanning out of the root */
        h('div', {
          'aria-hidden': true,
          style: {
            position: 'absolute',
            left: 0,
            top: '-12px',
            bottom: '30px',
            width: '1px',
            backgroundColor: hasActive ? 'var(--border)' : 'var(--border-subtle)',
          },
        }),
        branches.map(function (branch, i) {
          var chain = (branch && Array.isArray(branch.chain)) ? branch.chain : [];
          var isActive = !!(branch && branch.active);
          var flow = isActive && animated;
          var lineColor = isActive ? 'var(--border)' : 'var(--border-subtle)';
          var flowColor = 'rgba(217, 119, 87, 0.55)';

          return h(
            'div',
            { key: i, style: { display: 'flex', alignItems: 'stretch' } },
            /* Elbow: rail -> first node */
            h(
              'div',
              { 'aria-hidden': true, style: { flex: 'none', width: '16px', position: 'relative' } },
              h('div', {
                'data-cm-wf-flow': flow ? '' : undefined,
                style: flow
                  ? {
                      position: 'absolute',
                      top: '26px',
                      left: 0,
                      right: 0,
                      height: '1px',
                      backgroundImage:
                        'repeating-linear-gradient(90deg, ' + flowColor + ' 0, ' + flowColor + ' 4px, transparent 4px, transparent 8px)',
                      animation: 'cm-wf-dash 1s linear infinite',
                    }
                  : {
                      position: 'absolute',
                      top: '26px',
                      left: 0,
                      right: 0,
                      height: '1px',
                      backgroundColor: lineColor,
                    },
              })
            ),
            /* Chain row: node -> connector -> node */
            h(
              'div',
              { style: { flex: '1 1 auto', minWidth: 0, display: 'flex', alignItems: 'stretch' } },
              chain.map(function (node, j) {
                var parts = [h(NodeCard, { key: j, node: node, bright: isActive })];
                if (j < chain.length - 1) {
                  parts.push(
                    h('div', { key: 'c' + j, 'aria-hidden': true, style: { flex: 'none', width: '12px', display: 'flex', alignItems: 'center' } },
                      h(FlowLine, { flow: flow, color: flow ? flowColor : lineColor }))
                  );
                }
                return parts;
              }).reduce(function (acc, arr) { return acc.concat(arr); }, [])
            )
          );
        })
      )
    );
  };
})();
