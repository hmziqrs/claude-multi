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
