'use strict';


    // slightly improved (by proper extension) OpenRoberta code for disabling blocks lying around the workspace unconnected to our main start block:
var original_onMouseUp_ = Blockly.Block.prototype.onMouseUp_;

Blockly.Block.prototype.onMouseUp_ = function(e) {
    original_onMouseUp_.call(this, e);

    
        // Check if this block is part of a task:
    if (Blockly.selected) {
        var topBlocks = Blockly.getMainWorkspace().getTopBlocks(true);
        var rootBlock = Blockly.selected.getRootBlock();
        var found = false;
        for (var i = 0; !found && i < topBlocks.length; i++) {
            var block = topBlocks[i];
            var disabled = true;
            while (block) {
                if (block == rootBlock) {
                    if (block.type == 'start') {
                        disabled = false;
                    }
                    found = true;
                }
                if (found) {
                    var descendants = rootBlock.getDescendants();
                    for (var j = 0; j < descendants.length; j++) {
                        descendants[j].setDisabled(disabled);
                    }
                }
                block = block.getNextBlock();
            }
            if (found)
                break;
        }
    }
};


Blockly.FieldDropdown.prototype.setValue = function(newValue) {      // Allow the label on the closed menu to differ from values of the open menu
  this.value_ = newValue;
  // Look up and display the human-readable text.
  var options = this.getOptions_();
  for (var x = 0; x < options.length; x++) {
    // Options are tuples of human-readable text and language-neutral values.
    if (options[x][1] == newValue) {
      var shortValue = options[x][2] || options[x][0];
      this.setText(shortValue);
      return;
    }
  }
};


Blockly.Input.prototype.appendSelector = function(allowedBlocks, presenceLabel, absenceLabel) {

    var presenceLabel   = presenceLabel || this.name;
    var absenceLabel    = absenceLabel  || 'no '+this.name;

    var dd_list = [
        [ absenceLabel, ':REMOVE', absenceLabel]
    ];
    if(allowedBlocks.length == 1) {
        dd_list.push( [presenceLabel+': ', allowedBlocks[0], presenceLabel ] );
    } else {
        for (var i = 0; i < allowedBlocks.length; i++) {
            dd_list.push( [allowedBlocks[i], allowedBlocks[i], presenceLabel ] );
        }
    }

    var this_input = this;

    this//.setCheck(allowedBlocks)  // FIXME: we'll need to re-establish the connection rules somehow!
        .setAlign( this.type == Blockly.INPUT_VALUE ? Blockly.ALIGN_RIGHT : Blockly.ALIGN_LEFT)
        .appendField(new Blockly.FieldDropdown( dd_list, function(targetType) {

                    this.sourceBlock_.toggleTargetBlock(this_input, targetType);
                }
        ));

    return this;
};


Blockly.Block.prototype.toggleTargetBlock = function(input, targetType) {     // universal version: can create any type of targetBlocks

    var targetBlock = input ? this.getInputTargetBlock(input.name) : this.getNextBlock();              // named input or next
    if(targetType==':REMOVE' && targetBlock) {
        targetBlock.dispose(true, true);    // or targetBlock.unplug(...)
    } else if(targetType!=':REMOVE' && !targetBlock) {
        targetBlock = Blockly.Block.obtain(Blockly.getMainWorkspace(), targetType);
        targetBlock.initSvg();
        targetBlock.render();

        var parentConnection = input ? this.getInput(input.name).connection : this.nextConnection;     // named input or next
        var childConnection = targetBlock.outputConnection || targetBlock.previousConnection;          // vertical or horizontal
        parentConnection.connect(childConnection);
    }
};

