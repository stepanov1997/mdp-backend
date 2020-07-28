lsof -i tcp:8081 | awk 'NR!=1 {print $2}' | xargs kill 
lsof -i tcp:8083 | awk 'NR!=1 {print $2}' | xargs kill 
lsof -i tcp:27017 | awk 'NR!=1 {print $2}' | xargs kill 