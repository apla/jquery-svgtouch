/**
   THIS LICENSE IS FOR JQUERY-SVGPAN.  The original SVGPan library,
   from which it derived, is governed by the second license below.

   Copyright 2012 John Krauss. All rights reserved.

   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions
   are met:

   1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above
   copyright notice, this list of conditions and the following
   disclaimer in the documentation and/or other materials provided
   with the distribution.

   THIS SOFTWARE IS PROVIDED BY JOHN KRAUSS ''AS IS'' AND ANY EXPRESS
   OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
   WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
   ARE DISCLAIMED. IN NO EVENT SHALL JOHN KRAUSS OR CONTRIBUTORS BE
   LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
   CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
   OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
   BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
   (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
   USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
   DAMAGE.

   The views and conclusions contained in the software and
   documentation are those of the authors and should not be
   interpreted as representing official policies, either expressed or
   implied, of John Krauss.
**/

// SVGPan library 1.3 license and documentation:

/**
 *  SVGPan library 1.3
 * ======================
 *
 * Given an unique existing element with id "viewport" (or when missing, the
 * first g-element), including the the library into any SVG adds the following
 * capabilities:
 *
 *  - Mouse panning
 *  - Mouse zooming (using the wheel)
 *  - Touch panning
 *  - Multi-Touch zooming (using two figer pinch to zoom gesture)
 *  - Object dragging
 *
 * You can configure the behaviour of the pan/zoom/drag with the variables
 * listed in the CONFIGURATION section of this file.
 *
 * Known issues:
 *
 *  - Zooming (while panning) on Safari has still some issues
 *
 * Releases:
 *
 * 1.3, Fri May 24 23:12:05 GMT 2013, Pawel Sledzikowski
 *    Added multi-touch support
 *
 * 1.2.2, Tue Aug 30 17:21:56 CEST 2011, Andrea Leofreddi
 *    - Fixed viewBox on root tag (#7)
 *    - Improved zoom speed (#2)
 *
 * 1.2.1, Mon Jul  4 00:33:18 CEST 2011, Andrea Leofreddi
 *    - Fixed a regression with mouse wheel (now working on Firefox 5)
 *    - Working with viewBox attribute (#4)
 *    - Added "use strict;" and fixed resulting warnings (#5)
 *    - Added configuration variables, dragging is disabled by default (#3)
 *
 * 1.2, Sat Mar 20 08:42:50 GMT 2010, Zeng Xiaohui
 *    Fixed a bug with browser mouse handler interaction
 *
 * 1.1, Wed Feb  3 17:39:33 GMT 2010, Zeng Xiaohui
 *    Updated the zoom code to support the mouse wheel on Safari/Chrome
 *
 * 1.0, Andrea Leofreddi
 *    First release
 *
 * This code is licensed under the following BSD license:
 *
 * Copyright 2009-2010 Andrea Leofreddi <a.leofreddi@itcharm.com>. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 *
 *    1. Redistributions of source code must retain the above copyright notice, this list of
 *       conditions and the following disclaimer.
 *
 *    2. Redistributions in binary form must reproduce the above copyright notice, this list
 *       of conditions and the following disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY Andrea Leofreddi ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Andrea Leofreddi OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation are those of the
 * authors and should not be interpreted as representing official policies, either expressed
 * or implied, of Andrea Leofreddi.
 */

/*global define, jQuery, window*/

(function (factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    "use strict";
    var NONE = 0,
        PAN = 1,
        DRAG = 2,
        init = function (root, svgRoot, enablePan, enableZoom, enableDrag, enableTouch, zoomScale) {

            var state = NONE,
                stateTarget,
                stateOrigin,
                stateTf,
                svgDoc = root,
                $root = $(root),
                $parent = $root.parent(),
                recentOffset = $root.offset(),
                startTouches = [],

                // FF sometimes doesn't calculate this anything near correctly
                // for SVGs.
                offsetIsBroken = Math.abs($root.offset().left) > 1e5,
                isMouseOverElem = false,

                /**
                 * Dumps a matrix to a string (useful for debug).
                 */
                dumpMatrix = function (matrix) {
                    var s = "[ " + matrix.a + ", " + matrix.c + ", " + matrix.e + "\n  " + matrix.b + ", " + matrix.d + ", " + matrix.f + "]";

                    return s;
                },

                /**
                 * Gets distance between two point touches.
                 */
                getDistance = function (touch1, touch2) {
                    var x = touch2.pageX - touch1.pageX,
                        y = touch2.pageY - touch1.pageY;
                    return Math.sqrt((x*x) + (y*y));
                },

                /**
                 * Update touch coordinates based on some other touch coordinates.
                 */
                updateTouch = function (dstTouch, srcTouch) {
                  dstTouch.pageX = srcTouch.pageX;
                  dstTouch.pageY = srcTouch.pageY;
                },

                /**
                 * Instance an SVGPoint object with given touch event coordinates.
                 */
                getTouchEventPoint = function (evt) {
                  var p = root.createSVGPoint(),
                      targetTouches = evt.targetTouches,
                      offsetX,
                      offsetY;

                  if (targetTouches.length) {
                    var touch = targetTouches[0];
                    offsetX = touch.pageX;
                    offsetY = touch.pageY;
                  }

                  p.x = offsetX;
                  p.y = offsetY;

                  return p;
                },

                /**
                 * Instance an SVGPoint object with given event coordinates.
                 */
                getEventPoint = function (evt) {
                    var p = root.createSVGPoint(),
                        offsetX = evt.offsetX,
                        offsetY = evt.offsetY,
                        offset,
                        ctm,
                        matrix;

                    if (typeof offsetX === "undefined" || typeof offsetY === "undefined") {
                        offset = offsetIsBroken ? $parent.offset() : recentOffset;
                        offsetX = evt.pageX - offset.left;
                        offsetY = evt.pageY - offset.top;
                    }

                    p.x = offsetX;
                    p.y = offsetY;

                    return p;
                },

                /**
                 * Sets the current transform matrix of an element.
                 */
                setCTM = function (element, matrix) {
                    var s = "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + matrix.e + "," + matrix.f + ")";

                    element.setAttribute("transform", s);
                },

                /**
                 * Handle touch start event.
                 */
                handleTouchStart = function (evt) {
                  var g = svgRoot;

                  stateTf = g.getCTM().inverse();

                  stateOrigin = getTouchEventPoint(evt).matrixTransform(stateTf);

                  var touches = evt.touches;
                  // Check if there are two or more touches (fingers) and in
                  // case so store copy of all of them for future reference
                  // in pinching (zooming) functionality.
                  if (touches.length >= 2) {
                    touches.forEach(function (touch) {
                      var found = false;
                      startTouches.forEach(function (startTouch) {
                        if (touch.identifier === startTouch.identifier) {
                          found = true;
                          return;
                        }
                      });
                      if (!found) {
                        var touchCopy = $.extend({}, touch);
                        startTouches.push(touchCopy);
                      }
                    });
                  }

                  evt.preventDefault();
                },

                /**
                 * Handle touch end event.
                 */
                handleTouchEnd = function (evt) {
                  // Remove ending touches from internal helper collection
                  // related to pinch to zoom gesture.
                  evt.changedTouches.forEach(function (changedTouch) {
                    startTouches.forEach(function (startTouch) {
                      if (startTouch.identifier === changedTouch.identifier) {
                        var idx = startTouches.indexOf(startTouch);
                        startTouches.splice(idx, 1);
                      }
                    });
                  });

                  evt.preventDefault();
                },

                /**
                 * Handle touch move event.
                 */
                handleTouchMove = function (evt) {
                  evt.preventDefault();

                  var g = svgRoot,
                      touches = evt.touches,
                      z,
                      p,
                      k;

                  // Handle zoom while 2 fingers
                  if (touches.length >= 2 && enableZoom) {
                    var touch0 = touches[0]
                      , touch1 = touches[1];

                    var startTouch0 = startTouches[0];
                    var startTouch1 = startTouches[1];

                    z = getDistance(touch0, touch1) / getDistance(startTouch0, startTouch1);

                    p = root.createSVGPoint();
                    p.x = (touch0.pageX + touch1.pageX) / 2;
                    p.y = (touch0.pageY + touch1.pageY) / 2;

                    p = p.matrixTransform(g.getCTM().inverse());

                    // Compute new scale matrix in current mouse position
                    k = root.createSVGMatrix().translate(p.x, p.y).scale(z).translate(-p.x, -p.y);

                    setCTM(g, g.getCTM().multiply(k));

                    if (typeof stateTf === "undefined") {
                        stateTf = g.getCTM().inverse();
                    }

                    stateTf = stateTf.multiply(k.inverse());

                    // Update future starting touch coordinates with present
                    // values.
                    updateTouch(startTouch0, touch0);
                    updateTouch(startTouch1, touch1);
                  } else if (!startTouches.length && enablePan) {
                    // Panning is disabled while simultaneously pinch to
                    // zoom gesture is activated.
                    p = getTouchEventPoint(evt).matrixTransform(stateTf);

                    setCTM(g, stateTf.inverse().translate(p.x - stateOrigin.x, p.y - stateOrigin.y));
                  }
                },

                /**
                 * Handle mouse wheel event.
                 */
                handleMouseWheel = function (evt) {
                    if (!enableZoom) {
                        return;
                    }

                    if (!isMouseOverElem) {
                        return;
                    }

                    if (evt.preventDefault) {
                        evt.preventDefault();
                    }

                    evt.returnValue = false;
                    recentOffset = $root.offset();

                    var delta = evt.wheelDelta ? evt.wheelDelta / 360 : evt.detail / -9,
                        z = Math.pow(1 + zoomScale, delta),
                        g = svgRoot,
                        p = getEventPoint(evt),
                        k;

                    p = p.matrixTransform(g.getCTM().inverse());

                    // Compute new scale matrix in current mouse position
                    k = root.createSVGMatrix().translate(p.x, p.y).scale(z).translate(-p.x, -p.y);

                    setCTM(g, g.getCTM().multiply(k));

                    if (typeof stateTf === "undefined") {
                        stateTf = g.getCTM().inverse();
                    }

                    stateTf = stateTf.multiply(k.inverse());
                },

                /**
                 * Handle mouse move event.
                 */
                handleMouseMove = function (evt) {

                    if (evt.preventDefault) {
                        evt.preventDefault();
                    }

                    evt.returnValue = false;

                    var g = svgRoot,
                        p;

                    if (state === PAN && enablePan) {
                        // Pan mode
                        p = getEventPoint(evt).matrixTransform(stateTf);

                        setCTM(g, stateTf.inverse().translate(p.x - stateOrigin.x, p.y - stateOrigin.y));
                    } else if (state === DRAG && enableDrag) {
                        // Drag mode
                        p = getEventPoint(evt).matrixTransform(g.getCTM().inverse());

                        setCTM(stateTarget, root.createSVGMatrix().translate(p.x - stateOrigin.x, p.y - stateOrigin.y).multiply(g.getCTM().inverse()).multiply(stateTarget.getCTM()));

                        stateOrigin = p;
                    }
                },

                /**
                 * Handle mouseenter event.  This has been added to stop ignoring
                 * inputs when the mouse is over the element.
                 **/
                handleMouseEnter = function (evt) {
                    // bind our mousemove listener only when we have mouse in view
                    if (!isMouseOverElem) {
                        recentOffset = $root.offset();
                        $root.bind('mousemove', handleMouseMove);
                        isMouseOverElem = true;
                    }
                },

                /**
                 * Handle mouseleave event.  This has been added to ignore
                 * inputs when the mouse is not over the element.
                 **/
                handleMouseLeave = function (evt) {
                    // unbind our mousemove listener only when we no longer have mouse in view
                    if (isMouseOverElem) {
                        $root.unbind('mousemove', handleMouseMove);
                        isMouseOverElem = false;
                    }
                    state = NONE;
                },

                /**
                 * Handle click event.
                 */
                handleMouseDown = function (evt) {
                    if (evt.preventDefault) {
                        evt.preventDefault();
                    }

                    evt.returnValue = false;

                    //var svgDoc = evt.target.ownerDocument;

                    //var g = getRoot(svgDoc);
                    var g = svgRoot;

                    // Pan anyway when drag is disabled and the user clicked on an element
                    if (evt.target.tagName === "svg" || !enableDrag) {
                        // Pan mode
                        state = PAN;

                        stateTf = g.getCTM().inverse();

                        stateOrigin = getEventPoint(evt).matrixTransform(stateTf);
                    } else {
                        // Drag mode
                        state = DRAG;

                        stateTarget = evt.target;

                        stateTf = g.getCTM().inverse();

                        stateOrigin = getEventPoint(evt).matrixTransform(stateTf);
                    }
                },

                /**
                 * Handle mouse button release event.
                 */
                handleMouseUp = function (evt) {
                    if (evt.preventDefault) {
                        evt.preventDefault();
                    }

                    evt.returnValue = false;

                    //var svgDoc = evt.target.ownerDocument;

                    if (state === PAN || state === DRAG) {
                        // Quit pan mode
                        state = NONE;
                    }
                };

            /**
             * Register handlers
             */

            // MODIFICATION: registers events through jQuery
            $root.bind('mouseup', handleMouseUp)
                .bind('mousedown', handleMouseDown)
                .bind('mouseenter', handleMouseEnter)
                .bind('mouseleave', handleMouseLeave);

            //if (navigator.userAgent.toLowerCase().indexOf('webkit') >= 0) {

            window.addEventListener('mousewheel', handleMouseWheel, false); // Chrome/Safari/others
            window.addEventListener('DOMMouseScroll', handleMouseWheel, false); // Firefox

            if (enableTouch) {
                root.addEventListener('touchstart', handleTouchStart, false);
                root.addEventListener('touchend', handleTouchEnd, false);
                root.addEventListener('touchmove', handleTouchMove, false);
            }

        };

    /**
       Enable SVG panning on an SVG element.

       @param viewportId the ID of an element to use as viewport for pan.  Required.
       @param enablePan Boolean enable or disable panning (default enabled)
       @param enableZoom Boolean enable or disable zooming (default enabled)
       @param enableDrag Boolean enable or disable dragging (default disabled)
       @param zoomScale Float zoom sensitivity, defaults to .2
    **/
    $.fn.svgPan = function (viewportId, enablePan, enableZoom, enableDrag, enableTouch, zoomScale) {
        enablePan = typeof enablePan !== 'undefined' ? enablePan : true;
        enableZoom = typeof enableZoom !== 'undefined' ? enableZoom : true;
        enableDrag = typeof enableDrag !== 'undefined' ? enableDrag : false;
        enableTouch = typeof enableTouch !== 'undefined' ? enableTouch : true;
        zoomScale = typeof zoomScale !== 'undefined' ? zoomScale : 0.2;

        return $.each(this, function (i, el) {
            var $el = $(el),
                svg,
                viewport;
            // only call upon elements that are SVGs and haven't already been initialized.
            if ($el.is('svg') && $el.data('SVGPan') !== true) {
                viewport = $el.find('#' + viewportId)[0];
                if (viewport) {
                    init($el[0], viewport, enablePan, enableZoom, enableDrag, enableTouch, zoomScale);
                } else {
                    throw "Could not find viewport with id #" + viewportId;
                }
            }
        });
    };
}));
