# jQuery SVGPan Multi-Touch

This is an an adaptation of Andrea Leofreddi's [SVGPan library][],
version 1.2.2, for use as a [jQuery][] plugin.

Additionally, this version of library is supporting multi-touch gestures (inspired by another pretty neat library [Hammer.js][]).

 [SVGPan library]: http://code.google.com/p/svgpan/
 [jQuery]: http://jquery.org/
 [Hammer.js]: https://github.com/EightMedia/hammer.js

### Usage

Arguments:

* `viewportId`: string - id of the root SVG element
* `enablePan`: bool - enable / disable panning (default enabled)
* `enableZoom`: bool - enable / disable zooming (default enabled)
* `enableDrag`: bool - enable / disable dragging (default disabled)
* `enableTouch`: bool - enable / disable touch support (default enabled)
* `zoomScale`: float - zoom sensitivity, defaults .2

```javascript
    $(selector).svgPan(viewportId, enablePan, enableZoom, enableDrag, enableTouch, zoomScale);
```

### Example

```javascript
    $('svg').svgPan('viewport');
```

### Links

Andrea Leofreddi's original SVGPan library on Google code

* <http://code.google.com/p/svgpan/>

Fork jquery-svgpan at

* <http://www.github.com/talos/jquery-svgpan>

Inspiration from multi-touch gesture Hammer.js library

* <https://github.com/EightMedia/hammer.js>
