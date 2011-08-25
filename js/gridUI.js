(function($) {
    $.fn.grid = function(options) {
           this.clickFunction =  options;
           
           //this.opts = $.extend(this.defaults, options);
           
           this.init = function(){
        	   this.table = $('<table></table>');
        	   this.table.addClass('gridTable');
        	   $(this).append(this.table);
        	   //$(this).append('aa');
           };
           this.addItem = function(text, styleClass){
        	   var self = this;
        	   var index = this.table.find('tr').length;
        	   var tr = $('<tr></tr>');
        	   var td = $('<td></td>');
        	   var div = $('<div>'+text+'</div>');
                   if(styleClass)
                       div.addClass( styleClass );
        	   div.click(function(){
        		   self.clickFunction(index);
        	   });
        	   div.addClass('gridCell');
        	   
        	   div.hover(function(){
        		   $(this).toggleClass('gridCellHovered');
        	   }, function(){
        		   $(this).toggleClass('gridCellHovered');
        	   });
        	   td.append(div);
        	   tr.append(td);
        	   this.table.append(tr);
           };
           
           this.clearItems = function(text){
        	   this.table.empty();
           };
           
           this.init();
    };	
})(jQuery); 
