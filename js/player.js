var Player = function(){
	this.locations = [];
	this.actions = null;
	this.name = null;
	this.description = null;
	this.choices = [];
	this.ui = null;
	
	this.find = function(id){ //find location by id
		for( var i in this.locations){
			if( this.locations[i].id == id)
				return this.locations[i];
		}
		return null;
	};

    this.findPath = function(id){
        for(var i in this.locations){
            for(var j in this.locations[i].paths)
                if(this.locations[i].paths[j].id == id)
                    return this.locations[i].paths[j];
        }
        return null;
    }
	this.startLocation = function(){
		for( var i in this.locations){
			if( this.locations[i].type == "start")
				return this.locations[i];
		}
		return null;
	};
	
	this.setUI = function(ui){
		this.ui = ui;
	};

        this.replaceStrings = function(text){
            if(text == undefined)
                text = "";
            for(var name in globals.vars){
                re = new RegExp("\<"+name+"\>", 'g');
                text = text.replace(re, globals[name])
            }
            return text;
        };

	this.setText = function( text ){

            this.ui.setText( this.replaceStrings(text) );
	};

	this.getText = function(){
            return this.ui.getText();
	};
	
	this.setStatusText = function( statusText ){
		this.ui.setStatusText( statusText );
	};

	this.getStatusText = function(){
		return this.ui.getStatusText();
	};
	
	this.addChoice = function(choice){
                choice.text = this.replaceStrings(choice.text);

		this.choices.push(choice);
		this.ui.addChoice( choice );
		//external implementation
		//choice :
		// text - choice text
		// actions - actions on click
		// [path - choice path]
		// [style - text style]
	};

	this.clearChoices = function(){
		this.choices = [];
		this.ui.clearChoices();
	};
	
	this.onChoiceSelected = function(index){
		var choice = this.choices[index];
		choice.actions();
	};
	
	this.load = function(path, callback){ 
		var self = this; 
		$.getJSON( path, function(data){
			self.locations = data.vers;
			self.name = data.name;
			self.description = data.description;
			self.actions = data.actions;
			self.init = data.init;
			self.libraries = data.libraries;
			self.compile();
			//if( ! this.libraries )
			callback.call();
			//var lib = libraries
			//for(var i in this.libraries){
			//	this.loadLibrary(this.libraries[i]);
			//}
		});
	};
	

	this.play = function(){
		
	};
	
	this.compileActions = function( actions ){
		return function(){
			try{
				return eval( actions );
			}catch(err){
				//alert('error in actions:\n'+actions+"\n"+err);
				$("#error").html('error in actions:\n'+actions+"\n"+err);
			}
		};
	};
	
	this.compileConditions = function( conditions ){
		var c = conditions;
		c = c.replace(/\/\*[^\/\*]*\*\//,'');
		c = c.replace(/(^\s+)|(\s+$)/g, "");
		if( c == "" )
			return this.compileActions('(1)');
		return this.compileActions(conditions);
	};
	
	this.compile = function(){
		this.actions = this.compileActions(this.actions);
		this.init = this.compileActions(this.init);
		for(var i in this.locations)
			this.compileLocation(this.locations[i]);
	};

	this.compileLocation = function(loc){
		loc.actions = this.compileActions(loc.actions);
		loc.paths = loc.edges;
		loc.edges = undefined;
		loc.init = this.compileActions(loc.init);
		for(var i in loc.paths)
			this.compilePath( loc.paths[i]);
	};

	this.compilePath = function(path){
		path.actions = this.compileActions(path.actions);
		path.init = this.compileActions(path.init);
		path.nextLocation = path.nextVer;
		path.nextVer = undefined;
		path.conditions = this.compileConditions(path.conditions);
	};
};
