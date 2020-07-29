lsof -i tcp:8084 | awk 'NR!=1 {print $2}' | xargs kill 
lsof -i tcp:8081 | awk 'NR!=1 {print $2}' | xargs kill 
lsof -i tcp:8083 | awk 'NR!=1 {print $2}' | xargs kill 
lsof -i tcp:27017 | awk 'NR!=1 {print $2}' | xargs kill 
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