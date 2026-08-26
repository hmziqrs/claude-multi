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
