# how to create a virtual env:
# python -m venv venv 
# or on some macs: python3 -m venv venv

# how to activate virtual env:
# source ./venv/bin/activate

# how to install requirements:
# pip install -r requirements.txt

# how to deactivate:
# deactivate

import tornado.ioloop
import tornado.web
import pymysql
import json
from datetime import datetime
import shortuuid

database = pymysql.connect(
    host='127.0.0.1',
    port=3306,
    user='root',  # replace if you have a different root user name
    password='axnD6~?V6T%sEeFP',  # replace with your user's password
    db='todo_list_v1',  # the name you give to your database
    cursorclass=pymysql.cursors.DictCursor,
    autocommit=True
    )

# cursor = database.cursor()

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello, world")

# convert datetimes to strings and bytes into bools (no bool in mySQL)
def convert_rows(obj):
    for row in obj: 
        # print('the row', row)
        for key in row: 
            # print('the key', key, 'the value', row[key])
            if isinstance(row[key], datetime):
                # print('value', row[key])
                row[key] = str(row[key])
            if isinstance(row[key], bytes):
                row[key] = True if row[key] == b'\x01' else (False if row[key] == b'\x00' else row[key])

class GetItemsHandler(tornado.web.RequestHandler):
    def prepare(self):
            header = "Content-Type"
            body = "application/json"
            self.set_header(header, body)

    def get(self):
        with database.cursor() as cursor:
            # get the list items
            sql = "SELECT * FROM `list_items`"
            cursor.execute(sql)
            result = cursor.fetchall()
            convert_rows(result)

            # return the list items
            self.write(str(json.dumps(result)))

class NewItemHandler(tornado.web.RequestHandler):
    def post(self):
        # check for correct arguments, error if something is wrong
        body = tornado.escape.json_decode(self.request.body)
        if 'contents' not in body or 'timestamp' not in body:
            raise tornado.web.HTTPError(400)
        contents = body['contents']
        timestamp = body['timestamp']

        # create the entry in the DB
        with database.cursor() as cursor:
            sql = "INSERT INTO list_items(item_id, contents, timestamp, completed) VALUES(%s, %s, %s, %s)"
            cursor.execute(sql, (shortuuid.uuid(), contents, timestamp, 0))
            

class EditItemHandler(tornado.web.RequestHandler):
    def post(self):
        # check for correct arguments, error if something is wrong
        body = tornado.escape.json_decode(self.request.body)
        if 'item_id' not in body or 'contents' not in body or 'completed' not in body:
            raise tornado.web.HTTPError(400)
        item_id = body['item_id']
        contents = body['contents']
        last_edited = str(datetime.now())
        completed = body['completed']

        # edit the entry in the DB
        with database.cursor() as cursor:
            sql = "UPDATE list_items SET contents=%s, last_edited=%s, completed=%s WHERE item_id = %s"
            cursor.execute(sql, (contents, last_edited, completed, item_id))

class DeleteItemHandler(tornado.web.RequestHandler):
    def delete(self):
         # check for correct arguments, error if something is wrong
        body = tornado.escape.json_decode(self.request.body)
        if 'item_id' not in body:
            raise tornado.web.HTTPError(400)
        item_id = body['item_id']

        # delete the entry in the DB
        with database.cursor() as cursor:
            sql = "DELETE FROM list_items WHERE item_id = %s"
            cursor.execute(sql, (item_id))

def make_app():
    return tornado.web.Application([
        (r"/", MainHandler),
        (r"/api/get-items", GetItemsHandler),
        (r"/api/new-item", NewItemHandler),
        (r"/api/edit-item", EditItemHandler),
        (r"/api/delete-item", DeleteItemHandler),
        ])


def options(self, *args, **kwargs):
    """
    Default OPTIONS request response for all handlers
    This overrides CORS so that the UI is test-able
    NOTE: ONLY USE LOCALLY!
    """
    # if running locally, disable CORS protections
    if ApiHandler.localhost:
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        self.set_header('Access-Control-Allow-Credentials', 'true')
        self.add_header('Vary', 'Origin')


if __name__ == "__main__":
    app = make_app()
    app.listen(8888)
    tornado.ioloop.IOLoop.current().start()
