bash /home/kristijans/backend/stop-all.sh
sleep 3
/home/kristijans/backend/database/data &
sleep 3
node /home/kristijans/backend/rest/server.js &
sleep 3
export FLASK_APP=/home/kristijans/backend/soap/app.py
export FLASK_RUN_PORT=8083
sleep 3
flask run --host=0.0.0.0 &
sleep 3
dotnet run --project /home/kristijans/backend/socket-server/ &
sleep 3
javac -d /home/kristijans/backend/rmi/classes -classpath /home/kristijans/backend/rmi:/home/kristijans/backend/rmi/lib/commons-logging-1.0.4.jar:/home/kristijans/backend/rmi/lib/commons-discovery-0.2.jar:/home/kristijans/backend/rmi/lib/jaxrpc.jar:/home/kristijans/backend/rmi/lib/axis.jar:/home/kristijans/backend/rmi/lib/saaj.jar:/home/kristijans/backend/rmi/lib/log4j-1.2.8.jar:/home/kristijans/backend/rmi/lib/wsdl4j-1.5.1.jar /home/kristijans/backend/rmi/server/*.java
java -classpath /home/kristijans/backend/rmi/classes:/home/kristijans/backend/rmi/lib/commons-logging-1.0.4.jar:/home/kristijans/backend/rmi/lib/commons-discovery-0.2.jar:/home/kristijans/backend/rmi/lib/jaxrpc.jar:/home/kristijans/backend/rmi/lib/axis.jar:/home/kristijans/backend/rmi/lib/saaj.jar:/home/kristijans/backend/rmi/lib/log4j-1.2.8.jar:/home/kristijans/backend/rmi/lib/wsdl4j-1.5.1.jar server.FileServer &
sleep 3