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
