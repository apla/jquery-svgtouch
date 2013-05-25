# jQuery SVGTouch

This is an an adaptation of Andrea Leofreddi's [SVGPan library][],
version 1.2.2, for use as a [jQuery][] plugin.

Additionally, this version of library supports multi-touch gestures (inspired by another pretty neat library called [Hammer.js][]).

 [SVGPan library]: http://code.google.com/p/svgpan/
 [jQuery]: http://jquery.org/
 [Hammer.js]: https://github.com/EightMedia/hammer.js

### Device Support

* Chrome desktop for Mac (tested via [MagicTouch][])
* Chrome desktop for Windows 8

 [MagicTouch]: https://github.com/borismus/MagicTouch

As long as library uses standard browser touch event callbacks it should also work in other browsers and platform. However, none of other test has been made yet and I guess there always could be some issues running it in other environments, especially on mobile phones.

The support is provided as is, without any guarantee.

### Features

* Touch panning
* Multi-Touch zooming (using two figer pinch to zoom gesture)

Thanks to great Andrea's code all touch and mouse events can be fired interchangeably. Handling these events is stateless - we are not storing current position or scale paramaters in temporary variables.

### Test

If you don't have a multi-touch device but you have a one of recent MacBook notebooks you can use a trackpad in your computer to emulate multi-touch events. For details, read bottom of [this][] article.

  [this]: http://www.html5rocks.com/en/mobile/touch/

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

### TODO

* Enhance precision of recognized gestures (this is especially true for pinch to zoom gesture which can be accidentally applied too fast)
* Add support for panning while simultaneously zooming (currently you can't pan your graphic while zooming)

### Links

Andrea Leofreddi's original SVGPan library on Google code

* <http://code.google.com/p/svgpan/>

Fork jquery-svgpan at

* <http://www.github.com/talos/jquery-svgpan>

Inspiration from multi-touch gesture Hammer.js library

* <https://github.com/EightMedia/hammer.js>
