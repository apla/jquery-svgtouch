# jQuery SVGPan Multi-Touch

This is an an adaptation of Andrea Leofreddi's [SVGPan library][],
version 1.2.2, for use as a [jQuery][] plugin.

Additionally, this version of library supports multi-touch gestures (inspired by another pretty neat library [Hammer.js][]).

 [SVGPan library]: http://code.google.com/p/svgpan/
 [jQuery]: http://jquery.org/
 [Hammer.js]: https://github.com/EightMedia/hammer.js

### Device Support

Currently library has been tested only on Chrome desktop browser (Mac). I guess, there could be some issues running it on other platforms, especially on mobile phones.

The support is provided as is, without any guarantee.

### Live Test

If you don't have a multi-touch device but you have a one of recent MacBook notebooks you can use a trackpad in your computer to emulate multi-touch events. For details, read bottom of [this][] article

  [this]: http://www.html5rocks.com/en/mobile/touch/

[test.html](http://pawelsledzikowski.github.com/jquery-svgpan/test.html)

### Usage

Arguments:

* `viewportId`: string - id of the root SVG element
* `enablePan`: bool - enable / disable panning (default enabled)
* `enableZoom`: bool - enable / disable zooming (default enabled)
* `enableDrag`: bool - enable / disable dragging (default disabled)
* `enableTouch`: bool - enable / disable touch support (default enabled)
* `zoomScale`: float - zoom sensitivity, default .2

```javascript
    $(selector).svgPan(viewportId, enablePan, enableZoom, enableDrag, enableTouch, zoomScale);
```

### Example

```javascript
    $('#svgId').svgPan('viewport');
```

### Links

Andrea Leofreddi's original SVGPan library on Google code

* <http://code.google.com/p/svgpan/>

Fork jquery-svgpan at

* <http://www.github.com/talos/jquery-svgpan>

Inspiration from multi-touch gesture Hammer.js library

* <https://github.com/EightMedia/hammer.js>
