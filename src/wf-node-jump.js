import nf from './nodefinder'

/**
 * Load jquery-ui for user scripts.
 *
 * Workflowy uses jquery-ui v1.8.7 (but without autocomplete?). Use same
 * version for compatibility.
 *
 * @returns {Promise} Resolves when loading is complete (undefined return).
 */
function loadJQueryUI() {
  const loaders = ['https://code.jquery.com/jquery-1.12.4.min.js',
                   'https://code.jquery.com/ui/1.12.1/jquery-ui.min.js'].map(i => {
                     return new Promise((resolve, reject) => {
                       $.getScript(i).done(resolve);
                     });
                   });
  return Promise.all(loaders);
}


/**
 * Get Workflowy node data.
 *
 * Queries workflowy endpoint for node names and id's. Recursively walks node
 * tree to specified depth. The Array returned will be a length equal to the
 * depth searched. Nodes with depth 0 are in index 0, nodes with depth 1 are
 * pushed to index 1, etc.
 *
 * Data pushed for each node is object with `label` and `id`.
 *
 * @returns {Promise} Resolves to an Array of node data.
 */
function getWorkflowyData() {
  return new Promise((resolve, reject)=>{
    $.get( "get_initialization_data?client_version=18", function( data ) {
      var rootChildren = data.projectTreeData.mainProjectTreeInfo.rootProjectChildren;
      resolve(nf.processWorkflowyNodes(rootChildren));
    });
  });
}


$("body").append(`
  <div id="gmPopupContainer">
    <div class="ui-widget">
      <label for="workflowynode">Jump: </label>
      <input id="workflowynode">
    </div>
  </div>
`);

function addGlobalStyle(css) {
  const head = document.getElementsByTagName('head')[0];
  if (!head) { return; }

  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = css;
  head.appendChild(style);
}

function addGlobalStylesheet(href) {
  const head = document.getElementsByTagName('head')[0];
  if (!head) { return; }

  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  styleLink.type = 'text/css';
  styleLink.href = href;
  head.appendChild(styleLink);
}

addGlobalStyle(`
  #gmPopupContainer {
    position:               fixed;
    top:                    30%;
    left:                   0%;
    transform: translate(0%, -50%);
    border:                 2px black;
    padding:                1em;
    background:             lightgray;
    font-size:              80%;
    z-index:                2;
    display:                none;
  }
`);

addGlobalStylesheet('https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css');

/**
 * Logic for detecting if a keydown event is the node jump hotkey.
 */
function detectHotKeyPress(e) {
  var platform = window.navigator.platform;

  // CTRL+J on macos, CTRL-. on win
  if(platform.indexOf("Mac") == 0) {
    return (e.keyCode == 74 && !e.shiftKey && e.ctrlKey && !e.altKey && !e.metaKey);
  } else {
    return (e.keyCode == 190 && !e.shiftKey && e.ctrlKey && !e.altKey && !e.metaKey);
  }
}


/**
 * hot key handler. Toggle visibility of pop-up. When becoming visible, clear
 * input and set focus to it.
 */
document.addEventListener('keydown', function(e) {
  if (detectHotKeyPress(e)) {
    $("#gmPopupContainer").toggle();
    if($("#gmPopupContainer").is(":visible")) {
      // Refresh node data window pop-up is opened. This will ensure the
      // latest node data is available.
      getWorkflowyData().then( v => {
        nf.indexNodes(v);
      });

      $("#workflowynode").val("");
      $("#workflowynode").focus();
    }
  }
}, false);


/**
 * esc key handler. Hide the pop-up.
 */
$( "#workflowynode" ).bind('keydown', function(e) {
  // pressed esc
  if (e.keyCode == 27) {
    $("#gmPopupContainer").hide();
  }
});


/**
 * Hide on losing focus.
 */
$( "#workflowynode" ).focusout(function(e) {
  $("#gmPopupContainer").hide();
});


/**
 * Load resources and workflowy data, then initiatlize autcomplete widget.
 */
loadJQueryUI().then(function() {
  // Initialize the autocomplete widget. Note sources is set dynamically when
  // the pop-up is opened, to get latest node data.
  $("#workflowynode").autocomplete({
    source: function(request, response) {
      var results = nf.search(request.term);
      response(results.map( function(a) {
        return { label: a.label, id: a.wfid };
      }));
    },
    select: function(event, ui) {
      event.preventDefault();

      // Parse the node id to get the anchor url used by workflowy.
      var pattern = RegExp("-([^-]+)$");
      var m = ui.item.id.match(pattern);
      if(m) {
        var g = "https://workflowy.com/#/" + m[1];
        $("#gmPopupContainer").hide();
        window.location.href = g;
      }
    },
    focus: function(event, ui) {
      event.preventDefault();
      $(this).val(ui.item.label);
    }
  });

  // override jquery autocomplete style
  $(".ui-autocomplete").each(function () {
    this.style.setProperty('z-index', '3', 'important');
    this.style.setProperty('font-size', '80%');
  });
});
