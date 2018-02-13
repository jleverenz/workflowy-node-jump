// ==UserScript==
// @name Workflowy Node Jump
// @description Pop-up widget w/ autocomplete to quickly open a node.
// @author Jeff Leverenz
// @version 0.0
// @license MIT
// @namespace https://github.com/jleverenz
// @match https://workflowy.com/*
// @grant GM_addStyle
// ==/UserScript==

// 1. load resources (jquery-ui)
// 2. load data from workflowy
// 3. (on complete) add & configure autocomplete widget


/**
 * Load jquery-ui for user scripts.
 *
 * Workflowy uses jquery-ui v1.8.7 (but without autocomplete?). Use same
 * version for compatibility.
 *
 * @returns {Promise} Resolves when loading is complete (undefined return).
 */
function loadJQueryUI() {
    return new Promise((resolve, reject)=>{
        $.getScript('https://code.jquery.com/ui/1.8.7/jquery-ui.min.js')
            .done(resolve);
    });
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
            var maxDepth = 3;   // maximum node depth to traverse
            var count = 0;
            var depthNames = [];

            function traverse(node, depth) {
                if(depth == maxDepth) return;
                count = count + 1;
                if(!depthNames[depth]) {
                    depthNames[depth] = []
                }

                var cleanLabel = node['nm'].replace(/<\/?[ibu]>/g, "");

                depthNames[depth].push({ label: cleanLabel, id: node['id'] });
                if(node['ch']) {
                    for(var i = 0; i < node['ch'].length; i++) {
                        traverse(node['ch'][i], depth+1);
                    }
                }
            }

            var rootChildren = data['projectTreeData']['mainProjectTreeInfo']['rootProjectChildren'];
            for(var i = 0; i < rootChildren.length; i++) {
                traverse(rootChildren[i], 0);
            }

            var names = []
            for(var i = 0; i < maxDepth; i++) {
                for(var j = 0; j < depthNames[i].length; j++) {
                    names.push(depthNames[i][j]);
                }
            }
            resolve(names);
        });
    });
}


$("body").append(`
    <div id="gmPopupContainer">
        <div class="ui-widget">
            <label for="workflowynode">Node: </label>
            <input id="workflowynode">
        </div>
    </div>
`);


GM_addStyle (`
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


/**
 * alt+g key handler. Toggle visibility of pop-up. When becoming visible, clear
 * input and set focus to it.
 */
document.addEventListener('keydown', function(e) {
    // pressed alt+g
    if (e.keyCode == 71 && !e.shiftKey && e.ctrlKey && !e.altKey && !e.metaKey) {
        $("#gmPopupContainer").toggle();
        if($("#gmPopupContainer").is(":visible")) {
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
 * Load resources and workflowy data, then initiatlize autcomplete widget.
 */
Promise.all([loadJQueryUI(), getWorkflowyData()]).then(function(values) {
    $("#workflowynode").autocomplete({
        source: values[1],
        select: function(event, ui) {
            event.preventDefault();

            // Parse the node id to get the anchor url used by workflowy.
            var pattern = RegExp("-([^-]+)$")
            if(m = ui.item.id.match(pattern)) {
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
