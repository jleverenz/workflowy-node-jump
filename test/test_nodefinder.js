var assert = require('assert');
var nf = require('../src/nodefinder');

describe('nodefinder', function() {

    var nodes = [
        { id: 'aaaaaaaa-bbbb-cccc-dddd-000000000001',
          lm: 20686265,
          nm: "Alpha"
        },
        { id: 'aaaaaaaa-bbbb-cccc-dddd-000000000002',
          lm: 20686265,
          nm: "Beta"
        }
    ]

    describe('processWorkflowyNodes', function() {
        it('returns list with labels and ids', function() {
            var result = nf.processWorkflowyNodes(nodes);
            assert.deepEqual(['Alpha', 'Beta'], result.map(a => a.label));
        });
    });
});
