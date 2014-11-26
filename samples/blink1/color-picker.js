(function() {
  var ui = {
    r: null,
    g: null,
    b: null
  };

  var bg = undefined;

  function initializeWindow() {
    for (var k in ui) {
      var id = k.replace(/([A-Z])/, '-$1').toLowerCase();
      var element = document.getElementById(id);
      if (!element) {
        throw "Missing UI element: " + k;
      }
      ui[k] = element;
    }
    setGradients();
    enableControls(false);
    ui.r.addEventListener('input', onColorChanged);
    ui.g.addEventListener('input', onColorChanged);
    ui.b.addEventListener('input', onColorChanged);
    enumerateDevices();
  };

  function enableControls(enabled) {
    ui.r.disabled = !enabled;
    ui.g.disabled = !enabled;
    ui.b.disabled = !enabled;
  };

  function enumerateDevices() {
    bg.Blink1.getDevices(onDevicesEnumerated);
  };

  function onDevicesEnumerated(devices) {
    if (devices.length == 0) {
      console.warn("No devices found.");
      return;
    }

    bg.blink1 = devices[0];
    bg.blink1.connect(function(success) {
      if (!success) {
        return;
      }

      bg.blink1.getVersion(function(version) {
        console.log("Hardware version " + version + ".");
        bg.blink1.getRgb(0, function(r, g, b) {
          ui.r.value = r || 0;
          ui.g.value = g || 0;
          ui.b.value = b || 0;
          setGradients();
        });
        enableControls(true);
      });
    });
  };

  function onColorChanged() {
    setGradients();
    bg.blink1.fadeRgb(ui.r.value, ui.g.value, ui.b.value, 250, 0);
  }

  function setGradients() {
    var r = ui.r.value, g = ui.g.value, b = ui.b.value;
    ui.r.style.background =
       'linear-gradient(to right, rgb(0, ' + g + ', ' + b + '), ' +
                                 'rgb(255, ' + g + ', ' + b + '))';
    ui.g.style.background =
       'linear-gradient(to right, rgb(' + r + ', 0, ' + b + '), ' +
                                 'rgb(' + r + ', 255, ' + b + '))';
    ui.b.style.background =
       'linear-gradient(to right, rgb(' + r + ', ' + g + ', 0), ' +
                                 'rgb(' + r + ', ' + g + ', 255))';
  }

  window.addEventListener('load', function() {
    // Once the background page has been loaded, it will not unload until this
    // window is closed.
    chrome.runtime.getBackgroundPage(function(backgroundPage) {
      bg = backgroundPage;
      initializeWindow();
    });
  });
}());
