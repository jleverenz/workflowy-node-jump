var assert = require('assert');
var nf = require('../src/nodefinder');

describe('nodefinder', function() {
    describe('customized lunr indexing', function() {
        it('search nodes', function() {
            var nodes = [
                { id: 0, label: "caesar salad", depth: 3 },
                { id: 1, label: "salad salad", depth: 2 },
                { id: 2, label: "ice cream", depth: 2 },
                { id: 3, label: "salad dressing", depth: 1 },
                { id: 4, label: "greek salad", depth: 1 }
            ];

            // compare function looks at value, which is shared for some items
            nf.indexNodes(nodes);
            var result = nf.search('salad');
            assert.deepEqual([1,3,4,0], result.map(a => a.id));
        });
    });

    describe('processWorkflowyNodes', function() {
        var shallow_nodes = [
            { id: 'aaaaaaaa-bbbb-cccc-dddd-000000000001',
              lm: 20686265,
              nm: "Alpha"
            },
            { id: 'aaaaaaaa-bbbb-cccc-dddd-000000000002',
              lm: 20686265,
              nm: "Beta"
            }
        ]

        var child_nodes = [
            { id: 'aaaaaaaa-bbbb-cccc-dddd-000000000001',
              lm: 20686265,
              nm: "Alpha"
            },
            { ch: [{ id: 'aaaaaaaa-bbbb-cccc-dddd-000000000011',
                     lm: 20686265,
                     nm: "Child 1"
                   },
                   { id: 'aaaaaaaa-bbbb-cccc-dddd-000000000012',
                     lm: 20686265,
                     nm: "Child 2"
                   }],
              id: 'aaaaaaaa-bbbb-cccc-dddd-000000000002',
              lm: 20686265,
              nm: "Beta"
            }
        ]

        it('returns list with labels and ids', function() {
            var result = nf.processWorkflowyNodes(shallow_nodes);
            assert.deepEqual(['Alpha', 'Beta'], result.map(a => a.label));
        });

        it('can traverse children', function() {
            var result = nf.processWorkflowyNodes(child_nodes);
            assert.deepEqual(['Alpha', 'Beta', 'Child 1', 'Child 2'], result.map(a => a.label));
        });
    });

    describe('stableSort', function() {
        var docs;

        beforeEach(function() {
            docs = [
                { name: "a", val: 1 },
                { name: "b", val: 2 },
                { name: "c", val: 2 },
                { name: "d", val: 1 },
                { name: "e", val: 3 }
            ];
        });

        it('maintains position for equally comparable items', function() {
            // compare function looks at value, which is shared for some items
            var compare = function(a,b) {
                return (a.val - b.val);
            };

            nf.stableSort(docs, compare);
            assert.deepEqual(['a','d','b','c','e'], docs.map( a => a.name ));
        });
    });
});
