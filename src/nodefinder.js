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
        this.tokenizer.separator = /[\s\-\\\/]+/


        for(var i = 0; i < nodes.length; i++) {
            this.add(nodes[i]);
        }
    });
}

exports.search = function(phrase) {
    var score_buckets = []
    var score_to_idx = {}

    var results = lunr_index.search(phrase);

    // The following matches by lunr score first. If lunr score matches for
    // multiple docs, those docs are then ordered according to depth in the
    // workflowy nodes.

    for(var i = 0; i < results.length; i++) {
        var score = results[i].score;

        // If this is a new score, create an entry for it.
        if(!(score in score_to_idx)) {
            var idx = score_buckets.length;
            score_to_idx[score] = idx;
            score_buckets[idx] = []
        }

        var idx = score_to_idx[score];
        score_buckets[idx].push(results[i])
    }

    for(var i = 0; i < score_buckets.length; i++) {
        stableSort(score_buckets[i], function(a,b) {
            var deptha = stored_nodes[a.ref].depth;
            var depthb = stored_nodes[b.ref].depth;
            return (deptha - depthb);
        });
    }

    var rv = []
    for(var i = 0; i < score_buckets.length; i++) {
        for(var j = 0; j < score_buckets[i].length; j++) {
            var r = stored_nodes[score_buckets[i][j].ref];
            r.score = score_buckets[i][j].score;
            rv.push(r);
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
