//*/Global variables
var triggers = [];
var prevPathText = "";
var loclo = null;
var prevLocation = null;
var path = null;
var choicesFilterFunction = null;
var jumped = false;//TODO: think on 'jump' function

var globals = this;
var showVarsMap = {};
var constraintsMap = {};
var showRangesArr = [];
var boundMap = {};
var pathPriorityMap = {};
var pathPassabilityMap = {}
var pathShowOrderMap = {};
var locationTextsMap = {};
var intMap = {};

//Main functions
function initPlayer(){
	setChoicesFilterFunction(conditionsFilterFunction);
	//TGE functionality
	addTrigger( emptyLocationTrigger, 'pre');
	addTrigger( winTrigger, 'post');
	addTrigger( failTrigger, 'post');
	addTrigger( deathTrigger, 'post');
	addTrigger( TrLocationTexts, "pre" );
	addTrigger( ShowVars, "post" );
	addTrigger( pathTextTrigger, 'post' );
	
	var startLocation = player.startLocation();
	onAnyLocationEnter(startLocation);
}

function addTrigger(func, type){
	if( ! type )
		type = 'post';
	triggers.push({
		type:type,
		actions:func
	});
}

function playTriggers(triggerType){
	for( var i in triggers ){
		if( triggers[i].type == triggerType )
			if( triggers[i].actions() == 'jump')
				return 'jump';
	}
}

function playPostTriggers(){
	return playTriggers('post');
}

function playPreTriggers(){
	return playTriggers('pre');
}


function emptyLocationTrigger(){
	//TGE functionality
	if( loc ){
		if( loc.isEmpty )
			processEmptyLocation(loc);
	}
	

}

function pathTextTrigger(){
	if( path ){
		prevPathText = player.getText();
		if( prevPathText && ! player.find(path.nextLocation).isEmpty){
			player.addChoice({
				text : 'Далее',
				actions : function(){
					jump(path.nextLocation);
				return 'jump';
				}});
			return 'jump';
		}
		//else{
		//	jump(path.nextLocation);
		//	return 'jump';
		//}
	}
}


function processEmptyLocation(loc){
	//TGE functionality
	if( prevPathText ){
		player.setText(prevPathText);
	}
}

function winTrigger(){
	if(!loc) return;
	if( loc.type != 'win' )
		return;
	player.clearChoices();
	player.addChoice({text : 'Конец квеста.', actions : function(){}});
}

function failTrigger(){
	if(!loc) return;
	if( loc.type != 'fail' )
		return;
	player.clearChoices();
	player.addChoice({text : 'Конец квеста.', actions : function(){}});	

}

function deathTrigger(){
	if(!loc) return;
	if( loc.type != 'death' )
		return;
	player.clearChoices();
	player.addChoice({text : 'Конец квеста.', actions : function(){}});
}
function PrependAction(obj, func){
	actions = obj.actions;
	obj.actions = function(obj){
		func(obj);
		actions(obj);
	};
}

function AppendAction(obj, func){
	actions = obj.actions;
	obj.actions = function(obj){
		actions(obj);
		func(obj);
	};
}

//main player control
function jump( loc ){
	if( getObjectClass(loc) == 'String' )
		loc = player.find( loc );
	
	onAnyLocationEnter(loc);
}


function clearDisplay(){
	player.setText('');
	player.setStatusText('');
	player.clearChoices();
}

function setChoicesFilterFunction( func ){
	choicesFilterFunction = func;
}

function defaultChoicesFilterFunction(loc){
	var choices = [];
	for( var i in loc.paths ){
		var path  = loc.paths[i];
		choices.push({
			text : path.question,
			actions : function(){onAnyPathEnter(this.path);},//loc.paths[i].actions,
			path : path,
			style : 'default'
		});
	}
	return choices;
}

function conditionsFilterFunction(loc){
	var choices = [];
	for(var i in loc.paths){
		var path = loc.paths[i];
		if( path.conditions() ){
			choices.push({
				text : path.question,
				actions : function(){onAnyPathEnter(this.path);},//loc.paths[i].actions,
				path : path,
				style : 'default'
			});
		}
	}
	return choices;
}

function showPathes(loc){
	var choices = choicesFilterFunction(loc);
	for( var i in choices )
		player.addChoice( choices[i] );
}

function onAnyLocationEnter(enteredLoaction){
	clearDisplay();
	loc = enteredLoaction;
	path = null;
	player.setText(loc.text);
	if( playPreTriggers() == 'jump')
		return;
	showPathes(loc);
	if(  loc.actions() == 'jump')
		return
	if( playPostTriggers() == 'jump')
		return;
	prevLocation = loc;
}

function onAnyPathEnter(enteredPath){
	clearDisplay();
	loc = null;
	path = enteredPath;
	player.setText(path.text);
	if(playPreTriggers() == 'jump' )
		return;
	if( path.actions()  == 'jump')
		return;
	if( playPostTriggers() == 'jump')
		return;
	jump( path.nextLocation );
}

function range(min, max){
	return { "min" : min,
			"max": max};
}

function crange(min, max){
	var d = max - min;
	return Math.floor(Math.random()*d) + min;
}

function In(){
	var v = arguments[0];
	
	var v = arguments[0];
	var a1 = arguments[1]; 
	if(getObjectClass(a1) == "Object")
		return v >= a1.min && v <= a1.max;
		for(var i = 1; i < arguments[i];i++){
			var a = arguments[i];
			if( v == a )
				return true;
		}
		return false;
}

function Mul(){
	var v = arguments[0];
	for(var i = 1; i < arguments[i];i++){
		var a = arguments[i];
		if( v % a == 0)
			return true;
	}
	return false;
}

function hide( name ){
	showVarsMap[ name ] = false;
}

function search( v, ranges ){
        for( var i in ranges )
        	if( In(v, ranges[i] ) )
        		return i;
        return -1;
}

function prc(v, percents ){
	return v + v * percents / 100;
}
function show( name ){
	showVarsMap[ name ] = true;
}

function ShowVars(){
	stateText = "";
	for( var i in showRangesArr ){
        var o = showRangesArr[i];
        var name = o.name;
//         stateText += i +"\n";
		if ( showVarsMap[name] == false){
            continue;
        }
        var v = globals[name]; 
        if ( !v && !o.showOnZero)
            continue;
        var n = search(v , o.ranges );
        if( n == -1){
            alert("Range not found for: "+ name);
            return;
        }
        var txt = o.texts[ n ].replace('<>', v);
        if( txt )
            player.setStatusText( player.getStatusText() + txt + "\n" );

			//stateText += globals[ name ]
	}

}

function AddConstraint(varName, min, max){
	constraintsMap[varName] = range( min, max );
}
function AddIntConstraint(varName ){
	intMap[varName] = 1;
}

function AddBound( varName, type, value, text ){
	boundMap[ varName ] = {
		"type" : type,
		"value" : value,
		"text" : text
	};
}


function AddShowRanges( varName, ranges, texts, show0 ){
	showRangesArr.push({
        "name" : varName,
		"ranges" : ranges,
		"texts" : texts,
		"showOnZero" : show0
	});
}

function SetPathPriority( pathId, value ){
	pathPriorityMap[ pathId ] = value;
}

function SetPathPassability( pathId, value ){
	pathPassabilityMap[ pathId ] = value;
}

function SetPathShowOrder( pathId, value ){
	pathShowOrderMap[ pathId ] = value;
}

function AddLocationTexts( locationId, f, texts ){
	locationTextsMap[locationId] = {
		"func":f,
		"texts":texts
		};
}

function SetLocationEmpty( locationId ){
	player.find(locationId).isEmpty = 1;
	//locationEmptyMap[locationId] = 1;
}

function CheckConstraints( varName ){
	if( constraintsMap[ varName] ){
		var r = constraintsMap[ varName];
		var v = globals[varName];
		if( v > r.max )
			v = r.max;
		if( v < r.min )
			v = r.min;
		globals[varName] = v;
	}
	
	if( intMap[varName] )
		globals[varName] = Math.floor(globals[varName]);
	var b;
	
	if( b = boundMap[varName] ){
		var v = globals[varName];
		if( b.type == 'max' && v >= b.value || b.type == 'min' && v <= b.value){
			clearDisplay();
			player.setText(b.text);
			player.clearChoices();
			player.addChoice({text : 'Конец квеста.', actions : function(){}});
			return 'jump';
		}
				
	}
}

function locationPaths( location ){
    var rest = new Array();
    for( var i in location.paths){
        var c = checkConditions( location.paths[i]);

        if( c && c != "false"){
            rest.push(location.paths[i]);
        }
    }

    return rest;
}


function TrLocationTexts(){
	var t;
	if( location ){
		t = locationTextsMap[location.id] 
		if(t){
			var n = t.func.call();
			text = t.texts[n];
		}
	}
}

