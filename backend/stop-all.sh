lsof -i tcp:1099 | awk 'NR!=1 {print $2}' | xargs kill > /dev/null 2> /dev/null
if [ $? -eq 0 ]; then
    echo "Uspješno ugašen RMI server"
fi
lsof -i tcp:8084 | awk 'NR!=1 {print $2}' | xargs kill > /dev/null 2> /dev/null
if [ $? -eq 0 ]; then
    echo "Uspješno ugašen chat server"
fi
lsof -i tcp:8081 | awk 'NR!=1 {print $2}' | xargs kill > /dev/null 2> /dev/null
if [ $? -eq 0 ]; then
    echo "Uspješno ugašen REST server"
fi
lsof -i tcp:8083 | awk 'NR!=1 {print $2}' | xargs kill > /dev/null 2> /dev/null
if [ $? -eq 0 ]; then
    echo "Uspješno ugašen SOAP server"
fi
lsof -i tcp:27017 | awk 'NR!=1 {print $2}' | xargs kill > /dev/null 2> /dev/null
if [ $? -eq 0 ]; then
    echo "Uspješno ugašen MongoDB server"
fi