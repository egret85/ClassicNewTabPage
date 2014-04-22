   /**
   * Helper for styling a menu button with a drop-down arrow indicator.
   * Creates a new 2D canvas context and draws a downward-facing arrow into it.
   * @param {string} canvasName The name of the canvas. The canvas can be
   *     addressed from CSS using -webkit-canvas(<canvasName>).
   * @param {number} width The width of the canvas and the arrow.
   * @param {number} height The height of the canvas and the arrow.
   * @param {string} colorSpec The CSS color to use when drawing the arrow.
   */
  function createDropDownArrowCanvas(canvasName, width, height, colorSpec) {
    var ctx = document.getCSSCanvasContext('2d', canvasName, width, height);
    ctx.fillStyle = ctx.strokeStyle = colorSpec;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(height, height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  /** @const */ var ARROW_WIDTH = 6;
  /** @const */ var ARROW_HEIGHT = 3;
  /** @const */ var NORMALCOLOR = 'rgb(192, 195, 198)';
  /** @const */ var HOVERCOLOR = 'rgb(48, 57, 66)';
  /** @const */ var ACTIVECOLOR = 'white';

  /**
   * Create the images used to style drop-down-style MenuButtons.
   * This should be called before creating any MenuButtons that will have the
   * CSS class 'drop-down'.
   */
 
    createDropDownArrowCanvas(
        'drop-down-arrow', ARROW_WIDTH, ARROW_HEIGHT, NORMALCOLOR);
    createDropDownArrowCanvas(
        'drop-down-arrow-hover', ARROW_WIDTH, ARROW_HEIGHT, HOVERCOLOR);
    createDropDownArrowCanvas(
        'drop-down-arrow-active', ARROW_WIDTH, ARROW_HEIGHT, ACTIVECOLOR);