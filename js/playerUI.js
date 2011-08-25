var PlayerUI = function(initObj){
	this.player = initObj.player;
	this.textField = initObj.textField;
	this.statusField = initObj.statusField;
	this.choiceSelect = initObj.choiceSelect;
	
	this.choiceSelected = function(index){
		this.player.onChoiceSelected(index);
	};
	
	this.setPlayer = function(player){
		this.player = player;
	};
	
	this.setText = function(text){
		this.textField.html(text.replace(/\n/g,'<br/>'));
	};
	
	this.getText = function(){
		return this.textField.html().replace(/\<br\/\>/g,'\n');
	};
	
	this.setStatusText = function(text){
		this.statusField.html(text.replace(/\n/g,'<br/>'));
	};

	this.getStatusText = function(){
		return this.statusField.html().replace(/\<br\/\>/g,'\n');
	};
	
	this.addChoice = function(choice){
            if(choice.style == 'disabled'){
                choice.actions = function(){};
                this.choiceSelect.addItem(choice.text.replace(/\n/g,'<br/>'), 'pathDisabled');
            }else
                this.choiceSelect.addItem(choice.text.replace(/\n/g,'<br/>'));
		//var html = this.choiceSelect.html();
		//this.choiceSelect.html(choice.text+ "<br \>"+html);
	};
	
	this.clearChoices = function(){
		this.choiceSelect.clearItems();
		//this.choiceSelect.html('');
	};
	
	this.init = function(){
		var self =this;
		this.choiceSelect.grid(
			function(index){
				self.choiceSelected(index);
			}
		);
	};
	
	this.init();
};
