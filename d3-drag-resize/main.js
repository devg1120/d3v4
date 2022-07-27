import * as d3 from "d3v4";


import './style.css'

    let x = 300;
    let y = 100;
    let width = 180;
    let height = 120;
    let rotationAngle = 0;

    const ROTATION_HANDLE_RADIUS = 10;
    const ROTATION_HANDLE_MARGIN = 12;

    const svg = d3.select('body').append('svg')
      .attr('width', 600)
      .attr('height', 400)
      .style('background-color', 'lightgray');

    const shapeGroup = svg.append('g')
      .call(
        d3.drag()
          .on('drag', () => onDrag())
      );

    const rectangle = shapeGroup.append('rect')
      .attr('fill', 'rebeccapurple');

    const rotationGroup = shapeGroup
      .append('g')
      .attr('transform', 'translate(0,-2)')
      .call(
        d3.drag()
          .on('drag', () => onRotation())
      );

    const deviceRotationLine = rotationGroup
      .append('line')
      .style('outline','1px solid darkblue');

    const deviceRotationCircle = rotationGroup
      .append('circle')
      .style('fill','darkblue')
      .style('cursor','grab');

    const deviceRotationAngleLabel = shapeGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .style('fill','darkblue')
      .attr('alignment-baseline', 'central');

    const resizeGroup = shapeGroup.append('g');

    const resizeHandles = [
      ['NW', 'N', 'NE'],
      ['W', undefined, 'E'],
      ['SW', 'S', 'SE']
    ].map((resizeHandleRow) => {
      return resizeHandleRow.map((handle) => {
        if (!handle) {
            return undefined;
        }
        const resizeCursors = {
        'NW': 'nwse-resize',
        'N': 'ns-resize',
        'NE': 'nesw-resize',
        'W': 'ew-resize',
        'E': 'ew-resize',
        'SW': 'nesw-resize',
        'S': 'ns-resize',
        'SE': 'nwse-resize'
      }

      const resizeHandle = resizeGroup
        .append('rect')
        .attr('width', 8 * 2)
        .attr('height', 8 * 2)
        .attr('x', -8)
        .attr('y', -8)
        .attr('cursor', resizeCursors[handle])
        .attr('fill', 'fuchsia')
        .call(
          d3.drag()
          .on('drag', () => onResize(handle))
        );

        return resizeHandle;
      });
    });

    function onRotation() {

      function angleBetweenTwoPointsRadians(point1, point2) {
        if (point1[0] === point2[0] && point1[1] === point2[1]) {
          return Math.PI / 2;
        }
        return Math.atan2(point2[1] - point1[1], point2[0] - point1[0]);
      }

      function radiansToDegrees(radians) {
        return radians / (Math.PI / 180);
      }

      function normalizeAngle(angle) {
        return Math.round((angle + 360) % 360);
      }

      const rotateHandleVerticalPos = (height / 2) + ROTATION_HANDLE_MARGIN;

      let deltaAngleRadians = angleBetweenTwoPointsRadians([0, 0], [d3.event.x, d3.event.y]);
      deltaAngleRadians = deltaAngleRadians - angleBetweenTwoPointsRadians([0, 0], [0, -rotateHandleVerticalPos]);

      const deltaAngleDegrees = radiansToDegrees(deltaAngleRadians);
      rotationAngle = normalizeAngle(rotationAngle + deltaAngleDegrees);

      renderShape();
    }

    function onResize(handle) {
      const event = d3.event;

      const heightOverWidth = height / width;
      const widthOverHeight = width / height;

      const oldX = x;
      const oldY = y;
      const oldWidth = width;
      const oldHeight = height;
      const shiftKey = event.sourceEvent.shiftKey;
      let { dx, dy } = event;
      switch (handle) {
        case 'N':
          height += event.y * -1;
          y += event.y / 2;
          //width += event.y * widthOverHeight * -1;
          break;

        case 'NE':
          width += event.dx;
          height += event.y * -1;
          x += event.dx / 2;
          y += event.y / 2;
          break;

        case 'E':
          width += event.dx;
          x += event.dx / 2;
          //height += event.dx * heightOverWidth;
          break;

        case 'SE':
          if (shiftKey) {
              dx = widthOverHeight * dy;
              dy = dx * heightOverWidth;
          }

          width += dx;
          height += dy;
          x += dx / 2;
          y += dy / 2;
          break;

        case 'S':
          height += event.dy;
          //width += event.dy * widthOverHeight;
          y += event.dy / 2;
          break;

        case 'SW':
          width += event.x * -1;
          height += event.dy;
          x += event.x / 2;
          y += event.dy / 2;
          break;

        case 'W':
          width += event.x * -1;
          x += event.x / 2;
          //height += event.x * heightOverWidth * -1;
          break;

        case 'NW':
          width += event.x * -1;
          height += event.y * -1;
          x += event.x / 2;
          y += event.y / 2;
          break;
      }

      // Enforce min width & height
      if (width <= 50 || height <= 50) {
        x = oldX;
        y = oldY;
        width = oldWidth;
        height = oldHeight;
      }

      renderShape();
    }

    function onDrag() {
      x += d3.event.dx;
      y += d3.event.dy;

      renderShape();
    }

    function renderShape() {
      shapeGroup
        .attr('transform', `translate(${x}, ${y}) rotate(${rotationAngle})`);

      rectangle
        .attr('width', width)
        .attr('height', height)
        .attr('transform', `translate(${-(width/2)}, ${-(height/2)})`);

      resizeGroup.attr('transform', `translate(${-(width/2)}, ${-(height/2)})`)

      // Render resize handles
      for (const [i, row] of resizeHandles.entries()) {
        const offsetY = height * (i / 2);

        for (const [j, handle] of row.entries()) {
          if (handle) {
            const offsetX = width * (j / 2);
            handle.attr('transform', `translate(${offsetX}, ${offsetY})`);
          }
        }
      }

      // Render rotation handle
      const rotateHandleVerticalPos = height / 2 + ROTATION_HANDLE_MARGIN;

      deviceRotationLine
        .attr('y1', -rotateHandleVerticalPos)
        .attr('y2', -(height / 2));

      deviceRotationCircle
        .attr('cy', -(rotateHandleVerticalPos + ROTATION_HANDLE_RADIUS))
        .attr('r', ROTATION_HANDLE_RADIUS);

      deviceRotationAngleLabel
        .attr(
          'transform',
          'translate(' +
            (ROTATION_HANDLE_RADIUS * 3) + ','
            + -(rotateHandleVerticalPos + ROTATION_HANDLE_MARGIN) +
          ') rotate(' +
            -rotationAngle +
          ')'
        )
        .text(rotationAngle + String.fromCharCode(176));
    }

    renderShape();

