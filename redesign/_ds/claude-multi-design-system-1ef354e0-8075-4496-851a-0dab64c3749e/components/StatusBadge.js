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
