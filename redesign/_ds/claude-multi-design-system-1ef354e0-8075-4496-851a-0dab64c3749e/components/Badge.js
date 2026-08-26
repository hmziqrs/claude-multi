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
