var $filterjs=(function(){
    var filterlist=[];
	var filtermap={};
	function registerFilter(filterName,filterFunction){
	     filterlist.push(filterName);
		 filtermap[filterName]=filterFunction;
	}
	function setColor(iData,x,y,c){
        var idx = (y*iData.width+x)*4;
	    iData.data[idx]=c[0];
	    iData.data[idx+1]=c[1];
	    iData.data[idx+2]=c[2];
	    iData.data[idx+3]=c[3];
    }
    function getColor(iData,x,y){
         var idx = (y*iData.width+x)*4;
	     return [iData.data[idx],iData.data[idx+1],iData.data[idx+2],iData.data[idx+3]];
    }
	function barrelFilter(sData,tData,k){
    var cx = ~~(tData.width/2);
	var cy = ~~(tData.height/2);
	//k=0.8;
    for(var x=0;x<tData.width;x++){
	    for(var y=0;y<tData.height;y++){
		    var norm_xd = x/tData.width;
			var norm_yd = y/tData.height;
		    var rd = Math.sqrt((norm_xd-0.5)*(norm_xd-0.5)+(norm_yd-0.5)*(norm_yd-0.5));
			
			var phi = Math.atan((norm_yd-0.5)/(norm_xd-0.5));
			var ru = Math.pow(rd,k);
			var xu=0.5*tData.width;yu=0.5*tData.height;
			if(rd!=0){
			    xu = (0.5+k*((norm_xd-0.5)*ru)/rd)*tData.width;
			    yu = (0.5+k*((norm_yd-0.5)*ru)/rd)*tData.height;
			}
			
			if(xu<0) xu=0;if(xu>=sData.width) xu = sData.width-1;
			if(yu<0) yu=0;if(yu>=sData.height) yu = sData.height-1;
			xu = ~~xu;yu = ~~yu;
			var c = getColor(sData,xu,yu);
		    setColor(tData,x,y,c);
		}
	}
}
	function flip(sData,tData,params){
	    if(params.x&&params.y){
		   function getIdx(x,y){
			    return (tData.width*(sData.height-1-y)+(sData.width-1-x))*4;
			}
		}else if(params.x){
		    function getIdx(x,y){
			    return (tData.width*y+(tData.width-1-x))*4;
			}
		} else if(params.y){
		     function getIdx(x,y){
			    return (tData.width*(sData.height-1-y)+x)*4;
			}
		}
	    for(var x=0;x<tData.width;x++){
	         for(var y=0;y<tData.height;y++){
			       var idx = (tData.width*y+x)*4;
				   var idx2 = getIdx(x,y);
				  tData.data[idx]=sData.data[idx2];
				  tData.data[idx+1]=sData.data[idx2+1];
				  tData.data[idx+2]=sData.data[idx2+2];
				  tData.data[idx+3]=sData.data[idx2+3];
			 }
		}
	}
	registerFilter("identity",function(sData,tData){
	    for(var x=0;x<tData.width;x++){
	         for(var y=0;y<tData.height;y++){
			      var idx = (tData.width*y+x)*4;
				  tData.data[idx]=sData.data[idx];
				  tData.data[idx+1]=sData.data[idx+1];
				  tData.data[idx+2]=sData.data[idx+2];
				  tData.data[idx+3]=sData.data[idx+3];
			 }
		}	 
	});
	registerFilter("flipX",function(sData,tData,params){
	     flip(sData,tData,{x:true});
	});
	registerFilter("flipY",function(sData,tData,params){
	     flip(sData,tData,{y:true});
	});
	registerFilter("flipXY",function(sData,tData,params){
	     flip(sData,tData,{x:true,y:true});
	});
	registerFilter("pixelate",function(sData,tData,params){
	    var k = (params&&params.pixelSize) || 10;
        for(var x=0;x<tData.width;x++){
	         for(var y=0;y<tData.height;y++){
			     var xu = x - x%Math.floor(k);
				 var yu = y - y%Math.floor(k);
				 if(xu<0) xu=0;if(xu>=sData.width) xu = sData.width-1;
			     if(yu<0) yu=0;if(yu>=sData.height) yu = sData.height-1;
			      xu = ~~xu;yu = ~~yu;
			     var c = getColor(sData,xu,yu);
				  setColor(tData,x,y,c);
			 }
	    }
    });
	registerFilter("pinch",function(sData,tData,params){
	    var k = (params&&params.value)||0.5;
		
		barrelFilter(sData,tData,k);
	});
	registerFilter("bulge",function(sData,tData,params){
	    var k = (params&&params.value)||1.5;
		
		barrelFilter(sData,tData,k);
	});
    registerFilter("randomjitter",function (sData,tData,params){
	        var k = (params&&params.level)||15;
            for(var x=0;x<tData.width;x++){
	          for(var y=0;y<tData.height;y++){
		      var xu=x+(Math.random()*(k/2)-k);
             var yu=y+(Math.random()*(k/2)-k);			 
			 if(xu<0) xu=0;if(xu>=sData.width) xu = sData.width-1;
			 if(yu<0) yu=0;if(yu>=sData.height) yu = sData.height-1;
			 xu = ~~xu;yu = ~~yu;
			 var c = getColor(sData,xu,yu);
		     setColor(tData,x,y,c);
		       }
	        }
   });	
    registerFilter("swirl",function swirl(sData,tData,params){
    var k = (params&&params.value)||5;
    for(var x=0;x<tData.width;x++){
	    for(var y=0;y<tData.height;y++){
		      var norm_xd = x/tData.width -0.5;
			  var norm_yd = y/tData.height -0.5;
			  var xu=0.5*tData.width;yu=0.5*tData.height;
			  var rd = Math.sqrt((norm_xd)*(norm_xd)+(norm_yd)*(norm_yd));
			  if(rd!=0){
			      
			    var  norm_xu = norm_xd *Math.cos(k*rd) - norm_yd*Math.sin(k*rd);
                var  norm_yu = norm_xd *Math.sin(k*rd) + norm_yd*Math.cos(k*rd);	
                 xu = (norm_xu+0.5)*tData.width;				
				 yu = (norm_yu+0.5)*tData.height;
			  }
			if(xu<0) xu=0;if(xu>=sData.width) xu = sData.width-1;
			if(yu<0) yu=0;if(yu>=sData.height) yu = sData.height-1;
			xu = ~~xu;yu = ~~yu;
			var c = getColor(sData,xu,yu);
		    setColor(tData,x,y,c);
		}
	  }
    });
	registerFilter("wave",function wave(sData,tData,params){
       var k = (params&&params.value)||15;
       for(var x=0;x<tData.width;x++){
	    for(var y=0;y<tData.height;y++){
                    var xu = x+(k * Math.sin(2.0 * 3.1415 * y / 128.0));
					var yu = y+(k * Math.cos(2.0 * 3.1415 * x / 128.0));
					
	         if(xu<0) xu=0;if(xu>=sData.width) xu = sData.width-1;
			 if(yu<0) yu=0;if(yu>=sData.height) yu = sData.height-1;
			 xu = ~~xu;yu = ~~yu;
			 var c = getColor(sData,sData.width-1-xu,yu);
		     setColor(tData,x,y,c);
			 }
	    }
    });
    return {
	    getAllFilters:function(){
		     return filterlist;
		},
		getFilter:function(filterName){
		    return filtermap[filterName];
		}
	}
})();

/*
var global={};


function convolve(kernel,sData,x,y){
	var idx  = (y*sData.width+x)*4;
	var r=0,g=0,b=0;
	var nx,ny;
	for(var i=0;i<kernel.length;i++){
	    for(var j=0;j<kernel[0].length;j++){
		   nx = (x+j);
		   ny = (y+i);
		   if(nx>=0&&nx<sData.width&&ny>=0&&ny<sData.height){
		       idx = (ny*sData.width+nx)*4;
		       r+=kernel[i][j]*sData.data[idx];
		       g+=kernel[i][j]*sData.data[idx+1];
		       b+=kernel[i][j]*sData.data[idx+2];
		   }
		   
		}
	}
	return [Math.round(r),Math.round(g),Math.round(b)];
}
function pixelate(sData,tData,k){
    for(var x=0;x<tData.width;x++){
	         for(var y=0;y<tData.height;y++){
			     var xu = x - x%Math.floor(k);
				 var yu = y - y%Math.floor(k);
				 if(xu<0) xu=0;if(xu>=sData.width) xu = sData.width-1;
			     if(yu<0) yu=0;if(yu>=sData.height) yu = sData.height-1;
			      xu = ~~xu;yu = ~~yu;
			     var c = getColor(sData,sData.width-1-xu,yu);
				  setColor(tData,x,y,c);
			 }
	}
}
function EdgeDetectQuick(sData,tData)
{
			var m = [
			                 [-1,-1,-1],
							 [0,0,0],
							 [1,1,1]
			               ];
		
			//m.Offset = 127;

	     for(var x=0;x<tData.width;x++){
	         for(var y=0;y<tData.height;y++){
			      var c = convolve(m,sData,x,y);
				  c[3] = getColor(sData,x,y)[3];
				  //c[3]=1;
				  setColor(tData,x,y,c);
		     }
		}
} 
function barrelFilter(sData,tData,k){
    var cx = ~~(tData.width/2);
	var cy = ~~(tData.height/2);
	//k=0.8;
    for(var x=0;x<tData.width;x++){
	    for(var y=0;y<tData.height;y++){
		    var norm_xd = x/tData.width;
			var norm_yd = y/tData.height;
		    var rd = Math.sqrt((norm_xd-0.5)*(norm_xd-0.5)+(norm_yd-0.5)*(norm_yd-0.5));
			
			var phi = Math.atan((norm_yd-0.5)/(norm_xd-0.5));
			var ru = Math.pow(rd,k);
			var xu=0.5*tData.width;yu=0.5*tData.height;
			if(rd!=0){
			    xu = (0.5+k*((norm_xd-0.5)*ru)/rd)*tData.width;
			    yu = (0.5+k*((norm_yd-0.5)*ru)/rd)*tData.height;
			}
			
			if(xu<0) xu=0;if(xu>=sData.width) xu = sData.width-1;
			if(yu<0) yu=0;if(yu>=sData.height) yu = sData.height-1;
			xu = ~~xu;yu = ~~yu;
			var c = getColor(sData,sData.width-1-xu,yu);
		    setColor(tData,x,y,c);
		}
	}
}
function oilpaint(sData,tData,k){
            for(var x=0;x<tData.width;x++){
	          for(var y=0;y<tData.height;y++){
		     var xu=x+(Math.random()*(k/2)-k);
             var yu=y+(Math.random()*(k/2)-k);			 
			 if(xu<0) xu=0;if(xu>=sData.width) xu = sData.width-1;
			 if(yu<0) yu=0;if(yu>=sData.height) yu = sData.height-1;
			 xu = ~~xu;yu = ~~yu;
			 var c = getColor(sData,sData.width-1-xu,yu);
		     setColor(tData,x,y,c);
		}
	}
}
function wave(sData,tData,k){
   
    for(var x=0;x<tData.width;x++){
	    for(var y=0;y<tData.height;y++){
                    var xu = x+(k * Math.sin(2.0 * 3.1415 * y / 128.0));
					var yu = y+(k * Math.cos(2.0 * 3.1415 * x / 128.0));
					
	         if(xu<0) xu=0;if(xu>=sData.width) xu = sData.width-1;
			 if(yu<0) yu=0;if(yu>=sData.height) yu = sData.height-1;
			 xu = ~~xu;yu = ~~yu;
			 var c = getColor(sData,sData.width-1-xu,yu);
		     setColor(tData,x,y,c);
			 }
	}
}
function swirl(sData,tData,k){
    
    for(var x=0;x<tData.width;x++){
	    for(var y=0;y<tData.height;y++){
		      var norm_xd = x/tData.width -0.5;
			  var norm_yd = y/tData.height -0.5;
			  var xu=0.5*tData.width;yu=0.5*tData.height;
			  var rd = Math.sqrt((norm_xd)*(norm_xd)+(norm_yd)*(norm_yd));
			  if(rd!=0){
			      
			    var  norm_xu = norm_xd *Math.cos(k*rd) - norm_yd*Math.sin(k*rd);
                var  norm_yu = norm_xd *Math.sin(k*rd) + norm_yd*Math.cos(k*rd);	
                 xu = (norm_xu+0.5)*tData.width;				
				 yu = (norm_yu+0.5)*tData.height;
			  }
			if(xu<0) xu=0;if(xu>=sData.width) xu = sData.width-1;
			if(yu<0) yu=0;if(yu>=sData.height) yu = sData.height-1;
			xu = ~~xu;yu = ~~yu;
			var c = getColor(sData,sData.width-1-xu,yu);
		    setColor(tData,x,y,c);
		}
	}
}
*/
