const lunr = require('lunr');


function stableSort(arr, compare) {
    var original = arr.slice(0);

    arr.sort(function(a, b){
        var result = compare(a, b);
        return result === 0 ? original.indexOf(a) - original.indexOf(b) : result;
    });

    return arr;
}
exports.stableSort = stableSort;

var lunr_index = {
    search: function() { return []; }
}

var stored_nodes;

exports.indexNodes = function(nodes) {
    stored_nodes = nodes;
    lunr_index = lunr(function() {
        this.field('label');

        for(var i = 0; i < nodes.length; i++) {
            this.add(nodes[i]);
        }
    });
}

exports.search = function(phrase) {
    var score_buckets = []
    var score_to_idx = {}

    var results = lunr_index.search(phrase);

    for(var i = 0; i < results.length; i++) {
        var score = results[i].score;

        if(!score_to_idx[score]) {
            var idx = score_buckets.length;
            score_to_idx[score] = idx;
        }

        var idx = score_to_idx[score];

        if(!score_buckets[idx]) {
            score_buckets[idx] = []
        }
        score_buckets[idx].push(results[i])
    }

    for(var key in score_buckets) {
        stableSort(score_buckets[key], function(a,b) {
            var deptha = stored_nodes[a.ref].depth;
            var depthb = stored_nodes[b.ref].depth;
            return (deptha - depthb);
        });
    }

    var rv = []
    for(var i = 0; i < score_buckets.length; i++) {
        for(var j = 0; j < score_buckets[i].length; j++) {
            rv.push(stored_nodes[score_buckets[i][j].ref]);
        }
    }
    return rv;
}

exports.processWorkflowyNodes = function(nodes) {
    var maxDepth = 3;   // maximum node depth to traverse
    var names = [];

    function traverse(node, depth) {
        if(depth == maxDepth) return;

        var cleanLabel = node.nm.replace(/<\/?[ibu]>/g, "");

        names.push({
            label: cleanLabel,
            id: names.length,
            wfid: node.id,
            depth: depth
        });

        if(node.ch) {
            for(var i = 0; i < node.ch.length; i++) {
                traverse(node.ch[i], depth+1);
            }
        }
    }

    for(var i = 0; i < nodes.length; i++) {
        traverse(nodes[i], 0);
    }

    return names;
}
