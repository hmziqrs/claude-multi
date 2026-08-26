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
