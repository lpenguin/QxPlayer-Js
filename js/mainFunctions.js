//*/Global variables
var triggers = [];
var prevPathText = "";
var loclo = null;
var prevLocation = null;
var path = null;
var choicesFilterFunction = null;
var jumped = false;//TODO: think on 'jump' function

var globals = this;
var vars = {};
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
function reset(){
    triggers = [];
    prevPathText = "";
    loc = null;
    prevLocation = null;
    path = null;
    choicesFilterFunction = null;
    jumped = false;//TODO: think on 'jump' function

    globals = this;
    vars = {};
    showVarsMap = {};
    constraintsMap = {};
    showRangesArr = [];
    boundMap = {};
    pathPriorityMap = {};
    pathPassabilityMap = {}
    pathShowOrderMap = {};
    locationTextsMap = {};
    intMap = {};

}

function initPlayer(){
        reset();

        player.init();
        player.actions();
        for(var i in player.locations){
                player.locations[i].init();
                for(var j in player.locations[i].paths){
                        player.locations[i].paths[j].init();
                }
        }

	setChoicesFilterFunction(conditionsFilterFunction);
	//TGE functionality
	addTrigger( emptyLocationTrigger, 'pre');
	addTrigger( winTrigger, 'post');
	addTrigger( failTrigger, 'post');
	addTrigger( deathTrigger, 'post');
	addTrigger( TrLocationTexts, "pre" );
	addTrigger( ShowVars, "post" );
	addTrigger( pathTextTrigger, 'post' );
        addTrigger( pathPassabilityTrigger, 'post');

	var startLocation = player.startLocation();
	onAnyLocationEnter(startLocation);
}
function questEnd(){
    player.load("quests/main.json", function(){
            initPlayer();
    });
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

function pathPassabilityTrigger(){
    if(path){
        if(path.passability != 'inf'){
            path.passability--;
            if( path.passability < 0)
                path.passability = 0;
        }
    }
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
        player.addChoice({text : 'Конец квеста.', actions : function(){questEnd();}});
}

function failTrigger(){
	if(!loc) return;
	if( loc.type != 'fail' )
		return;
	player.clearChoices();
        player.addChoice({text : 'Конец квеста.', actions : function(){questEnd();}});

}

function deathTrigger(){
	if(!loc) return;
	if( loc.type != 'death' )
		return;
	player.clearChoices();
        player.addChoice({text : 'Конец квеста.', actions : function(){questEnd();}});
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

function sortChoicesTGE(a, b){
    if( a.style == 'disabled' && b.style != 'disabled')
        return 1;
    else if( a.style != 'disabled' && b.style == 'disabled')
        return -1;
    else if(a.style == 'disabled' && b.style == 'disabled')
        return 0;
    else
    {
        if(a.path.showOrder < b.path.showOrder)
            return -1;
        else if(a.path.showOrder > b.path.showOrder)
            return 1;
        else{
            return 0;
            var r = Math.random() * 9;
            if( r < 3 )
                return -1;
            if( r < 6 )
                return 0;
            return 1

        }
    }
}

function pathFromSporGroup( paths ){
    var priorityTotal = 0;
    if(paths.length == 1)
        return paths[0];
    paths = paths.sort(function(a,b){ return a.priority - b.priority;});
    var newPaths = [];
    for(var i in paths){
        if( paths[i].condRes){
            priorityTotal += paths[i].priority;
            newPaths.push(paths[i]);
        }
    }

    paths = newPaths;
    if(!paths.length)
        return null;
    var priorityCounter = 0;
    var rnd = Math.random()*priorityTotal;
    for(var i in paths){
        priorityCounter+=paths[i].priority;
        if( rnd < priorityCounter )
            return paths[i];
    }
    alert('error in sporGroup Function');
    return null;
}

function getSporGroupsMap( paths ){
    var sporGroupsMap = {};
    var textMap = {}
    for(var i in paths){
        var path = paths[i];
        path.condRes = path.conditions();
        var g;
        if( g = textMap[path.question] ){
            g.push(path);
            var sg;
            if( sg = sporGroupsMap[path.question]){
                sg.push(path);
            }else{
                sg = [path];
            }
        }else{
            textMap[path.question] = [ path ];
        }
    }
    return sporGroupsMap;
}

function conditionsFilterFunction(loc){
    var choices = [];
    var groups = getSporGroupsMap(loc.paths) ;
    for(var q in groups){
        var group = groups[q];
        if( group.length == 1 ){
            var path = group[0];
        }else{
            var path = pathFromSporGroup(group);
        }
    }

    for(var i in loc.paths){
        var path = loc.paths[i];

        if( !path.passability )
            continue;

        var c = path.conditions();
        path.condRes = c;
        if( c || path.alwaysShow){
            var g;
            if( g = sporGroupsMap[path.question] ){
                g.push(path);
            }else{
                sporGroupsMap[path.question] = [ path ];
            }
        }
    }

    for(var text in sporGroupsMap){
        var g = sporGroupsMap[text];
        var path = pathFromSporGroup(g);
        if(!path)
            continue;
        if( g.length == 1 && Math.random() >= path.priority)
            continue;
        //if( !path.passability )
        //    continue;

        //var c = path.conditions();
        //if( c || path.alwaysShow){
            choices.push({
                    text : path.question,
                    actions : function(){onAnyPathEnter(this.path);},//loc.paths[i].actions,
                    path : path,
                    style : path.condRes ? 'default' : 'disabled'
            });
       // }
    }

    choices = choices.sort(sortChoicesTGE);
    //choices = choices.reverse();
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
        //pathPriorityMap[ pathId ] = value;
    player.findPath(pathId).priority = parseFloat( value.toString().replace('.','.') );
}

function SetPathPassability( pathId, value ){
        //pathPassabilityMap[ pathId ] = value;
    if(value == 0)
        value = 'inf';
    player.findPath(pathId).passability = value;
}

function SetPathShowOrder( pathId, value ){
        //pathShowOrderMap[ pathId ] = value;
    player.findPath(pathId).showOrder = value;
}

function SetPathAlwaysShow( pathId ){
    player.findPath(pathId).alwaysShow = true;
}

function AddLocationTexts( locationId, f, texts ){
        player.find(locationId).texts = {
		"func":f,
		"texts":texts
		};
}

function AddToVars(name){
    vars[name] = globals[name];
}

function SetLocationEmpty( locationId ){
	player.find(locationId).isEmpty = 1;
	//locationEmptyMap[locationId] = 1;
}

function switchLocationText(){
    if(!loc)
        return;
    if( loc.currentText == undefined )
        loc.currentText = -1;
    loc.currentText++;
    if( loc.currentText >= loc.texts.texts.length)
        loc.currentText = 0;
    return loc.currentText+1;
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
                        player.addChoice({text : 'Конец квеста.', actions : function(){questEnd();}});
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
        if( loc ){
                t = loc.texts;
		if(t){
                    var n = t.func()-1;
                    if( n < 0 )
                        player.setText( t.texts[0]);
                    else if( n >= t.texts.length )
                        player.setText( t.texts[t.texts.length-1]);
                    else
                        player.setText(t.texts[n]);
		}
	}
}

