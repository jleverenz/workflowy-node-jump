var assert = require('assert');
var nf = require('../src/nodefinder');

describe('nodefinder', function() {

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

    describe('processWorkflowyNodes', function() {
        it('returns list with labels and ids', function() {
            var result = nf.processWorkflowyNodes(shallow_nodes);
            assert.deepEqual(['Alpha', 'Beta'], result.map(a => a.label));
        });

        it('can traverse children', function() {
            var result = nf.processWorkflowyNodes(child_nodes);
            assert.deepEqual(['Alpha', 'Beta', 'Child 1', 'Child 2'], result.map(a => a.label));
        });

    });
});
