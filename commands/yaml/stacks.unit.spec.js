var assert = require('assert');


describe('cf avaiable stacks', ()=>{
    var Stacks;
  beforeEach(()=>{
    Stacks = require('./stacks');
  });
  it('nodejs stack', ()=>{
    var nodeStack = Stacks.getStack("nodejs");
     assert.equal(nodeStack.name, "nodejs");
     console.log(`stack ${JSON.stringify(nodeStack)}`);
  });
});
