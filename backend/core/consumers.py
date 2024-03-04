from channels.generic.websocket import WebsocketConsumer
from pandas import pd 

import json

class DataframeWebsocketHandler(WebsocketConsumer):
    def connect(self):
        self.accept()
        self.df = pd.DataFrame(data=d) # your own implementation here.

        # send your initial data
        self.send(text_data=json.dumps({
            'data': self.df
        }))

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        text_data_json = json.loads(text_data)

        # you will receive actions to perform here 
        # all actions you take on self.df will persist until websocket is closed
        operation = text_data_json['operation']
        perform_operation(self.df,operation)

        # send changed data to the client
        self.send(text_data=json.dumps({
            'data': self.df
        }))