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
