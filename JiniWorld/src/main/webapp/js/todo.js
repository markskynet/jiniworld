  $(document).ready(function() { 
    
      var i = 0;
      var task;
      // Initial loading of tasks
      for( i = 0; i < localStorage.length; i++){
    	  task = localStorage.getItem('task-'+i);
    	  if(task != null && task != 'null')
    		  $("#tasks").append("<li id='task-"+ i +"'>" + task + " <a href='#'>x</a></li>");
    	  else
    		  localStorage.removeItem('task-'+i);
      }
        
        
      // Add a task
      $("#tasks-form").submit(function() {
        if (  $("#task").val() != "" ) {
          localStorage.setItem( "task-"+i, $("#task").val() );
          $("#tasks").append("<li id='task-"+i+"'>"+localStorage.getItem("task-"+i)+" <a href='#'>x</a></li>")
          $("#task-" + i).css('display', 'none');
          $("#task-" + i).slideDown();
          $("#task").val("");
          i++;
        }
        return false;
      });
      
      // Remove a task
      $("#tasks li a").live("click", function() {
        localStorage.removeItem($(this).parent().attr("id"));
        $(this).parent().slideUp('slow', function() { $(this).remove(); } );
        /*for(i=0; i<localStorage.length; i++) {
          if( !localStorage.getItem("task-"+i) && localStorage.getItem("task-"+i) != "null") {
            localStorage.setItem("task-"+i, localStorage.getItem('task-' + (i+1) ) );
            localStorage.removeItem('task-'+ (i+1) );
          }
        }*/
      });
    }); 