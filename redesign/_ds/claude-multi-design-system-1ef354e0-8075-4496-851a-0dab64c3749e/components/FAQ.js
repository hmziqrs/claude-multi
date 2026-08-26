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
