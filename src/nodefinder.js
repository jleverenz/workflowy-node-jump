exports.processWorkflowyNodes = function(nodes) {
    var maxDepth = 3;   // maximum node depth to traverse
    var depthNames = [];

    function traverse(node, depth) {
        if(depth == maxDepth) return;
        if(!depthNames[depth]) {
            depthNames[depth] = []
        }

        var cleanLabel = node.nm.replace(/<\/?[ibu]>/g, "");

        depthNames[depth].push({ label: cleanLabel, id: node.id });
        if(node.ch) {
            for(var i = 0; i < node.ch.length; i++) {
                traverse(node.ch[i], depth+1);
            }
        }
    }

    for(var i = 0; i < nodes.length; i++) {
        traverse(nodes[i], 0);
    }

    var names = []
    for(var i = 0; i < depthNames.length; i++) {
        for(var j = 0; j < depthNames[i].length; j++) {
            names.push(depthNames[i][j]);
        }
    }

    return names;
}
