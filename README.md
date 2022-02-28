# How to get started:

## the server

do the following steps:

1. `cd server`
2. create a venv with `python -m venv venv` (sometimes its `python3` on mac)
3. activate with `source ./venv/bin/activate`
4. install requirements with `pip install -r requirements.txt`
5. start server with `python main.py`


## the app 

do the following steps:

1. `cd app`
2. install deps with `npm install`
3. run locally with `npm start`

## the db

do the following steps:

1. use the minidump.sql file to create a replica database
2. you might need to change the password in /server/main.py at the top
