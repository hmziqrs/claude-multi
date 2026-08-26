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
