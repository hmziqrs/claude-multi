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
