
		var db = initDB();
		var sesStorage;
        var createSQL = 'CREATE TABLE IF NOT EXISTS tLogin (' +
                'userid TEXT PRIMARY KEY,' +
                'password TEXT,' +
                'username TEXT,' +
                'emailid TEXT' +')';


        function initDB(){
            sesStorage = getSessionStorage() || displayError('Session Storage not supported.');
        	var msg = sesStorage.getItem('message');
        	if(msg != null){
        		alert(msg);
        		sesStorage.removeItem('message');
        	}
        	return prepareDatabase();
        }
        
        // Open the Web SQL database
        function prepareDatabase() {
            var odb = getOpenDatabase();
            if(!odb) {
                dispError('Web SQL Not Supported');
                return undefined;
            } else {
                var db = odb( 'loginDatabase', '1.0', 'A Login Database', 10 * 1024 * 1024 );
                db.transaction(function (t) {
                    t.executeSql( createSQL, [], function(){}, function(t, e) {
                        alert('create table: ' + e.message);
                    });
                });
                return db;
            }
        }

        // How many rows do we have?
        function countRows() {
        	var c;
            if(!db) return;
            db.readTransaction(function (t) {
                t.executeSql('SELECT COUNT(*) AS c FROM tLogin', [], function (t, r) {
                    c = r.rows.item(0).c;
                }, function(t, e) {
                    alert('countRows: ' + c);
                });
            });
        }

        function createNewUser(){
            var f = element('newuserForm');
            var userid = f.elements['userid'].value;
            var username = f.elements['username'].value;
            var password = f.elements['password'].value;
            var emailid = f.elements['emailid'].value;

            if(! (userid || username || password)) return;
            db.transaction( function(t) {
                t.executeSql('INSERT INTO tLogin ( userid, password, username, emailid ) VALUES ( ?, ?, ?, ? ) ',
                    [ userid, password, username, emailid ]
                );
            }, function(t, e){
            		alert('Insert row: '+t.message); 
            	}, 
            	function(t, e) {
            		alert('test');
            });
        }
        
        function checkUser() {

 //           countRows();    // update the row count each time the display is refreshed

            var userID = element('username').value;
            var password = element('password').value;
            
            if(db) {
                db.readTransaction(function(t) {    // readTransaction sets the database to read-only
                    t.executeSql('SELECT * FROM tLogin WHERE userid = ?', [userID], function(t, r) {
                    	var rowlength = r.rows.length;
                        if(rowlength == 1) {
                        	var row = r.rows.item(0);
                        	var dbpassword = row.password;
                        	if(dbpassword == password){
                        		var dbusername = row.username;

                                sesStorage.setItem('userName',dbusername);
                            	window.location = getRedirectURL("login","home");	
                        	}else{
                            	// user not available
                        		alert('Invalid Password');
                        	}
                        	 
                        }else{
                        	// user not available
                        	alert('Invalid User');
                        }
                    });
                });
            }
        }