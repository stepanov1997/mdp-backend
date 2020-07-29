bash /home/kristijans/backend/stop-all.sh
sleep 3
mongod --storageEngine inMemory --dbpath /home/kristijans/backend/database/data &
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
javac /home/kristijans/backend/rmi/server/*.java
java -cp /home/kristijans/backend/rmi/ server.CalculatorServer &
sleep 3